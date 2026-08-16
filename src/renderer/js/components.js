/**
 * components.js — Shared UI components and utilities
 * Material 3 component helpers: Dialog, Snackbar, Icon, Switch, etc.
 */

// ─── Icon System ─────────────────────────────────────────────────────────────
// All icons as inline SVG — zero network, zero CDN

const ICONS = {
  dashboard: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>`,
  repos: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 6h-2.18c.07-.33.18-.65.18-1 0-2.21-1.79-4-4-4s-4 1.79-4 4c0 .35.11.67.18 1H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-6-3c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm-1 14l-4-4 1.41-1.41L13 14.17l6.59-6.59L21 9l-8 8z"/></svg>`,
  logs: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>`,
  schedule: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/></svg>`,
  settings: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.488.488 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87a.49.49 0 0 0 .12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32a.49.49 0 0 0-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>`,
  add: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>`,
  edit: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>`,
  delete: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>`,
  download: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>`,
  sync: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46A7.93 7.93 0 0 0 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74A7.93 7.93 0 0 0 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/></svg>`,
  folder: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>`,
  check: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>`,
  check_circle: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>`,
  error: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>`,
  warning: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>`,
  info: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>`,
  close: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/></svg>`,
  search: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>`,
  refresh: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>`,
  dark_mode: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z"/></svg>`,
  light_mode: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58a.996.996 0 0 0-1.41 0 .996.996 0 0 0 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37a.996.996 0 0 0-1.41 0 .996.996 0 0 0 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0a.996.996 0 0 0 0-1.41l-1.06-1.06zm1.06-10.96a.996.996 0 0 0 0-1.41.996.996 0 0 0-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36a.996.996 0 0 0 0-1.41.996.996 0 0 0-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/></svg>`,
  computer: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z"/></svg>`,
  github: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.49.5.09.68-.22.68-.48 0-.24-.01-.87-.01-1.71-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.83.09-.65.35-1.08.63-1.33-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02A9.56 9.56 0 0 1 12 6.8c.85.004 1.71.11 2.51.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85 0 1.34-.01 2.42-.01 2.75 0 .27.18.58.69.48A10.01 10.01 0 0 0 22 12c0-5.52-4.48-10-10-10z"/></svg>`,
  person: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>`,
  source: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9.4 16.6 4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0 4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/></svg>`,
  visibility: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>`,
  visibility_off: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46A11.804 11.804 0 0 0 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78 3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/></svg>`,
  open_in_new: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 19H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/></svg>`,
  clear_all: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M5 13h14v-2H5v2zm-2 4h14v-2H3v2zM7 7v2h14V7H7z"/></svg>`,
  content_copy: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>`,
  token: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17 8C8 10 5.9 16.17 3.82 21.82l1.94.76C7.86 17.14 10 12.5 18 11l-.5-3H20l-2.5-5-2.5 5h1.5l.5 3z"/></svg>`,
  filter_list: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"/></svg>`,
  running: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13.49 5.48c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-3.6 13.9l1-4.4 2.1 2v6h2v-7.5l-2.1-2 .6-3c1.3 1.5 3.3 2.5 5.5 2.5v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1l-5.2 2.2v4.7h2v-3.4l1.8-.7-1.6 8.1-4.9-1-.4 2 7 1.4z"/></svg>`,
  star: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="m12 17.27 4.15 2.51c.76.46 1.69-.22 1.49-1.08l-1.1-4.72 3.67-3.18c.67-.58.31-1.68-.57-1.75l-4.83-.41-1.89-4.46c-.34-.81-1.5-.81-1.84 0L9.19 8.63l-4.83.41c-.88.07-1.24 1.17-.57 1.75l3.67 3.18-1.1 4.72c-.2.86.73 1.54 1.49 1.08L12 17.27z"/></svg>`,
  notifications: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>`,
  access_time: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/></svg>`,
  chevron_left: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>`,
  chevron_right: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>`,
  keyboard: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 5H4c-1.1 0-1.99.9-1.99 2L2 17c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm-9 3h2v2h-2V8zm0 3h2v2h-2v-2zM8 8h2v2H8V8zm0 3h2v2H8v-2zm-1 2H5v-2h2v2zm0-3H5V8h2v2zm9 7H8v-2h8v2zm0-4h-2v-2h2v2zm0-3h-2V8h2v2zm3 3h-2v-2h2v2zm0-3h-2V8h2v2z"/></svg>`,
};

