#!/usr/bin/env bash
set -euo pipefail

for dir in server client; do
  if [ -f "$dir/package-lock.json" ]; then
    npm ci --prefix "$dir"
  else
    npm install --prefix "$dir"
  fi
done
