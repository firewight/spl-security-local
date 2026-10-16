#!/usr/bin/env bash
# Run checks, refuse to push with uncommitted build outputs, push, then wait for the Pages deploy to succeed.
set -euo pipefail
cd "$(dirname "$0")/.."
node scripts/verify-seo.cjs >/dev/null && node scripts/audit-consistency.cjs --check >/dev/null && node scripts/verify-contact-sections.cjs | tail -1
if [ -n "$(git status --porcelain)" ]; then echo "Uncommitted changes (commit them first):"; git status --short | head; exit 1; fi
git push origin main
sha=$(git rev-parse HEAD); sleep 8
id=$(gh run list --commit "$sha" -L1 --json databaseId -q '.[0].databaseId')
gh run watch "$id" --exit-status && echo "Pages deploy OK for $sha"
