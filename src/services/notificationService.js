'use strict';

const { Notification } = require('electron');

function showCloneSummary(summary) {
  const { cloned, skipped, failed } = summary;
  const total = cloned + skipped + failed;
  if (total === 0) return;

  // Only notify if something was cloned or failed
  if (cloned === 0 && failed === 0) return;

  const parts = [];
  if (cloned > 0) parts.push(`${cloned} cloned`);
  if (skipped > 0) parts.push(`${skipped} skipped`);
  if (failed > 0) parts.push(`${failed} failed`);

  try {
    const n = new Notification({
      title: 'Git Cloner',
      body: `Repository check completed.\n${parts.join(' · ')}`
    });
    n.show();
  } catch {
    // Notifications not supported in this environment — silently ignore
  }
}

function showError(message) {
  try {
    const n = new Notification({
      title: 'Git Cloner — Error',
      body: message
    });
    n.show();
  } catch {}
}

function showInfo(title, body) {
  try {
    const n = new Notification({ title, body });
    n.show();
  } catch {}
}

module.exports = { showCloneSummary, showError, showInfo };
