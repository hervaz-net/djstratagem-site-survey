#!/bin/sh
# Deploy the static site to GitHub Pages.
# Requires `gh` authenticated with repo scope.
set -e
cd "$(dirname "$0")"
sh build.sh

OWNER=$(gh api user --jq .login)
REPO="djstratagem-site-survey"
FULL="$OWNER/$REPO"

git init -q 2>/dev/null || true
git add -A
git commit -q -m "Multi-page Sass rebuild" || true
git branch -M main

if ! gh repo view "$FULL" >/dev/null 2>&1; then
  gh repo create "$REPO" --public --source=. --remote=origin --push
else
  git add -A
  git commit -q -m "Rebuild multi-page Sass site" || true
  git branch -M main
  if git remote get-url origin >/dev/null 2>&1; then
    git push -q origin main
  else
    git remote add origin "https://github.com/$FULL.git"
    git push -q -u origin main
  fi
fi

# Turn on Pages from the root of main (idempotent).
printf '{"source":{"branch":"main","path":"/"}}' | \
  gh api -X POST "repos/$FULL/pages" --input - >/dev/null 2>&1 || true

echo "Pages URL: https://$OWNER.github.io/$REPO/"
