'use strict';

const { contextBridge, ipcRenderer } = require('electron');

// Safe wrapper: invoke IPC, let errors bubble to renderer
function invoke(channel, ...args) {
  return ipcRenderer.invoke(channel, ...args);
}

// Expose a clean, minimal API surface — no require/fs/child_process exposed
contextBridge.exposeInMainWorld('api', {
  // Repositories
  repos: {
    getAll: () => invoke('repos:getAll'),
    add: (input) => invoke('repos:add', input),
    update: (id, fields) => invoke('repos:update', id, fields),
    delete: (id) => invoke('repos:delete', id),
    getCloneHistory: (id) => invoke('repos:getCloneHistory', id)
  },

  // Clone
  clone: {
    isRunning: () => invoke('clone:isRunning'),
    runNow: () => invoke('clone:runNow'),
    overwrite: (repoId, repoFullName, repoUrl, destPath) =>
      invoke('clone:overwrite', repoId, repoFullName, repoUrl, destPath),
    checkGit: () => invoke('clone:checkGit'),
    checkDirExists: (p) => invoke('clone:checkDirExists', p)
  },

  // Settings
  settings: {
    getAll: () => invoke('settings:getAll'),
    set: (key, value) => invoke('settings:set', key, value),
    getStartWithWindows: () => invoke('settings:getStartWithWindows')
  },

  // GitHub
  github: {
    verifyToken: (token) => invoke('github:verifyToken', token)
  },

  // Logs
  logs: {
    getAll: (filters) => invoke('logs:getAll', filters),
    clear: () => invoke('logs:clear')
  },

  // Schedule
  schedule: {
    add: (data) => invoke('schedule:add', data),
    getAll: () => invoke('schedule:getAll'),
    delete: (id) => invoke('schedule:delete', id)
  },

  // System
  system: {
    openFolder: (p) => invoke('system:openFolder', p),
    browsePath: () => invoke('system:browsePath'),
    showWindow: (page) => invoke('system:showWindow', page)
  },

  // Event listeners from main
  on: (channel, callback) => {
    const allowed = [
      'clone:progress', 'clone:done', 'clone:error',
      'main:event', 'navigate', 'openScheduleDialog',
      'system:themeChanged'
    ];
    if (!allowed.includes(channel)) return;
    const wrapped = (event, ...args) => callback(...args);
    ipcRenderer.on(channel, wrapped);
    return () => ipcRenderer.removeListener(channel, wrapped);
  }
});
