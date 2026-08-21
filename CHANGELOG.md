# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2026-08-21

### Changed
- Rebranded product display name to **Git Batch Cloner**.
- Set official Windows application publisher name to **AFNAN**.
- Updated desktop shortcut, tray menu items, installer script, and window titles to Git Batch Cloner.

## [1.0.0] - 2026-08-16

### Added
- **Windows System Tray Lifecycle** — Runs silently in the background with full tray context menu controls (*Open Dashboard*, *Clone Now*, *Edit Repositories*, *Scheduled Clones*, *Activity Logs*, *Settings*, *Exit*).
- **Windows Startup Integration** — Option to launch minimized into the system tray on Windows boot.
- **Material 3 Design System** — Complete Material Design 3 (Material You) desktop interface supporting Dynamic System, Dark, and Light color themes.
- **Interactive Material 3 Time Picker** — 360° analog dial clock with continuous pointer dragging across all minutes (00–59) and hours (1–12), smooth non-reversing rotation, and direct keyboard numeric input mode.
- **Modal Calendar Date Picker** — Material 3 calendar modal with month navigation, min-date validation, and selection states.
- **GitHub Repository & User Auto-Cloning** — Automated discovery and batch cloning for entire GitHub user profiles (`username`) and specific repositories (`owner/repo`).
- **Configurable Scheduler** — Background periodic check intervals (15m, 30m, 1h, 2h, 6h, 12h, 24h) and one-time scheduled calendar jobs.
- **Live Clone Progress Streaming** — Real-time Git stdout/stderr progress parsing with live log output in the dashboard.
- **Local SQLite Database Engine** — Embedded WebAssembly SQLite (`sql.js`) for persistent local storage of settings, scheduled jobs, repository targets, and logs.
- **Searchable Activity Logs** — Detailed log history with keyword search and status filter chips (*Success*, *Failed*, *Skipped*, *Info*).
- **Native Windows Notifications** — Desktop toast alerts for completed, skipped, or failed clone operations.
- **Zero-CDN Offline Architecture** — Bundled Roboto typography, local inline SVG icon set, and embedded database dependencies for full offline operation.
- **NSIS Windows Installer** — Electron-builder setup wizard with custom directory choice, desktop shortcuts, start menu entries, and instant launch capability.

### Security
- Enforced Electron security best practices with `contextIsolation: true`, `nodeIntegration: false`, and sandbox-compatible contextBridge APIs.
- Localized token security: GitHub Personal Access Tokens stored strictly in the local database and never leaked in activity logs.
- Sanitized child process execution for Git commands.
