'use strict';

const path = require('path');
const { fetchUserRepos, fetchSingleRepo } = require('./githubService');
const { checkGitAvailable, cloneRepo, removeDirectory, directoryExists } = require('./gitService');
const { addLog, isRepoCloned, markRepoCloned, setRepositoryLastChecked,
  getSetting, setSetting, getEnabledRepositories, updateRepository } = require('../database/repositories');
const { sanitizeFsName, expandPath } = require('../utils/helpers');
const notificationService = require('./notificationService');

let _isRunning = false;

function isRunning() {
  return _isRunning;
}

/**
 * Main clone job — processes all enabled repositories.
 * Returns a summary: { cloned, skipped, failed, errors }
 */
async function runCloneJob(progressCallback) {
  if (_isRunning) {
    throw new Error('A clone operation is already running. Please wait until it finishes.');
  }

  _isRunning = true;

  const summary = { cloned: 0, skipped: 0, failed: 0, errors: [] };

  try {
    // Check git
    const gitCheck = await checkGitAvailable();
    if (!gitCheck.available) {
      _isRunning = false;
      throw new Error('GIT_NOT_FOUND');
    }

    const token = getSetting('github_token') || '';
    const baseDir = expandPath(getSetting('clone_directory') || '%USERPROFILE%\\Downloads');
    const entries = getEnabledRepositories();

    if (entries.length === 0) {
      _isRunning = false;
      return { ...summary, message: 'No enabled repositories configured.' };
    }

    if (progressCallback) progressCallback({ type: 'start', total: entries.length });

    for (const entry of entries) {
      try {
        await processEntry(entry, token, baseDir, summary, progressCallback);
      } catch (err) {
        summary.failed++;
        summary.errors.push({ source: entry.source, error: err.message });
        addLog({
          repositoryId: entry.id,
          repositoryName: entry.source,
          action: 'check',
          status: 'failed',
          message: err.message
        });
        if (progressCallback) progressCallback({ type: 'error', source: entry.source, error: err.message });
      }

      setRepositoryLastChecked(entry.id);
    }

    // Update last check time
    const now = new Date().toISOString();
    const intervalMs = parseInt(getSetting('check_interval_ms') || String(60 * 60 * 1000));
    const next = new Date(Date.now() + intervalMs).toISOString();
    setSetting('last_check_time', now);
    setSetting('next_check_time', next);

    if (progressCallback) progressCallback({ type: 'done', summary });

    notificationService.showCloneSummary(summary);

    return summary;
  } finally {
    _isRunning = false;
  }
}

async function processEntry(entry, token, baseDir, summary, progressCallback) {
  const { id, type, username, repository_name } = entry;
  const overwriteExisting = getSetting('overwrite_existing') !== '0';

  if (type === 'repo') {
    // Single repository entry
    const repoFullName = `${username}/${repository_name}`;
    const repoUrl = `https://github.com/${repoFullName}.git`;
    const destPath = path.join(baseDir, sanitizeFsName(username), sanitizeFsName(repository_name));

    const alreadyCloned = isRepoCloned(id, repoFullName);
    const fsExists = directoryExists(destPath);

    if (fsExists) {
      if (!overwriteExisting) {
        summary.skipped++;
        addLog({ repositoryId: id, repositoryName: repoFullName, repositoryUrl: repoUrl, action: 'check', status: 'skipped', message: 'Target directory already exists (overwrite disabled)' });
        if (progressCallback) progressCallback({ type: 'skip', repo: repoFullName });
        return;
      } else {
        // Overwrite enabled: clean destination before re-cloning
        await removeDirectory(destPath);
      }
    } else if (alreadyCloned) {
      addLog({ repositoryId: id, repositoryName: repoFullName, repositoryUrl: repoUrl, action: 'clone', status: 'info', message: 'Previously cloned but directory missing — re-cloning' });
    }

    await performClone(id, repoFullName, repoUrl, destPath, token, summary, progressCallback);

  } else {
    // User entry — fetch all repos
    if (progressCallback) progressCallback({ type: 'fetching', source: username });

    const repos = await fetchUserRepos(username, token);
    updateRepository(id, { status: 'active' });

    for (const repo of repos) {
      const repoFullName = repo.full_name;
      const repoUrl = repo.clone_url;
      const destPath = path.join(baseDir, sanitizeFsName(username), sanitizeFsName(repo.name));

      const alreadyCloned = isRepoCloned(id, repoFullName);
      const fsExists = directoryExists(destPath);

      if (fsExists) {
        if (!overwriteExisting) {
          summary.skipped++;
          if (progressCallback) progressCallback({ type: 'skip', repo: repoFullName });
          continue;
        } else {
          // Overwrite enabled
          await removeDirectory(destPath);
        }
      } else if (alreadyCloned) {
        // Repo was marked cloned but not on disk
      }

      try {
        await performClone(id, repoFullName, repoUrl, destPath, token, summary, progressCallback);
      } catch (err) {
        summary.failed++;
        addLog({ repositoryId: id, repositoryName: repoFullName, repositoryUrl: repoUrl, action: 'clone', status: 'failed', message: err.message });
        if (progressCallback) progressCallback({ type: 'error', repo: repoFullName, error: err.message });
      }
    }
  }
}

async function performClone(repoId, repoFullName, repoUrl, destPath, token, summary, progressCallback) {
  if (progressCallback) progressCallback({ type: 'cloning', repo: repoFullName });

  try {
    await cloneRepo(repoUrl, destPath, token, (line) => {
      if (progressCallback) progressCallback({ type: 'progress', repo: repoFullName, line });
    });

    markRepoCloned(repoId, repoFullName, destPath);
    summary.cloned++;

    addLog({
      repositoryId: repoId,
      repositoryName: repoFullName,
      repositoryUrl: repoUrl,
      action: 'clone',
      status: 'success',
      message: `Cloned to ${destPath}`
    });

    if (progressCallback) progressCallback({ type: 'cloned', repo: repoFullName, destPath });
  } catch (err) {
    throw err;
  }
}

/**
 * Overwrite-clone: delete existing dir then clone fresh.
 */
async function overwriteClone(entry, repoFullName, repoUrl, destPath, token) {
  if (_isRunning) throw new Error('A clone operation is already running.');
  _isRunning = true;

  try {
    const gitCheck = await checkGitAvailable();
    if (!gitCheck.available) throw new Error('GIT_NOT_FOUND');

    await removeDirectory(destPath);
    await cloneRepo(repoUrl, destPath, token, null);

    markRepoCloned(entry.id, repoFullName, destPath);
    addLog({
      repositoryId: entry.id,
      repositoryName: repoFullName,
      repositoryUrl: repoUrl,
      action: 'overwrite',
      status: 'success',
      message: `Overwritten and re-cloned to ${destPath}`
    });

    return { success: true };
  } finally {
    _isRunning = false;
  }
}

module.exports = { runCloneJob, overwriteClone, isRunning };
