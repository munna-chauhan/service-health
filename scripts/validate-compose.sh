#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "Validating docker-compose.yml..."

OUTPUT=$(docker compose -f "$REPO_ROOT/docker-compose.yml" config --quiet 2>&1)
if [ $? -ne 0 ]; then
  echo "FAIL: docker compose config --quiet exited non-zero"
  echo "$OUTPUT"
  exit 1
fi

# Run config without --quiet to capture the full output for content check
FULL_OUTPUT=$(docker compose -f "$REPO_ROOT/docker-compose.yml" config 2>&1)
if ! echo "$FULL_OUTPUT" | grep -q "pg_isready"; then
  echo "FAIL: docker compose config output does not contain 'pg_isready'"
  exit 1
fi

echo "PASS: docker-compose.yml is valid and contains pg_isready healthcheck"
