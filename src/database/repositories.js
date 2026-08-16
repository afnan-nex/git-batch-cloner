'use strict';

const { getDb, persistDb } = require('./database');

function now() {
  return new Date().toISOString().replace('T', ' ').split('.')[0];
}

// ─── Settings ────────────────────────────────────────────────────────────────

function getSetting(key) {
  const db = getDb();
  return db.prepare('SELECT value FROM settings WHERE key = ?').get(key)?.value ?? null;
}

function setSetting(key, value) {
  const db = getDb();
  db.prepare(
    'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)'
  ).run(key, String(value));
}

function getAllSettings() {
  const db = getDb();
  const rows = db.prepare('SELECT key, value FROM settings').all();
  const result = {};
  for (const row of rows) result[row.key] = row.value;
  return result;
}

// ─── Repositories ─────────────────────────────────────────────────────────────

function getAllRepositories() {
  return getDb().prepare('SELECT * FROM repositories ORDER BY created_at DESC').all();
}

function getRepositoryById(id) {
  return getDb().prepare('SELECT * FROM repositories WHERE id = ?').get(id);
}

function getEnabledRepositories() {
  return getDb().prepare('SELECT * FROM repositories WHERE enabled = 1').all();
}

function addRepository(data) {
  const db = getDb();
  const ts = now();
  const result = db.prepare(`
    INSERT INTO repositories (source, type, username, repository_name, enabled, clone_path, created_at, updated_at)
    VALUES (?, ?, ?, ?, 1, ?, ?, ?)
  `).run(data.source, data.type, data.username, data.repoName || null, data.clonePath || null, ts, ts);
  return result.lastInsertRowid;
}

function updateRepository(id, fields) {
  const db = getDb();
  const sets = [];
  const vals = [];
  for (const [k, v] of Object.entries(fields)) {
    sets.push(`${k} = ?`);
    vals.push(v);
  }
  sets.push('updated_at = ?');
  vals.push(now());
  vals.push(id);
  db.prepare(`UPDATE repositories SET ${sets.join(', ')} WHERE id = ?`).run(...vals);
}

function deleteRepository(id) {
  const db = getDb();
  db.prepare('DELETE FROM repositories WHERE id = ?').run(id);
  db.prepare('DELETE FROM cloned_repos WHERE repository_id = ?').run(id);
}

function setRepositoryLastChecked(id) {
  const db = getDb();
  const ts = now();
  db.prepare(
    'UPDATE repositories SET last_checked_at = ?, updated_at = ? WHERE id = ?'
  ).run(ts, ts, id);
}

// ─── Cloned Repos ────────────────────────────────────────────────────────────

function isRepoCloned(repositoryId, repoFullName) {
  const row = getDb().prepare(
    'SELECT id FROM cloned_repos WHERE repository_id = ? AND repo_full_name = ?'
  ).get(repositoryId, repoFullName);
  return !!row;
}

function markRepoCloned(repositoryId, repoFullName, clonePath) {
  const db = getDb();
  const ts = now();

  // Check if exists
  const existing = db.prepare(
    'SELECT id FROM cloned_repos WHERE repository_id = ? AND repo_full_name = ?'
  ).get(repositoryId, repoFullName);

  if (existing) {
    db.prepare(
      'UPDATE cloned_repos SET cloned_at = ?, clone_path = ? WHERE repository_id = ? AND repo_full_name = ?'
    ).run(ts, clonePath || null, repositoryId, repoFullName);
  } else {
    db.prepare(
      'INSERT INTO cloned_repos (repository_id, repo_full_name, cloned_at, clone_path) VALUES (?, ?, ?, ?)'
    ).run(repositoryId, repoFullName, ts, clonePath || null);
  }

  db.prepare('UPDATE repositories SET last_cloned_at = ? WHERE id = ?').run(ts, repositoryId);
}

function getClonedReposForEntry(repositoryId) {
  return getDb().prepare(
    'SELECT * FROM cloned_repos WHERE repository_id = ? ORDER BY cloned_at DESC'
  ).all(repositoryId);
}

// ─── Logs ─────────────────────────────────────────────────────────────────────

function addLog(data) {
  const db = getDb();
  db.prepare(`
    INSERT INTO clone_logs (repository_id, repository_name, repository_url, action, status, message, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    data.repositoryId || null,
    data.repositoryName || null,
    data.repositoryUrl || null,
    data.action,
    data.status,
    data.message || null,
    now()
  );
}

function getLogs(filters = {}) {
  const db = getDb();
  let sql = 'SELECT * FROM clone_logs';
  const conditions = [];
  const params = [];

  if (filters.status) { conditions.push('status = ?'); params.push(filters.status); }
  if (filters.search) {
    conditions.push('(repository_name LIKE ? OR message LIKE ?)');
    params.push(`%${filters.search}%`, `%${filters.search}%`);
  }
  if (filters.dateFrom) { conditions.push('timestamp >= ?'); params.push(filters.dateFrom); }
  if (filters.dateTo)   { conditions.push('timestamp <= ?'); params.push(filters.dateTo); }

  if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
  sql += ' ORDER BY timestamp DESC LIMIT 500';

  return db.prepare(sql).all(...params);
}

function clearLogs() {
  getDb().prepare('DELETE FROM clone_logs').run();
}

// ─── Scheduled Jobs ──────────────────────────────────────────────────────────

function addScheduledJob(data) {
  const db = getDb();
  const ts = now();
  const result = db.prepare(`
    INSERT INTO scheduled_jobs (label, scheduled_at, repository_id, status, created_at)
    VALUES (?, ?, ?, 'pending', ?)
  `).run(data.label || 'Scheduled Clone', data.scheduledAt, data.repositoryId || null, ts);
  return result.lastInsertRowid;
}

function getPendingScheduledJobs() {
  const db = getDb();
  const ts = now();
  return db.prepare(
    "SELECT * FROM scheduled_jobs WHERE status = 'pending' AND scheduled_at <= ? ORDER BY scheduled_at ASC"
  ).all(ts);
}

function getAllScheduledJobs() {
  return getDb().prepare('SELECT * FROM scheduled_jobs ORDER BY scheduled_at DESC').all();
}

function markScheduledJobDone(id) {
  getDb().prepare(
    "UPDATE scheduled_jobs SET status = 'done', executed_at = ? WHERE id = ?"
  ).run(now(), id);
}

function deleteScheduledJob(id) {
  getDb().prepare('DELETE FROM scheduled_jobs WHERE id = ?').run(id);
}

module.exports = {
  getSetting, setSetting, getAllSettings,
  getAllRepositories, getRepositoryById, getEnabledRepositories,
  addRepository, updateRepository, deleteRepository, setRepositoryLastChecked,
  isRepoCloned, markRepoCloned, getClonedReposForEntry,
  addLog, getLogs, clearLogs,
  addScheduledJob, getPendingScheduledJobs, getAllScheduledJobs,
  markScheduledJobDone, deleteScheduledJob
};
