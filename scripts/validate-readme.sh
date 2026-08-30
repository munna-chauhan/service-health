#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
README="$REPO_ROOT/README.md"

echo "Validating README.md..."

if [ ! -f "$README" ]; then
  echo "FAIL: README.md does not exist"
  exit 1
fi

if ! grep -q "docker compose up" "$README"; then
  echo "FAIL: README.md does not contain 'docker compose up'"
  exit 1
fi

if ! grep -q "HEALTH_STALE_THRESHOLD_SECONDS" "$README"; then
  echo "FAIL: README.md does not contain 'HEALTH_STALE_THRESHOLD_SECONDS'"
  exit 1
fi

echo "PASS: README.md exists and contains required content"
