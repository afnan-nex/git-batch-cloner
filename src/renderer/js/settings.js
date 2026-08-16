/**
 * settings.js — Settings page
 */

let settingsData = {};

async function renderSettings() {
  try {
    settingsData = await window.api.settings.getAll();
  } catch {}
  renderSettingsBody();
}

function renderSettingsBody() {
  const body = document.getElementById('settings-body');
  if (!body) return;

  body.innerHTML = '';

  body.appendChild(buildGeneralSection());
  body.appendChild(buildScheduleSection());
  body.appendChild(buildAppearanceSection());
  body.appendChild(buildGitHubSection());
  body.appendChild(buildStorageSection());
}

// ─── General ─────────────────────────────────────────────────────────────────

function buildGeneralSection() {
  const section = document.createElement('div');
  section.className = 'settings-section';
  section.innerHTML = `<div class="settings-section-title">General</div>`;

  section.appendChild(buildSwitchItem({
    id: 'setting-startup',
    title: 'Start with Windows',
    subtitle: 'Launch the application when Windows starts',
    checked: settingsData.start_with_windows !== '0',
    onChange: async (v) => {
      await window.api.settings.set('start_with_windows', v ? '1' : '0');
    }
  }));

  section.appendChild(buildSwitchItem({
    id: 'setting-minimize',
    title: 'Minimize to tray',
    subtitle: 'When the window is closed, keep running in the system tray',
    checked: settingsData.minimize_to_tray !== '0',
    onChange: async (v) => {
      await window.api.settings.set('minimize_to_tray', v ? '1' : '0');
    }
  }));

  section.appendChild(buildSwitchItem({
    id: 'setting-auto',
    title: 'Automatic checking',
    subtitle: 'Periodically check for new repositories on the configured schedule',
    checked: settingsData.auto_checking !== '0',
    onChange: async (v) => {
      await window.api.settings.set('auto_checking', v ? '1' : '0');
      UI.showSnackbar(v ? 'Automatic checking enabled' : 'Automatic checking disabled');
    }
  }));

  section.appendChild(buildSwitchItem({
    id: 'setting-overwrite',
    title: 'Overwrite existing repositories if they exist',
    subtitle: 'Automatically re-clone and replace existing repository folders on disk',
    checked: settingsData.overwrite_existing !== '0',
    onChange: async (v) => {
      await window.api.settings.set('overwrite_existing', v ? '1' : '0');
      UI.showSnackbar(v ? 'Auto-overwrite enabled' : 'Auto-overwrite disabled');
    }
  }));

  return section;
}

// ─── Schedule ─────────────────────────────────────────────────────────────────

function buildScheduleSection() {
  const section = document.createElement('div');
  section.className = 'settings-section';
  section.innerHTML = `<div class="settings-section-title">Schedule</div>`;

  const intervalMs = parseInt(settingsData.check_interval_ms || String(3600000));
  const intervalOptions = [
    { label: '15 minutes', value: 15 * 60 * 1000 },
    { label: '30 minutes', value: 30 * 60 * 1000 },
    { label: '1 hour', value: 60 * 60 * 1000 },
    { label: '2 hours', value: 2 * 60 * 60 * 1000 },
    { label: '6 hours', value: 6 * 60 * 60 * 1000 },
    { label: '12 hours', value: 12 * 60 * 60 * 1000 },
    { label: '24 hours', value: 24 * 60 * 60 * 1000 }
  ];

  const item = document.createElement('div');
  item.className = 'settings-item';
  item.innerHTML = `
    <div class="settings-item-left">
      <div class="settings-item-title">Check interval</div>
      <div class="settings-item-subtitle">How often to automatically check for new repositories</div>
    </div>
    <div class="settings-item-control">
      <div class="md-field" style="width:160px">
        <div class="md-field-input-wrap">
          <select class="md-select" id="interval-select" aria-label="Check interval" style="padding-top:12px">
            ${intervalOptions.map(o => `<option value="${o.value}" ${intervalMs === o.value ? 'selected' : ''}>${UI.escapeHtml(o.label)}</option>`).join('')}
          </select>
        </div>
      </div>
    </div>
  `;

  item.querySelector('#interval-select')?.addEventListener('change', async (e) => {
    await window.api.settings.set('check_interval_ms', e.target.value);
    UI.showSnackbar('Check interval updated');
  });

  section.appendChild(item);
  return section;
}

// ─── Appearance ───────────────────────────────────────────────────────────────

