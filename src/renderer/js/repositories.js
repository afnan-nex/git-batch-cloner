/**
 * repositories.js — Repository management page
 */

let repoList = [];

async function renderRepositories() {
  renderReposActions();
  await renderReposBody();
}

function renderReposActions() {
  const el = document.getElementById('repos-actions');
  if (!el) return;
  el.innerHTML = '';

  const addBtn = document.createElement('button');
  addBtn.className = 'md-btn md-btn-filled md-btn-icon';
  addBtn.id = 'repos-add-btn';
  addBtn.setAttribute('aria-label', 'Add Repository');
  addBtn.innerHTML = UI.iconHtml('add', '18px') + '<span>Add Repository</span>';
  addBtn.addEventListener('click', showAddDialog);
  el.appendChild(addBtn);
}

async function renderReposBody() {
  const body = document.getElementById('repos-body');
  if (!body) return;

  body.innerHTML = '';

  try {
    repoList = await window.api.repos.getAll();
  } catch (e) {
    repoList = [];
    body.innerHTML = `<div class="empty-state"><div class="empty-state-icon">${UI.iconHtml('error', '64px')}</div><div class="empty-state-title">Failed to load repositories</div><div class="empty-state-body">${UI.escapeHtml(e.message)}</div></div>`;
    return;
  }

  if (repoList.length === 0) {
    renderEmptyRepos(body);
    return;
  }

  renderReposTable(body);
}

function renderEmptyRepos(body) {
  body.innerHTML = `
    <div class="empty-state">
      <div class="empty-state-icon">${UI.iconHtml('repos', '64px')}</div>
      <div class="empty-state-title">No repositories configured</div>
      <div class="empty-state-body">Add a GitHub username or repository URL to get started.</div>
      <button class="md-btn md-btn-filled md-btn-icon" id="repos-empty-add">
        ${UI.iconHtml('add', '18px')}<span>Add Repository</span>
      </button>
    </div>
  `;
  document.getElementById('repos-empty-add')?.addEventListener('click', showAddDialog);
}

function renderReposTable(body) {
  const wrap = document.createElement('div');
  wrap.className = 'repo-table-wrap';

  const table = document.createElement('table');
  table.className = 'md-table';
  table.setAttribute('role', 'grid');
  table.setAttribute('aria-label', 'Repository list');

  table.innerHTML = `
    <thead>
      <tr>
        <th scope="col">Source</th>
        <th scope="col">Type</th>
        <th scope="col">Status</th>
        <th scope="col">Last Check</th>
        <th scope="col">Last Clone</th>
        <th scope="col">Enabled</th>
        <th scope="col" style="text-align:right">Actions</th>
      </tr>
    </thead>
    <tbody id="repos-tbody"></tbody>
  `;

  wrap.appendChild(table);
  body.appendChild(wrap);

  const tbody = document.getElementById('repos-tbody');
  repoList.forEach(repo => tbody.appendChild(buildRepoRow(repo)));
}

