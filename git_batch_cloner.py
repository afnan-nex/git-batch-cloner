"""
GitHub Repository Cloner

A production-quality Python tool to clone all repositories from a GitHub user.
Supports pagination, rate limit handling, resume capability, and private repositories.
"""

import os
import re
import sys
import time
import subprocess
from typing import List, Dict, Any, Optional

try:
    import requests
except ImportError:
    print("Error: The 'requests' library is not installed.")
    print("Please install it using: pip install requests")
    sys.exit(1)


def parse_username(user_input: str) -> str:
    """Extracts the GitHub username from a URL or raw username string."""
    # Clean up input by removing query parameters or fragments
    user_input = user_input.strip().split('?')[0].split('#')[0]
    
    # Match GitHub URL format
    match = re.match(r'^(?:https?://)?(?:www\.)?github\.com/([a-zA-Z0-9\-_]+)/?$', user_input)
    if match:
        return match.group(1)
        
    # If it doesn't match URL format, assume it's a raw username
    if re.match(r'^[a-zA-Z0-9\-_]+$', user_input):
        return user_input
        
    raise ValueError(f"Invalid GitHub username or URL: {user_input}")


def get_github_token() -> Optional[str]:
    """Retrieves the GitHub token from environment variables."""
    return os.environ.get('GITHUB_TOKEN')


def fetch_repositories(username: str, token: Optional[str]) -> List[Dict[str, Any]]:
    """Fetches all repositories for a given GitHub user, handling pagination and rate limits."""
    headers = {'Accept': 'application/vnd.github.v3+json'}
    if token:
        headers['Authorization'] = f'token {token}'
        
    repos = []
    page = 1
    per_page = 100
    
    while True:
        url = f'https://api.github.com/users/{username}/repos'
        params = {'page': page, 'per_page': per_page}
        
        while True:
            response = requests.get(url, headers=headers, params=params)
            
            # Handle Rate Limiting (Standard & Abuse limits)
            if response.status_code == 403:
                remaining = response.headers.get('X-RateLimit-Remaining')
                if remaining is not None and int(remaining) == 0:
                    reset_time = int(response.headers.get('X-RateLimit-Reset', time.time() + 60))
                    wait_time = max(0, reset_time - time.time()) + 1
                    print(f"\nGitHub API rate limit exceeded. Waiting for {wait_time:.0f} seconds until reset...")
                    time.sleep(wait_time)
                    continue  # Retry the same request
                elif 'Retry-After' in response.headers:
                    wait_time = int(response.headers['Retry-After'])
                    print(f"\nGitHub API abuse limit triggered. Waiting for {wait_time} seconds...")
                    time.sleep(wait_time)
                    continue
                else:
                    print(f"Error: 403 Forbidden. Message: {response.text}")
                    sys.exit(1)
            
            if response.status_code == 404:
                print(f"Error: User '{username}' not found on GitHub.")
                sys.exit(1)
                
            if response.status_code != 200:
                print(f"Error: Failed to fetch repositories. Status: {response.status_code}")
                print(f"Message: {response.text}")
                sys.exit(1)
                
            break  # Request successful, exit retry loop
            
        data = response.json()
        if not data:
            break
            
        repos.extend(data)
        page += 1
        
    return repos


def clone_repository(repo: Dict[str, Any], target_dir: str, token: Optional[str]) -> str:
    """Clones a single repository. Returns 'success', 'skipped', or 'failed'."""
    repo_name = repo['name']
    clone_url = repo['clone_url']
    
    # Inject token for private repositories if available
    if token and repo.get('private', False):
        clone_url = clone_url.replace('https://', f'https://{token}@')
        
    repo_path = os.path.join(target_dir, repo_name)
    
    # Skip if already exists (Resume support)
    if os.path.exists(repo_path):
        return 'skipped'
        
    env = os.environ.copy()
    # Prevent git from hanging on credential prompts if token is invalid/missing
    env['GIT_TERMINAL_PROMPT'] = '0' 
    
    try:
        result = subprocess.run(
            ['git', 'clone', clone_url, repo_path],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            env=env,
            check=False
        )
        
        if result.returncode == 0:
            return 'success'
        else:
            # Extract the most relevant error message from git output
            error_msg = result.stderr.strip().split('\n')[-1] if result.stderr else "Unknown error"
            print(f"  Error: {error_msg}")
            return 'failed'
            
    except Exception as e:
        print(f"  Error: {str(e)}")
        return 'failed'


def check_git_installed():
    """Checks if git is installed and accessible."""
    try:
        subprocess.run(['git', '--version'], stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("Error: Git is not installed or not found in PATH.")
        print("Please install Git and try again.")
        sys.exit(1)


def main():
    check_git_installed()
    
    # Get user input from CLI arguments or interactive prompt
    if len(sys.argv) > 1:
        user_input = sys.argv[1]
    else:
        user_input = input("Enter GitHub username or profile URL: ").strip()
        
    if not user_input:
        print("Error: No input provided.")
        sys.exit(1)
        
    try:
        username = parse_username(user_input)
    except ValueError as e:
        print(f"Error: {e}")
        sys.exit(1)
        
    token = get_github_token()
    if token:
        print("GitHub token detected. Private repositories will be included if accessible.")
    else:
        print("No GitHub token found. Only public repositories will be cloned.")
        
    print(f"Fetching repositories for user: {username}...")
    repos = fetch_repositories(username, token)
    
    if not repos:
        print("No repositories found for this user.")
        return
        
    total_repos = len(repos)
    print(f"Found {total_repos} repositories.\n")
    
    # Create target directory in the user's standard Downloads folder
    target_dir = os.path.join(os.path.expanduser('~'), 'Downloads', username)
    os.makedirs(target_dir, exist_ok=True)
    
    completed = 0
    failed = 0
    skipped = 0
    
    for i, repo in enumerate(repos, 1):
        repo_name = repo['name']
        print(f"[{i}/{total_repos}] Cloning {repo_name}...")
        
        result = clone_repository(repo, target_dir, token)
        
        if result == 'success':
            print("✓ Success\n")
            completed += 1
        elif result == 'skipped':
            print("↷ Skipped (already exists)\n")
            skipped += 1
        else:
            print("✗ Failed\n")
            failed += 1
            
    print("-" * 30)
    print("Summary:")
    print(f"Total repositories: {total_repos}")
    print(f"Completed: {completed}")
    print(f"Skipped: {skipped}")
    print(f"Failed: {failed}")
    print("-" * 30)


if __name__ == "__main__":
    main()