/**
 * Create an inline SVG icon element.
 * @param {string} name - icon name from ICONS map
 * @param {string} size - CSS size (default '24px')
 */
function icon(name, size = '24px') {
  const svg = ICONS[name] || ICONS['info'];
  const el = document.createElement('span');
  el.className = 'm-icon-wrap';
  el.style.display = 'inline-flex';
  el.style.alignItems = 'center';
  el.style.justifyContent = 'center';
  el.style.width = size;
  el.style.height = size;
  el.style.flexShrink = '0';
  el.style.color = 'inherit';
  el.style.fill = 'currentColor';
  el.innerHTML = svg;
  el.querySelector('svg').style.width = size;
  el.querySelector('svg').style.height = size;
  el.querySelector('svg').style.fill = 'currentColor';
  return el;
}

/**
 * Icon HTML string helper.
 */
function iconHtml(name, size = '24px') {
  const svg = ICONS[name] || ICONS['info'];
  return `<span class="m-icon-wrap" style="display:inline-flex;align-items:center;justify-content:center;width:${size};height:${size};flex-shrink:0;color:inherit;fill:currentColor;"><svg viewBox="0 0 24 24" fill="currentColor" style="width:${size};height:${size};fill:currentColor;">${svg.replace(/<svg[^>]*>/, '').replace('</svg>', '')}</svg></span>`;
}

// ─── Dialog / Modal ───────────────────────────────────────────────────────────

