'use strict';

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

/**
 * Check whether Git is available in PATH.
 * Resolves with { available: true, version } or { available: false, error }.
 */
function checkGitAvailable() {
  return new Promise((resolve) => {
    const proc = spawn('git', ['--version'], { shell: true });
    let output = '';
    proc.stdout.on('data', d => (output += d.toString()));
    proc.on('error', () => resolve({ available: false, error: 'Git not found in PATH' }));
    proc.on('close', (code) => {
      if (code === 0) {
        resolve({ available: true, version: output.trim() });
      } else {
        resolve({ available: false, error: 'git --version exited with non-zero code' });
      }
    });
    setTimeout(() => { proc.kill(); resolve({ available: false, error: 'git --version timed out' }); }, 8000);
  });
}

/**
 * Clone a repository.
 * @param {string} repoUrl - HTTPS clone URL
 * @param {string} destPath - Absolute destination directory
 * @param {string|null} token - GitHub token for private repos
 * @param {function} onProgress - Called with progress lines
 * @returns {Promise<void>}
 */
function cloneRepo(repoUrl, destPath, token, onProgress) {
  return new Promise((resolve, reject) => {
    let cloneUrl = repoUrl;

    // Inject token for private repos: https://token@github.com/...
    if (token && repoUrl.startsWith('https://github.com/')) {
      cloneUrl = repoUrl.replace('https://github.com/', `https://${token}@github.com/`);
    }

    // Ensure parent directory exists
    const parentDir = path.dirname(destPath);
    fs.mkdirSync(parentDir, { recursive: true });

    const args = ['clone', '--progress', cloneUrl, destPath];
    const proc = spawn('git', args, { shell: true, env: { ...process.env } });

    let stderr = '';
    let stdout = '';

    proc.stdout.on('data', (data) => {
      const line = data.toString();
      stdout += line;
      if (onProgress) onProgress(line.trim());
    });

    proc.stderr.on('data', (data) => {
      // git clone sends progress to stderr
      const line = data.toString();
      stderr += line;
      if (onProgress) onProgress(line.trim());
    });

    proc.on('error', (err) => {
      reject(new Error(`Failed to start git: ${err.message}`));
    });

    proc.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        // Sanitize token from error messages
        const sanitized = stderr.replace(/https:\/\/[^@]+@/g, 'https://***@');
        reject(new Error(`git clone failed (exit ${code}): ${sanitized.substring(0, 500)}`));
      }
    });
  });
}

/**
 * Recursively delete a directory, handling read-only files (common in .git/).
 */
function removeDirectory(dirPath) {
  return new Promise((resolve, reject) => {
    try {
      // Node 16+ has fs.rmSync with force+recursive
      fs.rmSync(dirPath, { recursive: true, force: true });
      resolve();
    } catch (err) {
      reject(new Error(`Failed to remove directory: ${err.message}`));
    }
  });
}

/**
 * Check whether a directory exists and is non-empty.
 */
function directoryExists(dirPath) {
  try {
    const stat = fs.statSync(dirPath);
    if (!stat.isDirectory()) return false;
    const entries = fs.readdirSync(dirPath);
    return entries.length > 0;
  } catch {
    return false;
  }
}

module.exports = { checkGitAvailable, cloneRepo, removeDirectory, directoryExists };
