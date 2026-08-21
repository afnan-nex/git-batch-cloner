'use strict';

const { app, BrowserWindow, Menu, nativeTheme } = require('electron');
const path = require('path');

// Disable the default application menu completely (removes File, Edit, View, Window, Help)
Menu.setApplicationMenu(null);

// Single-instance lock
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
  process.exit(0);
}

const { initDb, getDb, closeDb } = require('../database/database');
const { getSetting, setSetting } = require('../database/repositories');
const { createTray, destroyTray } = require('./tray');
const { setupIpc } = require('./ipc');
const { initScheduler, stopScheduler } = require('../services/schedulerService');
const { runCloneJob, isRunning } = require('../services/cloneService');
const { setStartWithWindows } = require('./startup');

let mainWindow = null;
let tray = null;
let isQuitting = false;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 740,
    minWidth: 800,
    minHeight: 600,
    show: false,
    frame: true,
    autoHideMenuBar: true,
    backgroundColor: '#1a1a2e',
    icon: path.join(__dirname, '..', '..', 'assets', 'icons', 'app.ico'),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, '..', 'renderer', 'preload.js'),
      sandbox: false // Required for preload with contextBridge
    },
    title: 'Git Batch Cloner'
  });

  mainWindow.setMenuBarVisibility(false);
  mainWindow.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'));

  mainWindow.once('ready-to-show', () => {
    const loginSettings = app.getLoginItemSettings();
    const isHidden = process.argv.includes('--hidden') || loginSettings.wasOpenedAsHidden;
    if (!isHidden) {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  // Hide instead of close (tray app)
  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      const minimizeToTray = getSetting('minimize_to_tray');
      if (minimizeToTray !== '0') {
        event.preventDefault();
        mainWindow.hide();
      }
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  return mainWindow;
}

function showMainWindow(page) {
  if (!mainWindow || mainWindow.isDestroyed()) {
    createMainWindow();
  }
  if (mainWindow.isMinimized()) {
    mainWindow.restore();
  }
  mainWindow.show();
  mainWindow.focus();
  if (page) {
    mainWindow.webContents.send('navigate', page);
  }
}

function sendToRenderer(data) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('main:event', data);
  }
}

app.whenReady().then(async () => {
  // Initialize DB
  await initDb();

  // Apply startup setting
  const startWithWindows = getSetting('start_with_windows');
  setStartWithWindows(startWithWindows !== '0');

  // Create window (hidden initially)
  createMainWindow();

  // Setup IPC
  setupIpc(mainWindow, sendToRenderer);

  // Create tray
  tray = createTray(
    app,
    showMainWindow,
    async () => {
      // Clone Now from tray
      if (isRunning()) {
        sendToRenderer({ type: 'snackbar', message: 'Clone already running. Please wait.' });
        return;
      }
      showMainWindow('dashboard');
      sendToRenderer({ type: 'clone:start' });
      try {
        await runCloneJob((p) => sendToRenderer({ type: 'cloneProgress', data: p }));
        sendToRenderer({ type: 'clone:done' });
      } catch (err) {
        sendToRenderer({ type: 'clone:error', error: err.message });
      }
    },
    () => {
      showMainWindow('schedule');
      mainWindow.webContents.send('navigate', 'schedule');
      mainWindow.webContents.send('openScheduleDialog', true);
    },
    () => {
      isQuitting = true;
      app.quit();
    }
  );

  // Start scheduler
  await initScheduler(sendToRenderer);

  // Show window if not started hidden (e.g. from Windows startup)
  const loginSettings = app.getLoginItemSettings();
  const isHidden = process.argv.includes('--hidden') || loginSettings.wasOpenedAsHidden;
  if (!isHidden) {
    showMainWindow();
  }

  // Handle second instance
  app.on('second-instance', () => {
    showMainWindow();
  });

  // macOS: reopen window when dock icon clicked
  app.on('activate', () => {
    if (!mainWindow) createMainWindow();
    mainWindow.show();
  });
});

app.on('before-quit', () => {
  isQuitting = true;
  stopScheduler();
  destroyTray();
  closeDb();
});

// Don't quit when all windows are closed (tray app)
app.on('window-all-closed', (e) => {
  if (process.platform !== 'darwin' && !isQuitting) {
    e.preventDefault();
  }
});

// Forward system theme changes to renderer
nativeTheme.on('updated', () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('system:themeChanged', {
      dark: nativeTheme.shouldUseDarkColors
    });
  }
});