function showDialog({ icon: iconName, headline, body, actions, onClose, dialogClass } = {}) {
  const portal = document.getElementById('dialog-portal') || document.body;

  const scrim = document.createElement('div');
  scrim.className = 'md-dialog-scrim';
  scrim.setAttribute('role', 'presentation');

  const dialog = document.createElement('div');
  dialog.className = `md-dialog ${dialogClass || ''}`.trim();
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  dialog.setAttribute('aria-labelledby', 'dialog-headline');

  let html = '';
  if (iconName) {
    html += `<div class="md-dialog-icon">${iconHtml(iconName, '32px')}</div>`;
  }
  html += `<div class="md-dialog-headline" id="dialog-headline">${escapeHtml(headline)}</div>`;
  if (body) {
    html += `<div class="md-dialog-body">${typeof body === 'string' ? escapeHtml(body) : ''}</div>`;
  }
  html += `<div class="md-dialog-actions" id="dialog-actions-${Date.now()}"></div>`;
  dialog.innerHTML = html;

  // Insert custom body element if provided
  if (body && typeof body !== 'string') {
    const bodyDiv = dialog.querySelector('.md-dialog-body') || dialog;
    if (body instanceof HTMLElement) {
      if (!dialog.querySelector('.md-dialog-body')) {
        const bodyContainer = document.createElement('div');
        bodyContainer.className = 'md-dialog-body';
        dialog.insertBefore(bodyContainer, dialog.querySelector('.md-dialog-actions'));
      }
      dialog.querySelector('.md-dialog-body').appendChild(body);
    }
  }

  const actionsEl = dialog.querySelector('.md-dialog-actions');

  const close = (result) => {
    scrim.classList.remove('open');
    setTimeout(() => {
      if (scrim.parentNode) scrim.parentNode.removeChild(scrim);
      if (onClose) onClose(result);
    }, 200);
  };

  for (const action of (actions || [])) {
    const btn = document.createElement('button');
    btn.className = `md-btn ${action.className || 'md-btn-text'}`;
    btn.textContent = action.label;
    if (action.id) btn.id = action.id;
    btn.addEventListener('click', () => {
      if (action.onClick) action.onClick(close);
      else close(action.value);
    });
    actionsEl.appendChild(btn);
  }

  scrim.appendChild(dialog);
  portal.appendChild(scrim);

  // Animate in
  requestAnimationFrame(() => {
    scrim.classList.add('open');
  });

  // Close on scrim click
  scrim.addEventListener('click', (e) => {
    if (e.target === scrim) close();
  });

  // Close on Escape
  const escHandler = (e) => {
    if (e.key === 'Escape') {
      close();
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);

  // Trap focus
  const focusable = dialog.querySelectorAll('button, input, select, textarea, [tabindex]');
  if (focusable.length) focusable[0].focus();

  return { close };
}

// ─── Confirm Dialog Helper ────────────────────────────────────────────────────

function showConfirm({ icon, headline, body, confirmLabel = 'Confirm', cancelLabel = 'Cancel', confirmClass = 'md-btn-filled' }) {
  return new Promise((resolve) => {
    showDialog({
      icon,
      headline,
      body,
      actions: [
        { label: cancelLabel, className: 'md-btn-text', onClick: (close) => { close(); resolve(false); } },
        { label: confirmLabel, className: `md-btn ${confirmClass}`, onClick: (close) => { close(); resolve(true); } }
      ]
    });
  });
}

// ─── Snackbar ─────────────────────────────────────────────────────────────────

function showSnackbar(message, { action, actionLabel, duration = 4000 } = {}) {
  const container = document.getElementById('snackbar-container');
  const snackbar = document.createElement('div');
  snackbar.className = 'md-snackbar';
  snackbar.setAttribute('role', 'status');

  const msgSpan = document.createElement('span');
  msgSpan.style.flex = '1';
  msgSpan.textContent = message;
  snackbar.appendChild(msgSpan);

  if (action && actionLabel) {
    const btn = document.createElement('button');
    btn.className = 'md-snackbar-action';
    btn.textContent = actionLabel;
    btn.addEventListener('click', () => { action(); dismiss(); });
    snackbar.appendChild(btn);
  }

  const dismiss = () => {
    snackbar.classList.add('hiding');
    setTimeout(() => {
      if (snackbar.parentNode) snackbar.parentNode.removeChild(snackbar);
    }, 200);
  };

  container.appendChild(snackbar);
  const timer = setTimeout(dismiss, duration);
  snackbar.addEventListener('click', () => { clearTimeout(timer); dismiss(); });
}

// ─── Switch Builder ───────────────────────────────────────────────────────────

function buildSwitch({ id, checked, label, onChange }) {
  const wrapper = document.createElement('label');
  wrapper.className = 'md-switch';
  wrapper.htmlFor = id;

  const input = document.createElement('input');
  input.type = 'checkbox';
  input.id = id;
  input.checked = !!checked;
  input.addEventListener('change', () => onChange && onChange(input.checked));

  const track = document.createElement('span');
  track.className = 'md-switch-track';
  const thumb = document.createElement('span');
  thumb.className = 'md-switch-thumb';
  track.appendChild(thumb);

  wrapper.appendChild(input);
  wrapper.appendChild(track);

  if (label) {
    const labelSpan = document.createElement('span');
    labelSpan.className = 'md-body-large';
    labelSpan.textContent = label;
    wrapper.appendChild(labelSpan);
  }

  return { el: wrapper, input };
}

// ─── Progress ─────────────────────────────────────────────────────────────────

function buildCircularProgress() {
  const el = document.createElement('div');
  el.className = 'md-progress-circular';
  el.innerHTML = `<svg class="md-progress-circular-svg" viewBox="22 22 44 44"><circle class="md-progress-circular-circle" cx="44" cy="44" r="20.2"/></svg>`;
  return el;
}

function buildLinearProgress(indeterminate = true) {
  const el = document.createElement('div');
  el.className = `md-progress-linear${indeterminate ? ' md-progress-linear-indeterminate' : ''}`;
  const bar = document.createElement('div');
  bar.className = 'md-progress-linear-bar';
  el.appendChild(bar);
  return el;
}

// ─── HTML escape ─────────────────────────────────────────────────────────────

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ─── Format date ──────────────────────────────────────────────────────────────

function formatDate(dateStr) {
  if (!dateStr) return 'Never';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 'Never';
  return d.toLocaleString('en-US', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true
  });
}

