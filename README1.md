# Git Batch Cloner

A lightweight Python utility for backing up GitHub repositories by retrieving repository information through the official GitHub REST API and cloning them with Git.

Designed for developers who want to maintain local backups of repositories they own or have permission to access.

---

## Quick Start

Run directly without downloading the project:

```cmd
curl -L -o "%TEMP%\git_batch_cloner.py" https://raw.githubusercontent.com/afnan-nex/git-batch-cloner/main/git_batch_cloner.py && python "%TEMP%\git_batch_cloner.py"

```

---

## Features

- Clone every public repository from a GitHub user or organization
- Supports GitHub profile URLs and usernames
- Automatic pagination for accounts with hundreds of repositories
- Resume interrupted operations
- Skip repositories that already exist
- Optional support for private repositories using a GitHub Personal Access Token
- Optional update mode (`git pull`)
- Optional shallow cloning
- Progress tracking
- Detailed logging
- Cross-platform (Windows, Linux, and macOS)

---

## Usage Examples

Clone all repositories from a user:

```bash
python git_batch_cloner.py afnan-nex
```

Clone using a GitHub profile URL:

```bash
python git_batch_cloner.py https://github.com/afnan-nex
```

Choose an output directory:

```bash
python git_batch_cloner.py afnan-nex --output D:\GitHubBackup
```

Perform shallow clones:

```bash
python git_batch_cloner.py afnan-nex --shallow
```

Update existing repositories:

```bash
python git_batch_cloner.py afnan-nex --update
```

---

## Folder Structure

```
GitHubBackup/
└── username/
    ├── repository-1/
    ├── repository-2/
    ├── repository-3/
    └── ...
```

---

## Private Repository Support

If a `GITHUB_TOKEN` environment variable is available, the application can also access repositories that the authenticated user has permission to clone.

Without a token, only publicly accessible repositories are processed.

---

## How It Works

1. Accepts a GitHub username or profile URL.
2. Retrieves repository information through the official GitHub REST API.
3. Automatically handles API pagination.
4. Clones repositories using the standard Git client.
5. Skips existing repositories to allow safe resuming.
6. Generates logs for successful, skipped, and failed operations.

---

## Use Cases

- Backup your own GitHub account
- Mirror organization repositories you have access to
- Migrate development environments
- Keep offline copies of important projects
- Archive open-source repositories for personal reference

---

## Disclaimer

This project is intended exclusively for legitimate repository backup and management.

Users are responsible for complying with GitHub's Terms of Service, repository licenses, and access permissions. Clone only repositories that are publicly available or that you own or are explicitly authorized to access.

This utility uses only the official GitHub REST API for repository discovery and the standard Git client for cloning. It does not bypass authentication, repository permissions, or access restrictions.

---

## License

Released under the MIT License.
