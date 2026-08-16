/**
 * app.js — SPA Router, Theme Engine, IPC Event Bus
 */

// ─── Theme Engine ─────────────────────────────────────────────────────────────

const THEME_CLASS_MAP = {
  light: 'theme-light',
  dark: 'theme-dark',
  system: 'theme-system'
};

let currentTheme = 'system';

function applyTheme(theme) {
  const app = document.getElementById('app');
  app.classList.remove('theme-light', 'theme-dark', 'theme-system');
  const cls = THEME_CLASS_MAP[theme] || 'theme-system';
  app.classList.add(cls);
  currentTheme = theme;
}

// ─── Router ───────────────────────────────────────────────────────────────────

const PAGES = ['dashboard', 'repositories', 'logs', 'schedule', 'settings'];

let currentPage = 'dashboard';

function navigateTo(pageId) {
  if (!PAGES.includes(pageId)) return;

  // Update pages
  PAGES.forEach((id) => {
    const page = document.getElementById(`page-${id}`);
    const navItem = document.getElementById(`nav-${id}`);
    if (page) page.classList.toggle('active', id === pageId);
    if (navItem) navItem.classList.toggle('active', id === pageId);
  });

  currentPage = pageId;

  // Trigger page render
  const event = new CustomEvent('page:activated', { detail: { page: pageId } });
  document.dispatchEvent(event);
}

// ─── Navigation click handlers ────────────────────────────────────────────────

document.querySelectorAll('.nav-item').forEach((item) => {
  item.addEventListener('click', () => {
    const page = item.dataset.page;
    if (page) navigateTo(page);
  });

  // Keyboard navigation
  item.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      item.click();
    }
  });
});

// ─── IPC Event Listeners ──────────────────────────────────────────────────────

// System events from main process
window.api.on('main:event', (data) => {
  if (data.type === 'snackbar') {
    UI.showSnackbar(data.message);
  }
  if (data.type === 'clone:start') {
    document.dispatchEvent(new CustomEvent('clone:started'));
  }
  if (data.type === 'clone:done') {
    document.dispatchEvent(new CustomEvent('clone:finished'));
  }
  if (data.type === 'clone:error') {
    document.dispatchEvent(new CustomEvent('clone:failed', { detail: { error: data.error } }));
  }
  if (data.type === 'cloneProgress') {
    document.dispatchEvent(new CustomEvent('clone:progress', { detail: data.data }));
  }
  if (data.type === 'scheduler') {
    document.dispatchEvent(new CustomEvent('scheduler:event', { detail: data }));
  }
});

// Clone progress from IPC
window.api.on('clone:progress', (data) => {
  document.dispatchEvent(new CustomEvent('clone:progress', { detail: data }));
});
window.api.on('clone:done', (summary) => {
  document.dispatchEvent(new CustomEvent('clone:finished', { detail: summary }));
});
window.api.on('clone:error', (error) => {
  document.dispatchEvent(new CustomEvent('clone:failed', { detail: { error } }));
});

// Navigation from tray/main
window.api.on('navigate', (page) => {
  navigateTo(page);
});

// Open schedule dialog from tray
window.api.on('openScheduleDialog', () => {
  navigateTo('schedule');
  setTimeout(() => {
    document.dispatchEvent(new CustomEvent('schedule:openDialog'));
  }, 100);
});

// System theme changes
window.api.on('system:themeChanged', ({ dark }) => {
  if (currentTheme === 'system') {
    // The CSS media query handles it automatically, but we can force re-paint
    const app = document.getElementById('app');
    app.classList.remove('theme-system');
    void app.offsetWidth; // force reflow
    app.classList.add('theme-system');
  }
});

// ─── Initialization ───────────────────────────────────────────────────────────

async function init() {
  try {
    const settings = await window.api.settings.getAll();
    const theme = settings.theme || 'system';
    applyTheme(theme);
  } catch (e) {
    applyTheme('system');
  }

  // Start on dashboard
  navigateTo('dashboard');
}

// Expose globals
window.App = { navigateTo, applyTheme, PAGES, init };

// Boot when DOM and all page scripts are ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(init, 50);
  });
} else {
  setTimeout(init, 50);
}