function formatTime(dateStr) {
  if (!dateStr) return '--';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '--';
  return d.toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

// ─── Material 3 Modal Date Picker ─────────────────────────────────────────────

function showDatePicker({ initialDate, minDate } = {}) {
  return new Promise((resolve) => {
    let current = initialDate ? new Date(initialDate) : new Date();
    if (isNaN(current.getTime())) current = new Date();
    
    let viewYear = current.getFullYear();
    let viewMonth = current.getMonth();
    let selectedDate = new Date(current.getFullYear(), current.getMonth(), current.getDate());

    const min = minDate ? new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate()) : null;

    const container = document.createElement('div');
    container.className = 'm3-datepicker';

    function renderPicker() {
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

      const monthStr = monthNames[viewMonth];
      const formattedHeader = selectedDate.toLocaleDateString('en-US', {
        weekday: 'short', month: 'short', day: 'numeric'
      });

      // Calculate days in month
      const firstDay = new Date(viewYear, viewMonth, 1).getDay();
      const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
      const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

      const today = new Date();
      const isToday = (d) => today.getFullYear() === viewYear && today.getMonth() === viewMonth && today.getDate() === d;
      const isSelected = (d) => selectedDate.getFullYear() === viewYear && selectedDate.getMonth() === viewMonth && selectedDate.getDate() === d;

      container.innerHTML = `
        <div class="m3-datepicker-header">
          <span class="m3-datepicker-overline">Select date</span>
          <span class="m3-datepicker-selected-date">${escapeHtml(formattedHeader)}</span>
        </div>
        <div class="m3-datepicker-nav">
          <button class="md-icon-btn" id="m3-dp-prev" aria-label="Previous month">${iconHtml('chevron_left', '20px')}</button>
          <span class="m3-datepicker-month-year">${monthStr} ${viewYear}</span>
          <button class="md-icon-btn" id="m3-dp-next" aria-label="Next month">${iconHtml('chevron_right', '20px')}</button>
        </div>
        <div class="m3-datepicker-weekdays">
          ${dayNames.map(d => `<span>${d}</span>`).join('')}
        </div>
        <div class="m3-datepicker-grid" id="m3-dp-grid"></div>
      `;

      const grid = container.querySelector('#m3-dp-grid');

      // Prev month filler days
      for (let i = firstDay - 1; i >= 0; i--) {
        const d = daysInPrevMonth - i;
        const btn = document.createElement('button');
        btn.className = 'm3-datepicker-day outside-month';
        btn.textContent = d;
        btn.disabled = true;
        grid.appendChild(btn);
      }

      // Current month days
      for (let d = 1; d <= daysInMonth; d++) {
        const btn = document.createElement('button');
        btn.className = 'm3-datepicker-day';
        if (isToday(d)) btn.classList.add('today');
        if (isSelected(d)) btn.classList.add('selected');

        const dayDate = new Date(viewYear, viewMonth, d);
        if (min && dayDate < min) {
          btn.disabled = true;
        } else {
          btn.addEventListener('click', () => {
            selectedDate = dayDate;
            renderPicker();
          });
        }

        btn.textContent = d;
        grid.appendChild(btn);
      }

      // Next month filler days (fill up to 42 cells total)
      const remainingCells = 42 - (firstDay + daysInMonth);
      for (let d = 1; d <= remainingCells; d++) {
        const btn = document.createElement('button');
        btn.className = 'm3-datepicker-day outside-month';
        btn.textContent = d;
        btn.disabled = true;
        grid.appendChild(btn);
      }

      // Navigation clicks
      container.querySelector('#m3-dp-prev')?.addEventListener('click', () => {
        if (viewMonth === 0) { viewMonth = 11; viewYear--; }
        else { viewMonth--; }
        renderPicker();
      });

      container.querySelector('#m3-dp-next')?.addEventListener('click', () => {
        if (viewMonth === 11) { viewMonth = 0; viewYear++; }
        else { viewMonth++; }
        renderPicker();
      });
    }

    renderPicker();

    showDialog({
      headline: 'Select Date',
      dialogClass: 'md-dialog-picker',
      body: container,
      actions: [
        {
          label: 'Cancel',
          className: 'md-btn-text',
          onClick: (close) => { close(); resolve(null); }
        },
        {
          label: 'OK',
          className: 'md-btn-filled',
          onClick: (close) => {
            const yyyy = selectedDate.getFullYear();
            const mm = String(selectedDate.getMonth() + 1).padStart(2, '0');
            const dd = String(selectedDate.getDate()).padStart(2, '0');
            close();
            resolve(`${yyyy}-${mm}-${dd}`);
          }
        }
      ]
    });
  });
}

