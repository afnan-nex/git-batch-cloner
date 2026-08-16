'use strict';

const https = require('https');

/**
 * Fetch all repositories for a GitHub user/org (paginated).
 * Returns array of repo objects.
 */
async function fetchUserRepos(username, token) {
  const repos = [];
  let page = 1;

  while (true) {
    const pageRepos = await fetchPage(username, page, token);
    if (!pageRepos || pageRepos.length === 0) break;
    repos.push(...pageRepos);
    if (pageRepos.length < 100) break;
    page++;
  }

  return repos;
}

function fetchPage(username, page, token) {
  return new Promise((resolve, reject) => {
    const path = `/users/${encodeURIComponent(username)}/repos?per_page=100&page=${page}`;
    const options = {
      hostname: 'api.github.com',
      path,
      method: 'GET',
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'GitHub-Auto-Cloner/1.0'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => (body += chunk));
      res.on('end', () => {
        if (res.statusCode === 404) {
          reject(new Error(`User "${username}" not found (404)`));
          return;
        }
        if (res.statusCode === 401) {
          reject(new Error('Invalid GitHub token (401 Unauthorized)'));
          return;
        }
        if (res.statusCode === 403) {
          const retryAfter = res.headers['retry-after'];
          if (retryAfter) {
            reject(new Error(`GitHub API rate limit exceeded. Retry after ${retryAfter} seconds.`));
          } else {
            reject(new Error('GitHub API forbidden (403). Check token permissions.'));
          }
          return;
        }
        if (res.statusCode === 429) {
          const retryAfter = res.headers['retry-after'] || '60';
          reject(new Error(`GitHub API rate limit (429). Retry after ${retryAfter} seconds.`));
          return;
        }
        if (res.statusCode < 200 || res.statusCode >= 300) {
          reject(new Error(`GitHub API error: HTTP ${res.statusCode}`));
          return;
        }
        try {
          const data = JSON.parse(body);
          resolve(data);
        } catch {
          reject(new Error('Failed to parse GitHub API response'));
        }
      });
    });

    req.on('error', (err) => {
      if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED') {
        reject(new Error('No internet connection or GitHub is unreachable'));
      } else {
        reject(new Error(`Network error: ${err.message}`));
      }
    });

    req.setTimeout(15000, () => {
      req.destroy();
      reject(new Error('GitHub API request timed out (15s)'));
    });

    req.end();
  });
}

/**
 * Check if a single repository exists.
 */
async function fetchSingleRepo(username, repoName, token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: `/repos/${encodeURIComponent(username)}/${encodeURIComponent(repoName)}`,
      method: 'GET',
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'GitHub-Auto-Cloner/1.0'
      }
    };

    if (token) options.headers['Authorization'] = `Bearer ${token}`;

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => (body += chunk));
      res.on('end', () => {
        if (res.statusCode === 404) {
          reject(new Error(`Repository "${username}/${repoName}" not found (404)`));
          return;
        }
        if (res.statusCode < 200 || res.statusCode >= 300) {
          reject(new Error(`GitHub API error: HTTP ${res.statusCode}`));
          return;
        }
        try {
          resolve(JSON.parse(body));
        } catch {
          reject(new Error('Failed to parse GitHub API response'));
        }
      });
    });

    req.on('error', (err) => reject(new Error(`Network error: ${err.message}`)));
    req.setTimeout(15000, () => { req.destroy(); reject(new Error('Request timed out')); });
    req.end();
  });
}

/**
 * Verify a GitHub token by calling /user.
 */
async function verifyToken(token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: '/user',
      method: 'GET',
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'GitHub-Auto-Cloner/1.0',
        'Authorization': `Bearer ${token}`
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => (body += chunk));
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const user = JSON.parse(body);
            resolve({ valid: true, login: user.login });
          } catch {
            resolve({ valid: false, error: 'Could not parse response' });
          }
        } else if (res.statusCode === 401) {
          resolve({ valid: false, error: 'Invalid token (401 Unauthorized)' });
        } else {
          resolve({ valid: false, error: `HTTP ${res.statusCode}` });
        }
      });
    });

    req.on('error', (err) => reject(new Error(`Network error: ${err.message}`)));
    req.setTimeout(10000, () => { req.destroy(); reject(new Error('Request timed out')); });
    req.end();
  });
}

module.exports = { fetchUserRepos, fetchSingleRepo, verifyToken };
