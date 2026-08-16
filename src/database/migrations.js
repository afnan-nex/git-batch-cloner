'use strict';

/**
 * Runs all database migrations.
 * Compatible with both sql.js and better-sqlite3.
 */
function runMigrations(db) {
  // sql.js uses db.run() for single statements; exec is our wrapper
  const run = (sql) => {
    try {
      db.run(sql);
    } catch (e) {
      // Ignore "already exists" errors from IF NOT EXISTS
    }
  };

  run(`CREATE TABLE IF NOT EXISTS repositories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source TEXT NOT NULL,
    type TEXT NOT NULL,
    username TEXT NOT NULL,
    repository_name TEXT,
    enabled INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    last_checked_at TEXT,
    last_cloned_at TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    clone_path TEXT
  )`);

  run(`CREATE TABLE IF NOT EXISTS clone_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    repository_id INTEGER,
    repository_name TEXT,
    repository_url TEXT,
    action TEXT NOT NULL,
    status TEXT NOT NULL,
    message TEXT,
    timestamp TEXT NOT NULL DEFAULT (datetime('now'))
  )`);

  run(`CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  )`);

  run(`CREATE TABLE IF NOT EXISTS scheduled_jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    label TEXT,
    scheduled_at TEXT NOT NULL,
    repository_id INTEGER,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    executed_at TEXT
  )`);

  run(`CREATE TABLE IF NOT EXISTS cloned_repos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    repository_id INTEGER NOT NULL,
    repo_full_name TEXT NOT NULL,
    cloned_at TEXT NOT NULL DEFAULT (datetime('now')),
    clone_path TEXT
  )`);

  // Try creating unique index separately (may already exist)
  try {
    db.run(`CREATE UNIQUE INDEX IF NOT EXISTS idx_cloned_repos_unique ON cloned_repos(repository_id, repo_full_name)`);
  } catch {}

  // Seed default settings
  const defaults = {
    theme: 'system',
    start_with_windows: '1',
    minimize_to_tray: '1',
    auto_checking: '1',
    check_interval_ms: String(60 * 60 * 1000),
    clone_directory: '%USERPROFILE%\\Downloads',
    overwrite_existing: '1',
    github_token: '',
    last_check_time: '',
    next_check_time: ''
  };

  for (const [key, value] of Object.entries(defaults)) {
    try {
      db.run(`INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)`, [key, value]);
    } catch {}
  }
}

module.exports = { runMigrations };
