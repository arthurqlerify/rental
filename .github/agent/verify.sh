#!/usr/bin/env bash
set -uo pipefail

status=0
(cd client && npx tsc --noEmit -p tsconfig.app.json) || status=1
(cd client && npm run build) || status=1

exit "$status"
