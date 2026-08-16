'use strict';

const { runCloneJob, isRunning } = require('./cloneService');
const { getSetting, setSetting, getPendingScheduledJobs, markScheduledJobDone } = require('../database/repositories');
const notificationService = require('./notificationService');

let _schedulerTimer = null;
let _scheduledJobTimer = null;

/**
 * Initialize the scheduler on app startup.
 * Checks if a run is overdue; if so, runs immediately.
 * Then schedules the next run.
 */
async function initScheduler(sendToRenderer) {
  const autoChecking = getSetting('auto_checking');
  if (autoChecking !== '1') return;

  const lastCheckRaw = getSetting('last_check_time');
  const intervalMs = parseInt(getSetting('check_interval_ms') || String(60 * 60 * 1000));

  let delay = 0;

  if (lastCheckRaw) {
    const lastCheck = new Date(lastCheckRaw).getTime();
    const now = Date.now();
    const elapsed = now - lastCheck;
    if (elapsed >= intervalMs) {
      // Overdue — run after a short delay to let app finish loading
      delay = 5000;
    } else {
      delay = intervalMs - elapsed;
    }
  } else {
    // First run ever — run after 10 seconds
    delay = 10000;
  }

  scheduleNextRun(delay, intervalMs, sendToRenderer);
  scheduleJobTimer(sendToRenderer);
}

function scheduleNextRun(delay, intervalMs, sendToRenderer) {
  if (_schedulerTimer) clearTimeout(_schedulerTimer);

  _schedulerTimer = setTimeout(async () => {
    const autoChecking = getSetting('auto_checking');
    if (autoChecking !== '1') return;

    if (!isRunning()) {
      try {
        if (sendToRenderer) sendToRenderer({ type: 'scheduler', event: 'start' });
        await runCloneJob((progress) => {
          if (sendToRenderer) sendToRenderer({ type: 'cloneProgress', data: progress });
        });
        if (sendToRenderer) sendToRenderer({ type: 'scheduler', event: 'done' });
      } catch (err) {
        notificationService.showError(err.message);
        if (sendToRenderer) sendToRenderer({ type: 'scheduler', event: 'error', error: err.message });
      }
    }

    // Schedule next
    scheduleNextRun(intervalMs, intervalMs, sendToRenderer);
  }, delay);
}

/**
 * Check for scheduled jobs every minute.
 */
function scheduleJobTimer(sendToRenderer) {
  if (_scheduledJobTimer) clearInterval(_scheduledJobTimer);

  _scheduledJobTimer = setInterval(async () => {
    const jobs = getPendingScheduledJobs();
    for (const job of jobs) {
      markScheduledJobDone(job.id);
      try {
        if (!isRunning()) {
          notificationService.showInfo('GitHub Auto Cloner', `Running scheduled clone: ${job.label}`);
          if (sendToRenderer) sendToRenderer({ type: 'scheduler', event: 'scheduledStart', job });
          await runCloneJob((progress) => {
            if (sendToRenderer) sendToRenderer({ type: 'cloneProgress', data: progress });
          });
          if (sendToRenderer) sendToRenderer({ type: 'scheduler', event: 'scheduledDone', job });
        }
      } catch (err) {
        notificationService.showError(`Scheduled clone failed: ${err.message}`);
      }
    }
  }, 60 * 1000); // check every minute
}

function stopScheduler() {
  if (_schedulerTimer) { clearTimeout(_schedulerTimer); _schedulerTimer = null; }
  if (_scheduledJobTimer) { clearInterval(_scheduledJobTimer); _scheduledJobTimer = null; }
}

/**
 * Restart the scheduler (e.g., after settings change).
 */
async function restartScheduler(sendToRenderer) {
  stopScheduler();
  await initScheduler(sendToRenderer);
}

module.exports = { initScheduler, stopScheduler, restartScheduler };
