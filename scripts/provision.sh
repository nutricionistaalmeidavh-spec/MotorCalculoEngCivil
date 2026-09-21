#!/usr/bin/env bash
set -euo pipefail

WORKER_NAME="motor-calculo-eng-civil"
D1_NAME="motor-calculo-eng-civil-db"
R2_NAME="motor-calculo-eng-civil-files"
CONFIG="wrangler.jsonc"

cd "$(dirname "$0")/.."

for command in node npm npx git; do
  if ! command -v "$command" >/dev/null 2>&1; then
    echo "Erro: '$command' não está instalado." >&2
    exit 1
  fi
done

if [[ ! -f "$CONFIG" ]]; then
  echo "Erro: $CONFIG não encontrado." >&2
  exit 1
fi

if [[ -n "$(git status --porcelain --untracked-files=no)" ]]; then
  echo "Erro: existem alterações Git não commitadas. Faça commit/stash antes do provisionamento." >&2
  exit 1
fi

echo "==> Instalando dependências locais"
npm install --no-audit --no-fund --package-lock=false

echo "==> Confirmando autenticação Cloudflare"
npx wrangler whoami >/dev/null

has_d1_binding() {
  grep -q "\"database_name\"[[:space:]]*:[[:space:]]*\"${D1_NAME}\"" "$CONFIG"
}

has_r2_binding() {
  grep -q "\"bucket_name\"[[:space:]]*:[[:space:]]*\"${R2_NAME}\"" "$CONFIG"
}

echo "==> Verificando D1 exclusivo: $D1_NAME"
if npx wrangler d1 info "$D1_NAME" --json >/dev/null 2>&1; then
  if has_d1_binding; then
    echo "    D1 já pertence a este projeto; reutilizando-o nesta atualização."
  else
    echo "Erro: já existe um D1 chamado '$D1_NAME', mas ele não está vinculado a este projeto." >&2
    echo "O script não reutiliza recursos desconhecidos. Renomeie/remova o recurso conflitante ou ajuste o projeto conscientemente." >&2
    exit 1
  fi
else
  npx wrangler d1 create "$D1_NAME" --binding DB --update-config
fi

echo "==> Verificando R2 exclusivo: $R2_NAME"
if npx wrangler r2 bucket info "$R2_NAME" --json >/dev/null 2>&1; then
  if has_r2_binding; then
    echo "    R2 já pertence a este projeto; reutilizando-o nesta atualização."
  else
    echo "Erro: já existe um R2 chamado '$R2_NAME', mas ele não está vinculado a este projeto." >&2
    echo "O script não reutiliza buckets desconhecidos." >&2
    exit 1
  fi
else
  npx wrangler r2 bucket create "$R2_NAME" --binding FILES --update-config
fi

echo "==> Aplicando migrations no D1 remoto"
npx wrangler d1 migrations apply DB --remote

echo "==> Validando projeto"
npm test
npm run typecheck
npm run build

echo "==> Publicando Worker + Static Assets"
npx wrangler deploy

echo
if ! git diff --quiet -- "$CONFIG"; then
  echo "O Wrangler adicionou IDs/bindings ao $CONFIG."
  echo "Para persistir esses bindings no GitHub, execute:"
  echo "  git add $CONFIG && git commit -m 'chore: bind Cloudflare resources' && git push"
fi

echo
printf 'Deploy concluído. Worker: %s.<seu-subdominio>.workers.dev\n' "$WORKER_NAME"
echo "Verificação: abra /api/health na URL publicada pelo Wrangler."
