'use strict';

const { app } = require('electron');

/**
 * Enable or disable Windows startup.
 * Uses Electron's built-in setLoginItemSettings (no registry hacks needed).
 */
function setStartWithWindows(enabled) {
  app.setLoginItemSettings({
    openAtLogin: enabled,
    openAsHidden: true,
    name: 'Git Cloner'
  });
}

function getStartWithWindows() {
  const settings = app.getLoginItemSettings({ name: 'GitHub Auto Cloner' });
  return settings.openAtLogin;
}

module.exports = { setStartWithWindows, getStartWithWindows };
