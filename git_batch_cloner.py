import subprocess

print("=== GitHub Repo Cloner ===")
print("Enter repository URLs one by one.")
print("Press Ctrl+C to exit.\n")

try:
    while True:
        repo_url = input("Enter repo URL: ").strip()
        if not repo_url:
            print("⚠️ No URL entered. Try again.")
            continue

        subprocess.run(["git", "clone", repo_url])
        print("✅ Cloned:", repo_url)
        print("-" * 50)

except KeyboardInterrupt:
    print("\n👋 Exiting... Goodbye!")