function buildAppearanceSection() {
  const section = document.createElement('div');
  section.className = 'settings-section';
  section.innerHTML = `<div class="settings-section-title">${UI.iconHtml('dark_mode', '18px')} Appearance</div>`;

  const currentTheme = settingsData.theme || 'system';

  const item = document.createElement('div');
  item.className = 'settings-item stacked';
  item.innerHTML = `
    <div class="settings-item-left">
      <div class="settings-item-title">Theme</div>
      <div class="settings-item-subtitle">Choose light, dark, or follow the Windows system setting</div>
    </div>
  `;

  const radioGroup = document.createElement('div');
  radioGroup.className = 'md-radio-group';
  radioGroup.setAttribute('role', 'radiogroup');
  radioGroup.setAttribute('aria-label', 'Theme selection');

  const themes = [
    { value: 'system', label: 'System Default', icon: 'computer' },
    { value: 'light', label: 'Light', icon: 'light_mode' },
    { value: 'dark', label: 'Dark', icon: 'dark_mode' }
  ];

  themes.forEach(t => {
    const label = document.createElement('label');
    label.className = 'md-radio';

    const input = document.createElement('input');
    input.type = 'radio';
    input.name = 'theme-radio';
    input.value = t.value;
    input.checked = currentTheme === t.value;
    input.id = `theme-${t.value}`;
    input.addEventListener('change', async () => {
      if (input.checked) {
        await window.api.settings.set('theme', t.value);
        App.applyTheme(t.value);
        UI.showSnackbar(`Theme: ${t.label}`);
      }
    });

    const iconSpan = document.createElement('span');
    iconSpan.innerHTML = UI.iconHtml(t.icon, '20px');

    const textSpan = document.createElement('span');
    textSpan.textContent = t.label;

    label.appendChild(input);
    label.appendChild(iconSpan);
    label.appendChild(textSpan);
    radioGroup.appendChild(label);
  });

  item.appendChild(radioGroup);
  section.appendChild(item);
  return section;
}

// ─── GitHub ───────────────────────────────────────────────────────────────────

function buildGitHubSection() {
  const section = document.createElement('div');
  section.className = 'settings-section';
  section.innerHTML = `<div class="settings-section-title">${UI.iconHtml('github', '18px')} GitHub Authentication</div>`;

  const item = document.createElement('div');
  item.className = 'settings-item stacked';

  item.innerHTML = `
    <div class="settings-item-left">
      <div class="settings-item-title">${UI.iconHtml('token', '20px')} Personal Access Token</div>
      <div class="settings-item-subtitle">Required for private repositories and higher API rate limits. Token is securely stored locally.</div>
    </div>
  `;

  // Token field + actions
  const tokenRow = document.createElement('div');
  tokenRow.className = 'token-field-wrap';
  tokenRow.style.width = '100%';

  const field = document.createElement('div');
  field.className = 'md-field';
  field.style.flex = '1';

  const inputWrap = document.createElement('div');
  inputWrap.className = 'md-field-input-wrap';

  const tokenInput = document.createElement('input');
  tokenInput.type = 'password';
  tokenInput.id = 'setting-token-input';
  tokenInput.className = 'md-field-input';
  tokenInput.placeholder = ' ';
  tokenInput.value = settingsData.github_token || '';
  tokenInput.autocomplete = 'off';
  tokenInput.setAttribute('aria-label', 'GitHub Personal Access Token');
  tokenInput.style.fontFamily = 'monospace';

  const tokenLabel = document.createElement('label');
  tokenLabel.className = 'md-field-label';
  tokenLabel.htmlFor = 'setting-token-input';
  tokenLabel.textContent = 'GitHub Token';

  const showHideBtn = document.createElement('button');
  showHideBtn.className = 'md-icon-btn';
  showHideBtn.setAttribute('aria-label', 'Toggle token visibility');
  showHideBtn.setAttribute('data-tooltip', 'Show/hide token');
  showHideBtn.innerHTML = UI.iconHtml('visibility', '20px');
  let isVisible = false;
  showHideBtn.addEventListener('click', () => {
    isVisible = !isVisible;
    tokenInput.type = isVisible ? 'text' : 'password';
    showHideBtn.innerHTML = UI.iconHtml(isVisible ? 'visibility_off' : 'visibility', '20px');
  });

  inputWrap.appendChild(tokenInput);
  inputWrap.appendChild(tokenLabel);
  inputWrap.appendChild(showHideBtn);
  field.appendChild(inputWrap);
  tokenRow.appendChild(field);

  item.appendChild(tokenRow);

  // Save + Test buttons
  const btnRow = document.createElement('div');
  btnRow.style.display = 'flex';
  btnRow.style.gap = '12px';
  btnRow.style.width = '100%';

  const saveBtn = document.createElement('button');
  saveBtn.className = 'md-btn md-btn-tonal';
  saveBtn.id = 'token-save-btn';
  saveBtn.textContent = 'Save Token';
  saveBtn.addEventListener('click', async () => {
    const val = tokenInput.value.trim();
    await window.api.settings.set('github_token', val);
    UI.showSnackbar(val ? 'Token saved' : 'Token cleared');
  });

  const testBtn = document.createElement('button');
  testBtn.className = 'md-btn md-btn-outlined';
  testBtn.id = 'token-test-btn';
  testBtn.textContent = 'Test Token';
  testBtn.addEventListener('click', async () => {
    const val = tokenInput.value.trim();
    if (!val) { UI.showSnackbar('Enter a token first'); return; }
    testBtn.disabled = true;
    testBtn.textContent = 'Testing...';
    try {
      const result = await window.api.github.verifyToken(val);
      if (result.valid) {
        UI.showSnackbar(`Token valid — authenticated as ${result.login}`, { duration: 5000 });
      } else {
        UI.showSnackbar(`Invalid token: ${result.error}`, { duration: 5000 });
      }
    } catch (e) {
      UI.showSnackbar(`Error: ${e.message}`);
    } finally {
      testBtn.disabled = false;
      testBtn.textContent = 'Test Token';
    }
  });

  btnRow.appendChild(saveBtn);
  btnRow.appendChild(testBtn);
  item.appendChild(btnRow);

  section.appendChild(item);
  return section;
}

