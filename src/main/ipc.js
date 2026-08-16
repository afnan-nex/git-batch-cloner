'use strict';

const { ipcMain, dialog, shell } = require('electron');
const path = require('path');
const {
  getAllRepositories, addRepository, updateRepository, deleteRepository,
  getAllSettings, getSetting, setSetting,
  getLogs, clearLogs, addLog,
  addScheduledJob, getAllScheduledJobs, deleteScheduledJob,
  getClonedReposForEntry
} = require('../database/repositories');
const { parseGitHubInput, expandPath } = require('../utils/helpers');
const { runCloneJob, overwriteClone, isRunning } = require('../services/cloneService');
const { checkGitAvailable, directoryExists } = require('../services/gitService');
const { verifyToken } = require('../services/githubService');
const { setStartWithWindows, getStartWithWindows } = require('./startup');
const { restartScheduler } = require('../services/schedulerService');

let _mainWindow = null;
let _sendToRenderer = null;

function setupIpc(mainWindow, sendToRenderer) {
  _mainWindow = mainWindow;
  _sendToRenderer = sendToRenderer;
}

// ─── Repositories ─────────────────────────────────────────────────────────────

ipcMain.handle('repos:getAll', async () => {
  return getAllRepositories();
});

ipcMain.handle('repos:add', async (event, input) => {
  if (!input || typeof input !== 'string') throw new Error('Invalid input');
  const parsed = parseGitHubInput(input.trim());
  if (!parsed) throw new Error('Invalid GitHub URL or username. Enter a valid username, https://github.com/username, or https://github.com/username/repo');

  const source = parsed.type === 'repo'
    ? `${parsed.username}/${parsed.repoName}`
    : parsed.username;

  const cloneDirectory = getSetting('clone_directory') || '%USERPROFILE%\\Downloads';

  const id = addRepository({
    source,
    type: parsed.type,
    username: parsed.username,
    repoName: parsed.repoName || null,
    clonePath: expandPath(cloneDirectory)
  });

  addLog({ action: 'add', status: 'success', repositoryName: source, message: `Added ${parsed.type}: ${source}` });
  return { id, source, type: parsed.type, username: parsed.username, repoName: parsed.repoName };
});

ipcMain.handle('repos:update', async (event, id, fields) => {
  if (!id || typeof id !== 'number') throw new Error('Invalid id');
  const allowed = ['enabled', 'clone_path', 'source'];
  const sanitized = {};
  for (const k of allowed) {
    if (fields[k] !== undefined) sanitized[k] = fields[k];
  }
  updateRepository(id, sanitized);
  return true;
});

ipcMain.handle('repos:delete', async (event, id) => {
  if (!id || typeof id !== 'number') throw new Error('Invalid id');
  deleteRepository(id);
  return true;
});

ipcMain.handle('repos:getCloneHistory', async (event, id) => {
  return getClonedReposForEntry(id);
});

// ─── Clone ────────────────────────────────────────────────────────────────────

ipcMain.handle('clone:isRunning', async () => isRunning());

ipcMain.handle('clone:runNow', async () => {
  if (isRunning()) {
    throw new Error('A clone operation is already running. Please wait until it finishes.');
  }

  const gitCheck = await checkGitAvailable();
  if (!gitCheck.available) {
    throw new Error('GIT_NOT_FOUND');
  }

  // Run async — progress sent via event
  runCloneJob((progress) => {
    if (_mainWindow && !_mainWindow.isDestroyed()) {
      _mainWindow.webContents.send('clone:progress', progress);
    }
  }).then((summary) => {
    if (_mainWindow && !_mainWindow.isDestroyed()) {
      _mainWindow.webContents.send('clone:done', summary);
    }
  }).catch((err) => {
    if (_mainWindow && !_mainWindow.isDestroyed()) {
      _mainWindow.webContents.send('clone:error', err.message);
    }
  });

  return { started: true };
});

ipcMain.handle('clone:overwrite', async (event, repoId, repoFullName, repoUrl, destPath) => {
  const token = getSetting('github_token') || '';
  const entry = { id: repoId };
  return await overwriteClone(entry, repoFullName, repoUrl, destPath, token);
});

ipcMain.handle('clone:checkGit', async () => {
  return await checkGitAvailable();
});

ipcMain.handle('clone:checkDirExists', async (event, dirPath) => {
  return directoryExists(dirPath);
});

// ─── Settings ─────────────────────────────────────────────────────────────────

ipcMain.handle('settings:getAll', async () => getAllSettings());

ipcMain.handle('settings:set', async (event, key, value) => {
  const allowed = [
    'theme', 'start_with_windows', 'minimize_to_tray',
    'auto_checking', 'check_interval_ms', 'clone_directory',
    'github_token', 'last_check_time', 'next_check_time'
  ];
  if (!allowed.includes(key)) throw new Error(`Setting "${key}" not allowed`);

  setSetting(key, value);

  // Side effects
  if (key === 'start_with_windows') {
    setStartWithWindows(value === '1');
  }
  if (key === 'auto_checking' || key === 'check_interval_ms') {
    await restartScheduler(_sendToRenderer);
  }

  return true;
});

ipcMain.handle('settings:getStartWithWindows', async () => getStartWithWindows());

// ─── GitHub ───────────────────────────────────────────────────────────────────

ipcMain.handle('github:verifyToken', async (event, token) => {
  if (!token || typeof token !== 'string') throw new Error('Token is required');
  return await verifyToken(token.trim());
});

// ─── Logs ─────────────────────────────────────────────────────────────────────

ipcMain.handle('logs:getAll', async (event, filters) => getLogs(filters || {}));
ipcMain.handle('logs:clear', async () => { clearLogs(); return true; });

// ─── Scheduler ────────────────────────────────────────────────────────────────

ipcMain.handle('schedule:add', async (event, data) => {
  if (!data.scheduledAt) throw new Error('scheduledAt is required');
  return addScheduledJob(data);
});

ipcMain.handle('schedule:getAll', async () => getAllScheduledJobs());
ipcMain.handle('schedule:delete', async (event, id) => { deleteScheduledJob(id); return true; });

// ─── System ───────────────────────────────────────────────────────────────────

ipcMain.handle('system:openFolder', async (event, folderPath) => {
  try {
    await shell.openPath(folderPath);
    return true;
  } catch {
    return false;
  }
});

ipcMain.handle('system:browsePath', async () => {
  const result = await dialog.showOpenDialog(_mainWindow, {
    properties: ['openDirectory'],
    title: 'Select Clone Directory'
  });
  if (result.canceled) return null;
  return result.filePaths[0] || null;
});

ipcMain.handle('system:showWindow', async (event, page) => {
  if (_mainWindow) {
    _mainWindow.show();
    _mainWindow.focus();
    if (page) {
      _mainWindow.webContents.send('navigate', page);
    }
  }
  return true;
});

module.exports = { setupIpc };
