'use strict';

const path = require('path');
const fs = require('fs');
const { app } = require('electron');

let _db = null;         // sql.js Database instance
let _sqlPrep = null;    // Original sql.js prepare function (before our monkey-patch)
let _dbPath = null;

/**
 * Initializes sql.js asynchronously. Must be awaited once on app startup.
 */
async function initDb() {
  if (_db) return _db;

  const initSqlJs = require('sql.js');
  const wasmPath = path.join(path.dirname(require.resolve('sql.js')), 'sql-wasm.wasm');
  
  const SQL = await initSqlJs({
    locateFile: (file) => {
      if (file.endsWith('.wasm')) {
        return wasmPath;
      }
      return file;
    }
  });

  const userDataDir = app ? app.getPath('userData') : process.cwd();
  if (!fs.existsSync(userDataDir)) {
    fs.mkdirSync(userDataDir, { recursive: true });
  }
  _dbPath = path.join(userDataDir, 'github-auto-cloner.db');

  // Load existing DB or create new
  if (fs.existsSync(_dbPath)) {
    const buf = fs.readFileSync(_dbPath);
    _db = new SQL.Database(buf);
  } else {
    _db = new SQL.Database();
  }

  _db.run('PRAGMA foreign_keys = ON');

  // Store reference to the ORIGINAL sql.js prepare before patching
  _sqlPrep = _db.prepare.bind(_db);

  // Monkey-patch prepare to return our compatibility wrapper
  _db.prepare = function(sql) {
    return new StmtWrapper(_sqlPrep, sql);
  };

  const { runMigrations } = require('./migrations');
  runMigrations(_db);

  // Persist initial schema / seed data
  persist();

  return _db;
}

/**
 * Returns the singleton Database instance synchronously.
 */
function getDb() {
  if (!_db) {
    throw new Error('Database not initialized. initDb() must be called first.');
  }
  return _db;
}

/**
 * Wrapper that exposes better-sqlite3-like .run(), .get(), .all() API.
 */
class StmtWrapper {
  constructor(sqlPrepFn, sql) {
    this._prepFn = sqlPrepFn;
    this._sql = sql;
  }

  run(...args) {
    const params = flattenParams(args);
    const stmt = this._prepFn(this._sql);
    stmt.run(params.length > 0 ? params : undefined);
    stmt.free();
    persist();
    // Get last insert rowid
    const idStmt = this._prepFn('SELECT last_insert_rowid() as id');
    idStmt.step();
    const row = idStmt.getAsObject();
    idStmt.free();
    return { lastInsertRowid: row.id, changes: 1 };
  }

  get(...args) {
    const params = flattenParams(args);
    const stmt = this._prepFn(this._sql);
    stmt.bind(params.length > 0 ? params : []);
    if (stmt.step()) {
      const row = stmt.getAsObject();
      stmt.free();
      return row;
    }
    stmt.free();
    return undefined;
  }

  all(...args) {
    const params = flattenParams(args);
    const results = [];
    const stmt = this._prepFn(this._sql);
    stmt.bind(params.length > 0 ? params : []);
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    stmt.free();
    return results;
  }
}

function flattenParams(args) {
  if (args.length === 0) return [];
  if (args.length === 1 && Array.isArray(args[0])) return args[0];
  if (args.length === 1 && args[0] !== null && typeof args[0] === 'object' && !Array.isArray(args[0])) return args[0];
  return args;
}

function persist() {
  if (!_db || !_dbPath) return;
  try {
    const data = _db.export();
    fs.writeFileSync(_dbPath, Buffer.from(data));
  } catch (err) {
    console.error('DB persist error:', err.message);
  }
}

function persistDb() { persist(); }

function closeDb() {
  if (_db) {
    persist();
    _db.close();
    _db = null;
    _sqlPrep = null;
  }
}

module.exports = { initDb, getDb, persistDb, closeDb };
