#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

if ! grep -q '"binding"[[:space:]]*:[[:space:]]*"DB"' wrangler.jsonc || \
   ! grep -q '"binding"[[:space:]]*:[[:space:]]*"FILES"' wrangler.jsonc; then
  echo "Erro: D1/R2 ainda não estão vinculados. Execute ./scripts/provision.sh primeiro." >&2
  exit 1
fi

npm install --no-audit --no-fund --package-lock=false
npx wrangler whoami >/dev/null
npx wrangler d1 migrations apply DB --remote
npm test
npm run typecheck
npm run build
npx wrangler deploy
