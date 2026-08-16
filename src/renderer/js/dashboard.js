/**
 * dashboard.js — Dashboard page rendering and logic
 */

let cloneIsRunning = false;
let progressLines = [];

function renderDashboard() {
  renderDashboardActions();
  renderDashboardBody();
}

function renderDashboardActions() {
  const el = document.getElementById('dashboard-actions');
  if (!el) return;
  el.innerHTML = '';

  const cloneBtn = document.createElement('button');
  cloneBtn.id = 'dashboard-clone-now';
  cloneBtn.className = 'md-btn md-btn-filled md-btn-icon';
  cloneBtn.setAttribute('aria-label', 'Clone Now');
  cloneBtn.title = 'Clone all enabled repositories now';
  cloneBtn.innerHTML = UI.iconHtml('sync', '18px') + '<span>Clone Now</span>';
  cloneBtn.addEventListener('click', onCloneNow);
  el.appendChild(cloneBtn);
}

function renderDashboardBody() {
  const body = document.getElementById('dashboard-body');
  if (!body) return;

  body.innerHTML = '';

  // Status card + stats row
  const grid = document.createElement('div');
  grid.className = 'dashboard-grid';

  // Left: Status
  const statusCard = document.createElement('div');
  statusCard.className = 'md-card md-card-outlined';
  statusCard.id = 'dashboard-status-card';
  grid.appendChild(statusCard);

  // Right: Stats
  const statsCard = document.createElement('div');
  statsCard.className = 'md-card md-card-outlined';
  statsCard.id = 'dashboard-stats-card';
  grid.appendChild(statsCard);

  // Quick actions — full row
  const actionsCard = document.createElement('div');
  actionsCard.className = 'md-card md-card-outlined dashboard-grid-full';
  actionsCard.id = 'dashboard-quick-card';
  grid.appendChild(actionsCard);

  // Progress area — full row
  const progressArea = document.createElement('div');
  progressArea.className = 'clone-progress-area dashboard-grid-full';
  progressArea.id = 'clone-progress-area';
  grid.appendChild(progressArea);

  body.appendChild(grid);

  renderStatusCard();
  renderStatsCard();
  renderQuickActions();
  renderProgressArea();
}

async function renderStatusCard() {
  const card = document.getElementById('dashboard-status-card');
  if (!card) return;

  card.innerHTML = `
    <div class="card-header">
      <span class="card-title">${UI.iconHtml('running', '20px')} <span>Status</span></span>
    </div>
    <div class="status-row" id="status-rows">
      <div class="status-item">
        <span class="status-label">Application</span>
        <span class="md-status md-status-running" style="font-size:14px;font-weight:500">
          <span class="md-status-dot"></span>Running
        </span>
      </div>
      <div class="status-item">
        <span class="status-label">Last Check</span>
        <span class="status-value" id="status-last-check">Loading...</span>
      </div>
      <div class="status-item">
        <span class="status-label">Next Check</span>
        <span class="status-value" id="status-next-check">Loading...</span>
      </div>
      <div class="status-item">
        <span class="status-label">Auto-Check</span>
        <span class="status-value" id="status-auto-check">--</span>
      </div>
    </div>
  `;

  try {
    const settings = await window.api.settings.getAll();
    const last = document.getElementById('status-last-check');
    const next = document.getElementById('status-next-check');
    const auto = document.getElementById('status-auto-check');
    if (last) last.textContent = UI.formatDate(settings.last_check_time);
    if (next) next.textContent = UI.formatDate(settings.next_check_time);
    if (auto) auto.textContent = settings.auto_checking === '1' ? 'Enabled' : 'Disabled';
  } catch {}
}

