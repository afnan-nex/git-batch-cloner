'use strict';

const { Tray, Menu, nativeImage } = require('electron');
const path = require('path');

let _tray = null;

function getTrayIcon(name) {
  try {
    const p = path.join(__dirname, '..', '..', 'assets', 'icons', 'tray', `${name}.png`);
    return nativeImage.createFromPath(p).resize({ width: 16, height: 16 });
  } catch {
    return undefined;
  }
}

function createTray(app, showWindow, onCloneNow, onScheduleAt, onExit) {
  const iconPath = path.join(__dirname, '..', '..', 'assets', 'icons', 'tray.ico');
  let icon;
  try {
    icon = nativeImage.createFromPath(iconPath);
  } catch {
    icon = nativeImage.createEmpty();
  }

  _tray = new Tray(icon);
  _tray.setToolTip('Git Cloner');

  updateContextMenu(_tray, showWindow, onCloneNow, onScheduleAt, onExit);

  _tray.on('double-click', () => {
    showWindow('dashboard');
  });

  return _tray;
}

function updateContextMenu(tray, showWindow, onCloneNow, onScheduleAt, onExit) {
  const menu = Menu.buildFromTemplate([
    {
      label: 'Open Dashboard',
      icon: getTrayIcon('dashboard'),
      click: () => showWindow('dashboard')
    },
    { type: 'separator' },
    {
      label: 'Clone Now',
      icon: getTrayIcon('sync'),
      click: onCloneNow
    },
    { type: 'separator' },
    {
      label: 'Edit Repositories',
      icon: getTrayIcon('repo'),
      click: () => showWindow('repositories')
    },
    {
      label: 'Scheduled Clones',
      icon: getTrayIcon('schedule'),
      click: onScheduleAt
    },
    {
      label: 'Activity Logs',
      icon: getTrayIcon('logs'),
      click: () => showWindow('logs')
    },
    {
      label: 'Settings',
      icon: getTrayIcon('settings'),
      click: () => showWindow('settings')
    },
    { type: 'separator' },
    {
      label: 'Exit App',
      icon: getTrayIcon('exit'),
      click: onExit
    }
  ]);

  tray.setContextMenu(menu);
}

function destroyTray() {
  if (_tray) {
    _tray.destroy();
    _tray = null;
  }
}

module.exports = { createTray, destroyTray };