function buildRepoRow(repo) {
  const tr = document.createElement('tr');
  tr.id = `repo-row-${repo.id}`;

  const typeBadge = repo.type === 'user'
    ? `<span class="repo-type-chip repo-type-user">${UI.iconHtml('person', '14px')} User</span>`
    : `<span class="repo-type-chip repo-type-repo">${UI.iconHtml('source', '14px')} Repo</span>`;

  const statusBadge = buildStatusBadge(repo.status, repo.enabled);

  const switchEl = buildInlineSwitch(repo);

  tr.innerHTML = `
    <td>
      <div style="display:flex;align-items:center;gap:8px">
        ${UI.iconHtml('github', '20px')}
        <span style="font-weight:500">${UI.escapeHtml(repo.source)}</span>
      </div>
    </td>
    <td>${typeBadge}</td>
    <td>${statusBadge}</td>
    <td class="md-body-small text-on-surface-variant">${UI.formatDate(repo.last_checked_at)}</td>
    <td class="md-body-small text-on-surface-variant">${UI.formatDate(repo.last_cloned_at)}</td>
    <td id="switch-cell-${repo.id}"></td>
    <td>
      <div class="repo-actions" style="justify-content:flex-end">
        <button class="md-icon-btn" id="btn-clone-${repo.id}" data-tooltip="Clone Now" aria-label="Clone ${UI.escapeHtml(repo.source)} now">
          ${UI.iconHtml('sync', '20px')}
        </button>
        <button class="md-icon-btn" id="btn-folder-${repo.id}" data-tooltip="Open Folder" aria-label="Open clone folder for ${UI.escapeHtml(repo.source)}">
          ${UI.iconHtml('folder', '20px')}
        </button>
        <button class="md-icon-btn" id="btn-delete-${repo.id}" data-tooltip="Delete" aria-label="Delete ${UI.escapeHtml(repo.source)}" style="color:var(--md-sys-color-error)">
          ${UI.iconHtml('delete', '20px')}
        </button>
      </div>
    </td>
  `;

  // Insert switch into its cell
  const switchCell = tr.querySelector(`#switch-cell-${repo.id}`);
  const { el: sw, input } = UI.buildSwitch({
    id: `toggle-${repo.id}`,
    checked: repo.enabled === 1,
    onChange: async (checked) => {
      try {
        await window.api.repos.update(repo.id, { enabled: checked ? 1 : 0 });
      } catch (e) {
        UI.showSnackbar('Failed to update repository');
        input.checked = !checked; // revert
      }
    }
  });
  switchCell.appendChild(sw);

  // Wire actions
  tr.querySelector(`#btn-clone-${repo.id}`)?.addEventListener('click', () => cloneRepo(repo));
  tr.querySelector(`#btn-folder-${repo.id}`)?.addEventListener('click', () => openRepoFolder(repo));
  tr.querySelector(`#btn-delete-${repo.id}`)?.addEventListener('click', () => deleteRepo(repo));

  return tr;
}

function buildStatusBadge(status, enabled) {
  if (enabled === 0) return `<span class="status-badge status-badge-disabled">Disabled</span>`;
  switch (status) {
    case 'active': return `<span class="status-badge status-badge-active">${UI.iconHtml('check', '12px')} Active</span>`;
    case 'error':  return `<span class="status-badge status-badge-error">${UI.iconHtml('error', '12px')} Error</span>`;
    default:       return `<span class="status-badge status-badge-pending">${UI.iconHtml('access_time', '12px')} Pending</span>`;
  }
}

function buildInlineSwitch(repo) {
  return UI.buildSwitch({
    id: `toggle-${repo.id}`,
    checked: repo.enabled === 1,
    onChange: async (checked) => {
      try {
        await window.api.repos.update(repo.id, { enabled: checked ? 1 : 0 });
      } catch {
        UI.showSnackbar('Failed to update repository');
      }
    }
  });
}

// ─── Add Dialog ───────────────────────────────────────────────────────────────

function showAddDialog() {
  const form = document.createElement('div');
  form.style.display = 'flex';
  form.style.flexDirection = 'column';
  form.style.gap = '16px';

  const field = document.createElement('div');
  field.className = 'md-field';

  const inputWrap = document.createElement('div');
  inputWrap.className = 'md-field-input-wrap';

  const input = document.createElement('input');
  input.type = 'text';
  input.id = 'add-repo-input';
  input.className = 'md-field-input';
  input.placeholder = ' ';
  input.autocomplete = 'off';
  input.setAttribute('aria-label', 'GitHub URL or Username');

  const label = document.createElement('label');
  label.className = 'md-field-label';
  label.htmlFor = 'add-repo-input';
  label.textContent = 'GitHub URL or Username';

  inputWrap.appendChild(input);
  inputWrap.appendChild(label);
  field.appendChild(inputWrap);

  const supporting = document.createElement('div');
  supporting.className = 'md-field-supporting';
  supporting.textContent = 'e.g. afnan-nex, https://github.com/afnan-nex, or https://github.com/afnan-nex/repo';
  field.appendChild(supporting);

  const errorDiv = document.createElement('div');
  errorDiv.className = 'md-field-supporting text-error';
  errorDiv.id = 'add-repo-error';
  field.appendChild(errorDiv);

  form.appendChild(field);

  UI.showDialog({
    icon: 'add',
    headline: 'Add Repository',
    body: form,
    actions: [
      {
        label: 'Cancel',
        className: 'md-btn md-btn-text',
        onClick: (close) => close()
      },
      {
        label: 'Add',
        id: 'dialog-add-confirm',
        className: 'md-btn md-btn-filled',
        onClick: async (close) => {
          const val = input.value.trim();
          const errorEl = document.getElementById('add-repo-error');
          if (!val) {
            if (errorEl) errorEl.textContent = 'Please enter a GitHub URL or username';
            return;
          }
          const btn = document.getElementById('dialog-add-confirm');
          if (btn) btn.disabled = true;
          try {
            const result = await window.api.repos.add(val);
            close();
            UI.showSnackbar(`Added: ${result.source}`);
            await renderReposBody();
          } catch (e) {
            if (errorEl) errorEl.textContent = e.message || 'Failed to add repository';
            if (btn) btn.disabled = false;
          }
        }
      }
    ]
  });

  // Enter key to submit
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      document.getElementById('dialog-add-confirm')?.click();
    }
  });

  // Auto-focus
  setTimeout(() => input.focus(), 100);
}