async function renderStatsCard() {
  const card = document.getElementById('dashboard-stats-card');
  if (!card) return;

  card.innerHTML = `
    <div class="card-header">
      <span class="card-title">${UI.iconHtml('repos', '20px')} <span>Statistics</span></span>
    </div>
    <div class="stat-grid" id="stat-grid"></div>
  `;

  try {
    const repos = await window.api.repos.getAll();
    const logs = await window.api.logs.getAll({ status: 'success' });
    const skipped = await window.api.logs.getAll({ status: 'skipped' });
    const failed = await window.api.logs.getAll({ status: 'failed' });

    const grid = document.getElementById('stat-grid');
    if (!grid) return;

    const stats = [
      { label: 'Repositories', value: repos.length, icon: 'repos' },
      { label: 'Cloned', value: logs.length, icon: 'check_circle' },
      { label: 'Skipped', value: skipped.length, icon: 'skip_next' },
      { label: 'Failed', value: failed.length, icon: 'error' }
    ];

    grid.innerHTML = stats.map(s => `
      <div class="stat-card">
        <span class="stat-card-icon">${UI.iconHtml(s.icon, '28px')}</span>
        <div class="stat-card-value">${s.value}</div>
        <div class="stat-card-label">${UI.escapeHtml(s.label)}</div>
      </div>
    `).join('');
  } catch (e) {
    console.error('Stats error:', e);
  }
}

function renderQuickActions() {
  const card = document.getElementById('dashboard-quick-card');
  if (!card) return;

  card.innerHTML = `
    <div class="card-header">
      <span class="card-title">${UI.iconHtml('star', '20px')} <span>Quick Actions</span></span>
    </div>
    <div class="quick-actions">
      <button class="md-btn md-btn-filled md-btn-icon" id="qa-clone" aria-label="Clone Now">
        ${UI.iconHtml('sync', '18px')}<span>Clone Now</span>
      </button>
      <button class="md-btn md-btn-tonal md-btn-icon" id="qa-repos" aria-label="Manage Repositories">
        ${UI.iconHtml('repos', '18px')}<span>Manage Repositories</span>
      </button>
      <button class="md-btn md-btn-tonal md-btn-icon" id="qa-schedule" aria-label="Schedule">
        ${UI.iconHtml('schedule', '18px')}<span>Schedule</span>
      </button>
      <button class="md-btn md-btn-tonal md-btn-icon" id="qa-logs" aria-label="View Logs">
        ${UI.iconHtml('logs', '18px')}<span>View Logs</span>
      </button>
      <button class="md-btn md-btn-outlined md-btn-icon" id="qa-settings" aria-label="Settings">
        ${UI.iconHtml('settings', '18px')}<span>Settings</span>
      </button>
    </div>
  `;

  document.getElementById('qa-clone')?.addEventListener('click', onCloneNow);
  document.getElementById('qa-repos')?.addEventListener('click', () => App.navigateTo('repositories'));
  document.getElementById('qa-schedule')?.addEventListener('click', () => App.navigateTo('schedule'));
  document.getElementById('qa-logs')?.addEventListener('click', () => App.navigateTo('logs'));
  document.getElementById('qa-settings')?.addEventListener('click', () => App.navigateTo('settings'));
}

function renderProgressArea() {
  const area = document.getElementById('clone-progress-area');
  if (!area) return;

  area.innerHTML = `
    <div class="card-header">
      <span class="card-title">${UI.iconHtml('sync', '20px')} <span>Clone Progress</span></span>
      <span id="clone-progress-status" class="md-label-large"></span>
    </div>
    <div id="clone-linear-progress"></div>
    <div class="clone-progress-log" id="clone-progress-log" aria-live="polite" aria-label="Clone progress output"></div>
    <div id="clone-summary-area"></div>
  `;

  const progressBar = UI.buildLinearProgress(true);
  document.getElementById('clone-linear-progress')?.appendChild(progressBar);
}

// ─── Clone Logic ──────────────────────────────────────────────────────────────

async function onCloneNow() {
  if (cloneIsRunning) {
    UI.showSnackbar('Clone operation already running. Please wait.');
    return;
  }

  // Check Git first
  try {
    const gitCheck = await window.api.clone.checkGit();
    if (!gitCheck.available) {
      showGitMissingDialog();
      return;
    }
  } catch {}

  try {
    await window.api.clone.runNow();
    startCloneUI();
  } catch (e) {
    if (e.message === 'GIT_NOT_FOUND') {
      showGitMissingDialog();
    } else {
      UI.showSnackbar(e.message || 'Failed to start clone operation');
    }
  }
}

function showGitMissingDialog() {
  UI.showDialog({
    icon: 'error',
    headline: 'Git is not installed',
    body: 'Git was not found on this computer.\n\nInstall Git for Windows and make sure it is available in your PATH environment variable, then restart the application.',
    actions: [{ label: 'OK', className: 'md-btn md-btn-filled' }]
  });
}

