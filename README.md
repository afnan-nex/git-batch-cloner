# Git Cloner

A production-ready Windows desktop GUI application built with **Node.js + Electron** and designed with a complete **Material Design 3 (Material You)** system.

Git Cloner runs silently in the background, lives in the Windows system tray, starts automatically with Windows, maintains a local SQLite database of GitHub users & repositories, periodically checks for updates/new repositories, and automatically clones them with real-time progress logging.

---

## Key Features

- **Windows System Tray Integration** — Runs unobtrusively in the system tray with custom Material You context menu actions (*Open Dashboard*, *Clone Now*, *Edit Repositories*, *Scheduled Clones*, *Activity Logs*, *Settings*, *Exit*).
- **Windows Startup Integration** — Configurable option to start minimized on Windows boot.
- **Material 3 Design System** — Dynamic light, dark, and system themes with curated color tokens, surfaces, elevations, buttons, cards, status chips, and typography.
- **Interactive Material 3 Date & Time Pickers**:
  - **Modal Calendar Date Picker**: Month navigation, constraints, and M3 surface styling.
  - **Interactive 360° Dial Clock Time Picker**: Smooth continuous pointer dragging for selecting any exact hour (1–12) and minute (00–59) with instant angle tracking and direct keyboard input mode.
- **Automated & Custom Scheduling**:
  - Periodic background interval checks (15m, 30m, 1h, 2h, 6h, 12h, 24h).
  - One-time scheduled calendar backups.
- **Batch Cloning & Monitoring**:
  - Target individual repositories (`owner/repo`) or entire user accounts (`username`).
  - Automatically fetches all repositories for a user and clones missing ones.
  - Optional overwrite mode to re-clone existing folders.
- **Offline-First / Zero CDN**:
  - 100% self-contained with bundled Roboto fonts, local SVG icon system, and embedded WebAssembly SQLite (`sql.js`).
- **Activity & Clone Logging** — Full searchable history of all clone operations (cloned, skipped, failed).
- **Windows Notifications** — Native desktop toast notifications upon job completion.

---

## Requirements

* **OS:** Windows 10 or Windows 11 (x64)
* **Git:** [Git for Windows](https://git-scm.com/download/win) installed and accessible via `PATH`
* **Node.js:** Node.js 18+ & npm (for local development and building)

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run in Development Mode
```bash
npm run dev
```

### 3. Build Windows Executable & Installer
```bash
npm run build
```

Generated outputs in the `dist/` directory:
* **Installer:** `dist/Git Cloner Setup 1.0.0.exe` (NSIS with custom directory selection and desktop/start menu shortcuts)
* **Unpacked Executable:** `dist/win-unpacked/Git Cloner.exe`

---

## Architecture Overview

```
src/
├── main/             # Electron main process
│   ├── main.js       # App lifecycle, single-instance lock, window manager
│   ├── ipc.js        # Secure IPC handlers
│   ├── tray.js       # System tray setup & context menu
│   └── startup.js    # Windows registry startup configuration
├── database/         # Local SQLite database (sql.js Wasm)
│   ├── database.js   # Database connection & persistence
│   ├── migrations.js # Schema versioning & migrations
│   └── repositories.js# Repository, schedule, logs, and settings DAL
├── services/         # Core business logic
│   ├── cloneService.js     # Git clone execution & real-time progress parsing
│   ├── githubService.js    # GitHub REST API client (pagination, auth, rate limit)
│   ├── schedulerService.js # Cron and interval background timers
│   ├── gitService.js       # Git binary detection & path verification
│   └── notificationService.js # Native Windows notifications
├── renderer/         # Material 3 SPA GUI
│   ├── index.html    # Single-page application shell
│   ├── preload.js    # Secure contextBridge API
│   ├── css/          # Vanilla CSS Material 3 design system & themes
│   └── js/           # Components, SPA router, and page controllers
└── utils/            # Shared string formatting & path helpers
```

---

## Security

* `contextIsolation: true` and `nodeIntegration: false` enforced.
* IPC communication through secure `contextBridge` preload whitelist.
* GitHub Personal Access Tokens stored strictly in local SQLite and never exposed in logs.
* Process isolation and sanitized shell executions.

---

## License

MIT License. Built with Electron & Material Design 3.
