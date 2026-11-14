#!/bin/bash
# One-command deploy: commit any changes and push to GitHub Pages.
# Usage: ./deploy.sh "your commit message"
set -e
cd "$(dirname "$0")"

msg="${1:-Update site}"

git add .
if git diff --cached --quiet; then
  echo "No changes to commit."
else
  git commit -m "$msg"
fi

git push
echo "Pushed ✓ — live shortly at https://tjxshihouin-crypto.github.io/"
