'use strict';

/**
 * Parse a GitHub URL or bare username/repo into structured data.
 * Accepts:
 *   afnan-nex
 *   https://github.com/afnan-nex
 *   https://github.com/afnan-nex/example
 *
 * Returns { type: 'user'|'repo', username, repoName|null } or null on failure.
 */
function parseGitHubInput(input) {
  if (!input || typeof input !== 'string') return null;

  // Trim and strip trailing slashes, query params, fragments
  let cleaned = input.trim().replace(/[?#].*$/, '').replace(/\/+$/, '');

  // Full URL
  if (cleaned.startsWith('http://') || cleaned.startsWith('https://')) {
    try {
      const url = new URL(cleaned);
      if (url.hostname !== 'github.com') return null;
      const parts = url.pathname.split('/').filter(Boolean);
      if (parts.length === 0) return null;
      if (parts.length === 1) {
        return { type: 'user', username: parts[0], repoName: null };
      }
      return { type: 'repo', username: parts[0], repoName: parts[1] };
    } catch {
      return null;
    }
  }

  // Bare "username" or "username/repo"
  const parts = cleaned.split('/').filter(Boolean);
  if (parts.length === 0) return null;
  if (parts.length === 1) {
    if (!isValidGitHubName(parts[0])) return null;
    return { type: 'user', username: parts[0], repoName: null };
  }
  if (parts.length === 2) {
    if (!isValidGitHubName(parts[0]) || !isValidGitHubName(parts[1])) return null;
    return { type: 'repo', username: parts[0], repoName: parts[1] };
  }
  return null;
}

function isValidGitHubName(name) {
  return /^[a-zA-Z0-9_.-]{1,100}$/.test(name);
}

/**
 * Format a date for display.
 */
function formatDate(dateStr) {
  if (!dateStr) return 'Never';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 'Never';
  return d.toLocaleString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Format time only for display.
 */
function formatTime(dateStr) {
  if (!dateStr) return '--';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '--';
  return d.toLocaleString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Sanitize a name for use as a filesystem component.
 */
function sanitizeFsName(name) {
  return name.replace(/[<>:"/\\|?*\x00-\x1f]/g, '_').substring(0, 100);
}

/**
 * Expand %USERPROFILE% or ~ in a path.
 */
function expandPath(p) {
  if (!p) return p;
  return p
    .replace(/^~/, process.env.USERPROFILE || process.env.HOME || '')
    .replace(/%USERPROFILE%/gi, process.env.USERPROFILE || '')
    .replace(/%HOME%/gi, process.env.HOME || '');
}

module.exports = { parseGitHubInput, formatDate, formatTime, sanitizeFsName, expandPath, isValidGitHubName };
