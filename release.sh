#!/usr/bin/env bash
#
# release.sh — cut a calendar-versioned release of kids-games.
#
#   ./release.sh                 # auto version: YYYY.MM.DD (.N if repeated today)
#   ./release.sh 2026.07.01      # explicit version
#   ./release.sh --no-push       # stop after tagging
#
# Sets the version in every workspace package.json, commits the change, and
# creates an annotated git tag named after the version. Pushing that tag
# triggers the "Deploy to GitHub Pages" workflow (which fires on any tag),
# building apps/web and publishing it.
set -euo pipefail

cd "$(dirname "$0")"

PUSH=1
VERSION=""
for arg in "$@"; do
  case "$arg" in
    --no-push) PUSH=0 ;;
    -*) echo "Unknown option: $arg" >&2; exit 1 ;;
    *) VERSION="$arg" ;;
  esac
done

if [[ -n "$(git status --porcelain)" ]]; then
  echo "Error: working tree is not clean. Commit or stash changes first." >&2
  exit 1
fi

# Calendar versioning: default to today's date, appending .1, .2, … when more
# than one release is cut on the same day.
if [[ -z "$VERSION" ]]; then
  BASE="$(date +%Y.%m.%d)"
  VERSION="$BASE"
  n=1
  while git rev-parse -q --verify "refs/tags/$VERSION" >/dev/null; do
    VERSION="$BASE.$n"
    n=$((n + 1))
  done
else
  # An explicit version must be a clean tag token.
  if [[ ! "$VERSION" =~ ^[0-9A-Za-z.+_-]+$ ]]; then
    echo "Error: '$VERSION' is not a valid version/tag name." >&2
    exit 1
  fi
fi

TAG="$VERSION"

if git rev-parse -q --verify "refs/tags/$TAG" >/dev/null; then
  echo "Error: tag $TAG already exists." >&2
  exit 1
fi

# Update "version" in the root package.json and every workspace package.json.
# (Paths from git ls-files contain no spaces, so word-splitting is safe; this
# avoids `mapfile`, which is absent on macOS's bash 3.2.)
echo "Releasing $VERSION — setting version in all package.json files…"
PKGS="$(git ls-files '*package.json' ':!:**/node_modules/**')"
for pkg in $PKGS; do
  node -e '
    const fs = require("fs");
    const f = process.argv[1];
    const json = JSON.parse(fs.readFileSync(f, "utf8"));
    json.version = process.argv[2];
    fs.writeFileSync(f, JSON.stringify(json, null, 2) + "\n");
  ' "$pkg" "$VERSION"
  echo "  ✓ $pkg"
done

git add $PKGS
git commit -m "Release $TAG"
git tag -a "$TAG" -m "Release $TAG"
echo "Committed and tagged $TAG."

if [[ "$PUSH" -eq 1 ]]; then
  echo "Pushing commit and tag…"
  git push --follow-tags
  echo "Done. GitHub Pages deploy will run for $TAG."
else
  echo "Skipped push (--no-push). Run: git push --follow-tags"
fi