// ─── Storage ─────────────────────────────────────────────────────────────────

function buildStorageSection() {
  const section = document.createElement('div');
  section.className = 'settings-section';
  section.innerHTML = `<div class="settings-section-title">${UI.iconHtml('folder', '18px')} Storage & Destination</div>`;

  const item = document.createElement('div');
  item.className = 'settings-item stacked';

  const cloneDir = settingsData.clone_directory || '%USERPROFILE%\\Downloads';

  item.innerHTML = `
    <div class="settings-item-left">
      <div class="settings-item-title">Clone Destination Directory</div>
      <div class="settings-item-subtitle">Repositories will be cloned into subdirectories of this folder</div>
    </div>
  `;

  const pathRow = document.createElement('div');
  pathRow.className = 'settings-path-row';

  const pathText = document.createElement('div');
  pathText.className = 'settings-path-text';
  pathText.id = 'clone-dir-display';
  pathText.textContent = cloneDir;
  pathText.title = cloneDir;

  const browseBtn = document.createElement('button');
  browseBtn.className = 'md-btn md-btn-outlined md-btn-icon';
  browseBtn.innerHTML = UI.iconHtml('folder', '18px') + '<span>Browse</span>';
  browseBtn.addEventListener('click', async () => {
    const selected = await window.api.system.browsePath();
    if (selected) {
      await window.api.settings.set('clone_directory', selected);
      pathText.textContent = selected;
      pathText.title = selected;
      UI.showSnackbar('Clone directory updated');
    }
  });

  const openBtn = document.createElement('button');
  openBtn.className = 'md-icon-btn';
  openBtn.setAttribute('data-tooltip', 'Open folder');
  openBtn.setAttribute('aria-label', 'Open clone directory');
  openBtn.innerHTML = UI.iconHtml('open_in_new', '20px');
  openBtn.addEventListener('click', async () => {
    await window.api.system.openFolder(pathText.textContent);
  });

  pathRow.appendChild(pathText);
  pathRow.appendChild(browseBtn);
  pathRow.appendChild(openBtn);
  item.appendChild(pathRow);

  section.appendChild(item);
  return section;
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function buildSwitchItem({ id, title, subtitle, checked, onChange }) {
  const item = document.createElement('div');
  item.className = 'settings-item';

  const left = document.createElement('div');
  left.className = 'settings-item-left';
  left.innerHTML = `
    <div class="settings-item-title">${UI.escapeHtml(title)}</div>
    <div class="settings-item-subtitle">${UI.escapeHtml(subtitle)}</div>
  `;

  const control = document.createElement('div');
  control.className = 'settings-item-control';

  const { el: sw } = UI.buildSwitch({
    id,
    checked,
    onChange: async (v) => {
      try {
        await onChange(v);
      } catch (e) {
        UI.showSnackbar(`Failed to update setting: ${e.message}`);
      }
    }
  });

  control.appendChild(sw);
  item.appendChild(left);
  item.appendChild(control);
  return item;
}

document.addEventListener('page:activated', (e) => {
  if (e.detail.page === 'settings') renderSettings();
});