function startCloneUI() {
  cloneIsRunning = true;
  progressLines = [];
  const area = document.getElementById('clone-progress-area');
  if (area) area.classList.add('visible');

  const log = document.getElementById('clone-progress-log');
  const status = document.getElementById('clone-progress-status');
  const summary = document.getElementById('clone-summary-area');
  const cloneBtn = document.getElementById('dashboard-clone-now');
  const qaBtn = document.getElementById('qa-clone');

  if (log) log.innerHTML = '';
  if (summary) summary.innerHTML = '';
  if (status) status.textContent = 'Running...';
  if (cloneBtn) cloneBtn.disabled = true;
  if (qaBtn) qaBtn.disabled = true;

  addProgressLine('Starting clone operation...');
}

function addProgressLine(text) {
  if (!text || !text.trim()) return;
  progressLines.push(text);
  const log = document.getElementById('clone-progress-log');
  if (!log) return;
  const line = document.createElement('div');
  line.className = 'clone-progress-line';
  line.textContent = text;
  log.appendChild(line);
  log.scrollTop = log.scrollHeight;
}

function endCloneUI(summary) {
  cloneIsRunning = false;
  const status = document.getElementById('clone-progress-status');
  const summaryArea = document.getElementById('clone-summary-area');
  const cloneBtn = document.getElementById('dashboard-clone-now');
  const qaBtn = document.getElementById('qa-clone');

  if (status) status.textContent = 'Complete';
  if (cloneBtn) cloneBtn.disabled = false;
  if (qaBtn) qaBtn.disabled = false;

  if (summaryArea && summary) {
    summaryArea.innerHTML = `
      <div style="display:flex;gap:16px;flex-wrap:wrap;margin-top:8px">
        <span class="md-status md-status-success">${UI.iconHtml('check_circle', '16px')} ${summary.cloned || 0} cloned</span>
        <span class="md-status md-status-neutral">${UI.iconHtml('skip_next', '16px')} ${summary.skipped || 0} skipped</span>
        ${(summary.failed || 0) > 0 ? `<span class="md-status md-status-error">${UI.iconHtml('error', '16px')} ${summary.failed} failed</span>` : ''}
      </div>
    `;
  }

  // Refresh stats
  renderStatusCard();
  renderStatsCard();
}

// ─── Event listeners ──────────────────────────────────────────────────────────

document.addEventListener('clone:progress', (e) => {
  const data = e.detail;
  if (!data) return;
  if (data.type === 'cloning') addProgressLine(`Cloning ${data.repo}...`);
  else if (data.type === 'cloned') addProgressLine(`Cloned: ${data.repo} → ${data.destPath}`);
  else if (data.type === 'skip') addProgressLine(`Skipping ${data.repo} (already cloned)`);
  else if (data.type === 'error') addProgressLine(`Error: ${data.error}`);
  else if (data.type === 'fetching') addProgressLine(`Fetching repos for ${data.source}...`);
  else if (data.type === 'start') addProgressLine(`Processing ${data.total} source(s)...`);
  else if (data.type === 'progress' && data.line) addProgressLine(data.line);
});

document.addEventListener('clone:finished', (e) => {
  endCloneUI(e.detail);
  UI.showSnackbar('Clone operation completed');
});

document.addEventListener('clone:failed', (e) => {
  const err = e.detail?.error;
  cloneIsRunning = false;
  const cloneBtn = document.getElementById('dashboard-clone-now');
  const qaBtn = document.getElementById('qa-clone');
  if (cloneBtn) cloneBtn.disabled = false;
  if (qaBtn) qaBtn.disabled = false;

  if (err === 'GIT_NOT_FOUND') {
    showGitMissingDialog();
  } else {
    UI.showSnackbar(err || 'Clone operation failed');
  }
});

document.addEventListener('clone:started', () => {
  if (!cloneIsRunning) startCloneUI();
});

document.addEventListener('page:activated', (e) => {
  if (e.detail.page === 'dashboard') {
    renderDashboard();
  }
});

if (document.getElementById('page-dashboard')?.classList.contains('active')) {
  renderDashboard();
}
