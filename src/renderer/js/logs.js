/**
 * logs.js — Activity Logs page
 */

let logsFilters = { status: '', search: '', dateFrom: '', dateTo: '' };
let logsData = [];
let searchDebounce = null;

async function renderLogs() {
  renderLogsActions();
  renderLogsBody();
  await fetchAndRenderLogs();
}

function renderLogsActions() {
  const el = document.getElementById('logs-actions');
  if (!el) return;
  el.innerHTML = '';

  const clearBtn = document.createElement('button');
  clearBtn.className = 'md-btn md-btn-outlined md-btn-icon';
  clearBtn.id = 'logs-clear-btn';
  clearBtn.setAttribute('aria-label', 'Clear all logs');
  clearBtn.innerHTML = UI.iconHtml('delete', '18px') + '<span>Clear Logs</span>';
  clearBtn.addEventListener('click', clearAllLogs);
  el.appendChild(clearBtn);

  const refreshBtn = document.createElement('button');
  refreshBtn.className = 'md-icon-btn';
  refreshBtn.setAttribute('aria-label', 'Refresh logs');
  refreshBtn.setAttribute('data-tooltip', 'Refresh');
  refreshBtn.innerHTML = UI.iconHtml('refresh', '20px');
  refreshBtn.addEventListener('click', fetchAndRenderLogs);
  el.appendChild(refreshBtn);
}

function renderLogsBody() {
  const body = document.getElementById('logs-body');
  if (!body) return;

  body.innerHTML = `
    <div class="log-filters">
      <div class="log-search-wrap">
        <span class="log-search-icon" aria-hidden="true">${UI.iconHtml('search', '20px')}</span>
        <input
          type="search"
          class="log-search"
          id="logs-search"
          placeholder="Search logs..."
          aria-label="Search logs"
          value="${UI.escapeHtml(logsFilters.search)}"
        >
      </div>
      <div class="md-field" style="width:160px">
        <div class="md-field-input-wrap">
          <select class="md-select" id="logs-status-filter" aria-label="Filter by status">
            <option value="">All statuses</option>
            <option value="success" ${logsFilters.status === 'success' ? 'selected' : ''}>Success</option>
            <option value="skipped" ${logsFilters.status === 'skipped' ? 'selected' : ''}>Skipped</option>
            <option value="failed"  ${logsFilters.status === 'failed' ? 'selected' : ''}>Failed</option>
            <option value="info"    ${logsFilters.status === 'info' ? 'selected' : ''}>Info</option>
          </select>
          <span class="md-field-trailing" aria-hidden="true">${UI.iconHtml('filter_list', '20px')}</span>
        </div>
      </div>
    </div>
    <div class="repo-table-wrap">
      <table class="md-table" id="logs-table" aria-label="Activity logs">
        <thead>
          <tr>
            <th scope="col" style="width:48px">Status</th>
            <th scope="col">Time</th>
            <th scope="col">Repository</th>
            <th scope="col">Action</th>
            <th scope="col">Message</th>
          </tr>
        </thead>
        <tbody id="logs-tbody">
          <tr><td colspan="5" style="text-align:center;padding:40px">
            ${UI.buildCircularProgress().outerHTML}
          </td></tr>
        </tbody>
      </table>
    </div>
  `;

  // Event listeners
  document.getElementById('logs-search')?.addEventListener('input', (e) => {
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(() => {
      logsFilters.search = e.target.value;
      renderLogsTable();
    }, 250);
  });

  document.getElementById('logs-status-filter')?.addEventListener('change', (e) => {
    logsFilters.status = e.target.value;
    fetchAndRenderLogs();
  });
}

async function fetchAndRenderLogs() {
  try {
    logsData = await window.api.logs.getAll({
      status: logsFilters.status || undefined,
      search: logsFilters.search || undefined
    });
    renderLogsTable();
  } catch (e) {
    const tbody = document.getElementById('logs-tbody');
    if (tbody) tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--md-sys-color-error);padding:40px">${UI.escapeHtml(e.message)}</td></tr>`;
  }
}

function renderLogsTable() {
  const tbody = document.getElementById('logs-tbody');
  if (!tbody) return;

  let filtered = logsData;
  if (logsFilters.search) {
    const q = logsFilters.search.toLowerCase();
    filtered = filtered.filter(l =>
      (l.repository_name || '').toLowerCase().includes(q) ||
      (l.message || '').toLowerCase().includes(q) ||
      (l.action || '').toLowerCase().includes(q)
    );
  }

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr><td colspan="5">
        <div class="empty-state" style="padding:40px">
          <div class="empty-state-icon">${UI.iconHtml('logs', '48px')}</div>
          <div class="empty-state-title">No logs found</div>
        </div>
      </td></tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.slice(0, 500).map(log => `
    <tr>
      <td style="text-align:center">
        <span class="log-status-${statusClass(log.status)}" aria-label="${UI.escapeHtml(log.status)}">
          ${UI.iconHtml(statusIcon(log.status), '18px')}
        </span>
      </td>
      <td class="md-body-small text-on-surface-variant" style="white-space:nowrap">${UI.formatDate(log.timestamp)}</td>
      <td class="md-body-medium">${UI.escapeHtml(log.repository_name || '--')}</td>
      <td>
        <span style="text-transform:capitalize;font-size:13px">${UI.escapeHtml(log.action || '')}</span>
      </td>
      <td class="md-body-small text-on-surface-variant">${UI.escapeHtml((log.message || '').substring(0, 200))}</td>
    </tr>
  `).join('');
}

function statusClass(status) {
  switch (status) {
    case 'success': return 'success';
    case 'failed':  return 'failed';
    case 'skipped': return 'skipped';
    default:        return 'info';
  }
}

function statusIcon(status) {
  switch (status) {
    case 'success': return 'check_circle';
    case 'failed':  return 'error';
    case 'skipped': return 'skip_next';
    default:        return 'info';
  }
}

async function clearAllLogs() {
  const confirmed = await UI.showConfirm({
    icon: 'delete',
    headline: 'Clear All Logs',
    body: 'This will permanently delete all activity logs. This cannot be undone.',
    confirmLabel: 'Clear All',
    confirmClass: 'md-btn-error'
  });
  if (!confirmed) return;

  try {
    await window.api.logs.clear();
    logsData = [];
    renderLogsTable();
    UI.showSnackbar('All logs cleared');
  } catch (e) {
    UI.showSnackbar(`Failed to clear logs: ${e.message}`);
  }
}

document.addEventListener('page:activated', (e) => {
  if (e.detail.page === 'logs') renderLogs();
});

// Refresh logs when clone finishes
document.addEventListener('clone:finished', () => {
  if (document.getElementById('page-logs')?.classList.contains('active')) {
    fetchAndRenderLogs();
  }
});