// ─── Clone single repo ────────────────────────────────────────────────────────

async function cloneRepo(repo) {
  const running = await window.api.clone.isRunning();
  if (running) {
    UI.showSnackbar('A clone operation is already running. Please wait.');
    return;
  }

  const gitCheck = await window.api.clone.checkGit();
  if (!gitCheck.available) {
    showGitMissingDialog();
    return;
  }

  // Check if already cloned for single repo entries
  if (repo.type === 'repo') {
    const repoFullName = `${repo.username}/${repo.repository_name}`;
    const clonePath = repo.clone_path || `%USERPROFILE%\\Downloads\\${repo.username}\\${repo.repository_name}`;
    const exists = await window.api.clone.checkDirExists(clonePath);

    if (exists) {
      const overwrite = await UI.showConfirm({
        icon: 'warning',
        headline: 'Repository Already Exists',
        body: `This repository has already been cloned to:\n${clonePath}\n\nDo you want to overwrite it and clone again?`,
        confirmLabel: 'Yes, Overwrite',
        cancelLabel: 'Cancel',
        confirmClass: 'md-btn-error'
      });
      if (!overwrite) return;

      try {
        const repoUrl = `https://github.com/${repoFullName}.git`;
        await window.api.clone.overwrite(repo.id, repoFullName, repoUrl, clonePath);
        UI.showSnackbar(`Re-cloned: ${repoFullName}`);
        await renderReposBody();
      } catch (e) {
        UI.showSnackbar(`Clone failed: ${e.message}`);
      }
      return;
    }
  }

  // Navigate to dashboard and start clone
  App.navigateTo('dashboard');
  try {
    await window.api.clone.runNow();
    document.dispatchEvent(new CustomEvent('clone:started'));
  } catch (e) {
    UI.showSnackbar(e.message || 'Clone failed');
  }
}

function showGitMissingDialog() {
  UI.showDialog({
    icon: 'error',
    headline: 'Git is not installed',
    body: 'Git was not found on this computer.\n\nInstall Git for Windows and make sure it is available in your PATH environment variable.',
    actions: [{ label: 'OK', className: 'md-btn md-btn-filled' }]
  });
}

async function openRepoFolder(repo) {
  const clonePath = repo.clone_path || '';
  if (!clonePath) {
    UI.showSnackbar('No clone path configured for this repository');
    return;
  }
  await window.api.system.openFolder(clonePath);
}

async function deleteRepo(repo) {
  const confirmed = await UI.showConfirm({
    icon: 'delete',
    headline: 'Delete Repository',
    body: `Remove "${repo.source}" from the repository list?\n\nThis will not delete any cloned files on disk.`,
    confirmLabel: 'Delete',
    confirmClass: 'md-btn-error'
  });
  if (!confirmed) return;

  try {
    await window.api.repos.delete(repo.id);
    UI.showSnackbar(`Deleted: ${repo.source}`);
    await renderReposBody();
  } catch (e) {
    UI.showSnackbar(`Failed to delete: ${e.message}`);
  }
}

// ─── Event hooks ──────────────────────────────────────────────────────────────

document.addEventListener('page:activated', (e) => {
  if (e.detail.page === 'repositories') {
    renderRepositories();
  }
});

if (document.getElementById('page-repositories')?.classList.contains('active')) {
  renderRepositories();
}