// ─── Material 3 Dial Time Picker ─────────────────────────────────────────────

function showTimePicker({ initialTime } = {}) {
  return new Promise((resolve) => {
    let hour = 12;
    let minute = 0;
    let isPM = false;
    let unit = 'hour'; // 'hour' | 'minute'
    let inputMode = false; // false = dial, true = keyboard input
    let isDragging = false;

    if (initialTime && typeof initialTime === 'string') {
      const parts = initialTime.split(':');
      if (parts.length >= 2) {
        let h = parseInt(parts[0], 10);
        let m = parseInt(parts[1], 10);
        if (!isNaN(h)) { isPM = h >= 12; hour = h % 12 || 12; }
        if (!isNaN(m)) minute = Math.min(59, Math.max(0, m));
      }
    } else {
      const now = new Date();
      const h = now.getHours();
      isPM = h >= 12;
      hour = h % 12 || 12;
      minute = now.getMinutes();
    }

    const container = document.createElement('div');
    container.className = 'm3-timepicker';

    function buildUI() {
      const hourStr = String(hour).padStart(2, '0');
      const minStr = String(minute).padStart(2, '0');

      container.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
          <div class="m3-timepicker-title" style="margin-bottom:0">${inputMode ? 'Enter time' : 'Select time'}</div>
          <button type="button" class="md-icon-btn" id="m3tp-mode-toggle" title="${inputMode ? 'Switch to clock dial' : 'Switch to keyboard input'}" aria-label="Toggle input mode">
            ${iconHtml(inputMode ? 'schedule' : 'keyboard', '20px')}
          </button>
        </div>

        <div class="m3-timepicker-time-row">
          <div class="m3-timepicker-input-group">
            <div class="m3-timepicker-box ${unit === 'hour' ? 'active' : ''}" id="m3tp-hour-box">
              <span id="m3tp-hour-text" style="${inputMode ? 'display:none' : ''}">${hourStr}</span>
              <input type="text" id="m3tp-hour-input" class="m3-timepicker-input" maxlength="2" inputmode="numeric" value="${hourStr}" style="${inputMode ? '' : 'display:none'}" aria-label="Hour input">
            </div>
            <span class="m3-timepicker-sublabel" style="${inputMode ? '' : 'opacity:0'}">Hour</span>
          </div>

          <span class="m3-timepicker-colon">:</span>

          <div class="m3-timepicker-input-group">
            <div class="m3-timepicker-box ${unit === 'minute' ? 'active' : ''}" id="m3tp-min-box">
              <span id="m3tp-min-text" style="${inputMode ? 'display:none' : ''}">${minStr}</span>
              <input type="text" id="m3tp-min-input" class="m3-timepicker-input" maxlength="2" inputmode="numeric" value="${minStr}" style="${inputMode ? '' : 'display:none'}" aria-label="Minute input">
            </div>
            <span class="m3-timepicker-sublabel" style="${inputMode ? '' : 'opacity:0'}">Minute</span>
          </div>

          <div class="m3-timepicker-period">
            <button type="button" class="m3-timepicker-period-btn ${!isPM ? 'active' : ''}" id="m3tp-am">AM</button>
            <button type="button" class="m3-timepicker-period-btn ${isPM ? 'active' : ''}" id="m3tp-pm">PM</button>
          </div>
        </div>

        <div class="m3-timepicker-dial-container" style="${inputMode ? 'display:none' : ''}">
          <div class="m3-timepicker-dial-face" id="m3tp-dial">
            <div class="m3-timepicker-dial-center"></div>
            <div class="m3-timepicker-dial-hand" id="m3tp-hand">
              <div class="m3-timepicker-dial-thumb"></div>
            </div>
            <div class="m3-timepicker-dial-numbers" id="m3tp-numbers"></div>
          </div>
        </div>
      `;

      wireListeners();
      if (!inputMode) {
        renderDial();
      } else {
        const inputToFocus = unit === 'hour'
          ? container.querySelector('#m3tp-hour-input')
          : container.querySelector('#m3tp-min-input');
        if (inputToFocus) {
          setTimeout(() => {
            inputToFocus.focus();
            inputToFocus.select();
          }, 50);
        }
      }
    }

    function renderDial() {
      const hand = container.querySelector('#m3tp-hand');
      const numbersEl = container.querySelector('#m3tp-numbers');
      if (!hand || !numbersEl) return;

      numbersEl.innerHTML = '';
      const radius = 96;
      const center = 128;

      if (unit === 'hour') {
        for (let num = 1; num <= 12; num++) {
          const angleRad = (num * 30 - 90) * Math.PI / 180;
          const x = center + radius * Math.cos(angleRad);
          const y = center + radius * Math.sin(angleRad);

          const el = document.createElement('div');
          el.className = `m3-timepicker-number${num === hour ? ' selected' : ''}`;
          el.style.left = `${x}px`;
          el.style.top = `${y}px`;
          el.textContent = num;
          numbersEl.appendChild(el);
        }
        hand.style.transform = `translate(-50%, 0) rotate(${(hour % 12) * 30}deg)`;

      } else {
        for (let i = 0; i < 12; i++) {
          const minVal = i * 5;
          const angleRad = (i * 30 - 90) * Math.PI / 180;
          const x = center + radius * Math.cos(angleRad);
          const y = center + radius * Math.sin(angleRad);

          const isSelected = minute === minVal;
          const el = document.createElement('div');
          el.className = `m3-timepicker-number${isSelected ? ' selected' : ''}`;
          el.style.left = `${x}px`;
          el.style.top = `${y}px`;
          el.textContent = String(minVal).padStart(2, '0');
          numbersEl.appendChild(el);
        }
        hand.style.transform = `translate(-50%, 0) rotate(${minute * 6}deg)`;
      }
    }

    function updateFromPointer(e, isRelease = false) {
      const dial = container.querySelector('#m3tp-dial');
      if (!dial) return;
      const rect = dial.getBoundingClientRect();
      const dx = e.clientX - (rect.left + rect.width / 2);
      const dy = e.clientY - (rect.top + rect.height / 2);
      let angle = Math.atan2(dy, dx) * 180 / Math.PI + 90;
      if (angle < 0) angle += 360;

      if (unit === 'hour') {
        let h = Math.round(angle / 30) % 12;
        hour = h === 0 ? 12 : h;
        const hourText = container.querySelector('#m3tp-hour-text');
        if (hourText) hourText.textContent = String(hour).padStart(2, '0');
        const hourInput = container.querySelector('#m3tp-hour-input');
        if (hourInput) hourInput.value = String(hour).padStart(2, '0');

        const hand = container.querySelector('#m3tp-hand');
        if (hand) hand.style.transform = `translate(-50%, 0) rotate(${(hour % 12) * 30}deg)`;

        container.querySelectorAll('.m3-timepicker-number').forEach(el => {
          el.classList.toggle('selected', parseInt(el.textContent, 10) === hour);
        });

        if (isRelease) {
          setTimeout(() => {
            unit = 'minute';
            buildUI();
          }, 200);
        }
      } else {
        // Precise continuous minute selection from 0 to 59
        minute = Math.round(angle / 6) % 60;
        const minText = container.querySelector('#m3tp-min-text');
        if (minText) minText.textContent = String(minute).padStart(2, '0');
        const minInput = container.querySelector('#m3tp-min-input');
        if (minInput) minInput.value = String(minute).padStart(2, '0');

        const hand = container.querySelector('#m3tp-hand');
        if (hand) hand.style.transform = `translate(-50%, 0) rotate(${minute * 6}deg)`;

        container.querySelectorAll('.m3-timepicker-number').forEach(el => {
          const v = parseInt(el.textContent, 10);
          el.classList.toggle('selected', v === minute);
        });
      }
    }

    function wireListeners() {
      // Toggle dial vs direct keyboard input
      container.querySelector('#m3tp-mode-toggle')?.addEventListener('click', () => {
        inputMode = !inputMode;
        buildUI();
      });

      // Hour & Minute Box selection
      container.querySelector('#m3tp-hour-box')?.addEventListener('click', () => {
        unit = 'hour';
        if (inputMode) {
          const inp = container.querySelector('#m3tp-hour-input');
          if (inp) { inp.focus(); inp.select(); }
        } else {
          buildUI();
        }
      });

      container.querySelector('#m3tp-min-box')?.addEventListener('click', () => {
        unit = 'minute';
        if (inputMode) {
          const inp = container.querySelector('#m3tp-min-input');
          if (inp) { inp.focus(); inp.select(); }
        } else {
          buildUI();
        }
      });

      // AM / PM
      container.querySelector('#m3tp-am')?.addEventListener('click', () => {
        isPM = false;
        container.querySelector('#m3tp-am')?.classList.add('active');
        container.querySelector('#m3tp-pm')?.classList.remove('active');
      });
      container.querySelector('#m3tp-pm')?.addEventListener('click', () => {
        isPM = true;
        container.querySelector('#m3tp-pm')?.classList.add('active');
        container.querySelector('#m3tp-am')?.classList.remove('active');
      });

      // Keyboard Inputs
      const hourInput = container.querySelector('#m3tp-hour-input');
      const minInput = container.querySelector('#m3tp-min-input');

      if (hourInput) {
        hourInput.addEventListener('input', (e) => {
          let val = e.target.value.replace(/\D/g, '');
          if (val.length > 2) val = val.slice(-2);
          e.target.value = val;
          if (val.length === 2) {
            let num = parseInt(val, 10);
            if (num < 1) num = 1;
            if (num > 12) num = 12;
            hour = num;
            unit = 'minute';
            if (minInput) { minInput.focus(); minInput.select(); }
          }
        });
        hourInput.addEventListener('blur', () => {
          let num = parseInt(hourInput.value, 10);
          if (isNaN(num) || num < 1) num = 12;
          if (num > 12) num = 12;
          hour = num;
          hourInput.value = String(num).padStart(2, '0');
        });
      }

      if (minInput) {
        minInput.addEventListener('input', (e) => {
          let val = e.target.value.replace(/\D/g, '');
          if (val.length > 2) val = val.slice(-2);
          e.target.value = val;
          if (val.length === 2) {
            let num = parseInt(val, 10);
            if (num < 0) num = 0;
            if (num > 59) num = 59;
            minute = num;
          }
        });
        minInput.addEventListener('blur', () => {
          let num = parseInt(minInput.value, 10);
          if (isNaN(num) || num < 0) num = 0;
          if (num > 59) num = 59;
          minute = num;
          minInput.value = String(num).padStart(2, '0');
        });
      }

      // Dial pointer events (smooth dragging + clicking)
      const dial = container.querySelector('#m3tp-dial');
      if (dial) {
        dial.addEventListener('pointerdown', (e) => {
          e.preventDefault();
          isDragging = true;
          updateFromPointer(e, false);

          const onPointerMove = (moveEvent) => {
            if (!isDragging) return;
            updateFromPointer(moveEvent, false);
          };

          const onPointerUp = (upEvent) => {
            if (isDragging) {
              isDragging = false;
              updateFromPointer(upEvent, true);
            }
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerup', onPointerUp);
          };

          window.addEventListener('pointermove', onPointerMove);
          window.addEventListener('pointerup', onPointerUp);
        });
      }
    }

    buildUI();

    showDialog({
      headline: 'Select Time',
      dialogClass: 'md-dialog-picker',
      body: container,
      actions: [
        { label: 'Cancel', className: 'md-btn-text', onClick: (close) => { close(); resolve(null); } },
        {
          label: 'OK',
          className: 'md-btn-filled',
          onClick: (close) => {
            if (inputMode) {
              const hInp = container.querySelector('#m3tp-hour-input');
              const mInp = container.querySelector('#m3tp-min-input');
              if (hInp) {
                let h = parseInt(hInp.value, 10);
                if (!isNaN(h) && h >= 1 && h <= 12) hour = h;
              }
              if (mInp) {
                let m = parseInt(mInp.value, 10);
                if (!isNaN(m) && m >= 0 && m <= 59) minute = m;
              }
            }
            let h24 = hour % 12;
            if (isPM) h24 += 12;
            close();
            resolve(`${String(h24).padStart(2, '0')}:${String(minute).padStart(2, '0')}`);
          }
        }
      ]
    });
  });
}

// Expose globally
window.UI = {
  icon, iconHtml, showDialog, showConfirm, showSnackbar,
  showDatePicker, showTimePicker,
  buildSwitch, buildCircularProgress, buildLinearProgress,
  escapeHtml, formatDate, formatTime, ICONS
};

