# MotorCalculoEngCivil

Aplicação mobile-first para estudo de Cálculo 1 em Engenharia Civil.

## Entregas implementadas

1. **MVP matemático:** raízes, derivada, integral, limite, simplificação, fatoração, expansão e resolução de equações com SymPy.
2. **Gráfico interativo:** JSXGraph com pan, zoom/pinch e marcação segura de raízes reais finitas.
3. **Interface mobile:** layout responsivo pensado primeiro para celular e resultados matemáticos em KaTeX.
4. **Entrada matemática amigável:** aceita notação como `x²`, `√x`, `|x|`, `½x`, `sen(x)`, `π`, `∞`, `e^x`, colchetes/chaves e atribuições como `f(x)=...`.
5. **Limites:** bilateral, esquerda, direita e infinito; no limite bilateral o sistema compara os dois lados e informa quando o limite não existe.
6. **Derivadas:** ordens de 1 a 5, gráfico da derivada e reta tangente opcional em um ponto.
7. **Integrais:** indefinidas e definidas; integrais definidas mostram aproximação quando útil e sombreiam o intervalo no gráfico quando os limites são reais e finitos.
8. **PWA:** manifest + Service Worker; após o primeiro uso completo, os assets usados pelo motor ficam em cache para uso com conexão ruim/offline.
9. **Histórico local:** até 60 cálculos em IndexedDB, com reaproveitamento rápido das entradas e parâmetros.
10. **Cloudflare Worker:** Static Assets + endpoint `/api/health`, preparado para D1 e R2 exclusivos do projeto.
11. **Infra versionada:** `wrangler.jsonc`, migrations D1 e scripts de provisionamento/deploy.
12. **Provisionamento automático:** cria D1/R2 próprios, aplica migrations, testa, builda e publica em `workers.dev`.
13. **Central de Estudos:** sete contratos Apple Utils incorporados localmente, com dashboard, PDF, anotações, mapa, busca, armazenamento e PWA aparentes e funcionais na UI.

## Central de Estudos / Apple Utils

O núcleo usa snapshots ESM versionados em `vendor/artisys/`, sem buscar código no repositório privado durante `npm install`, build ou deploy. A proveniência e os SHAs estão em `vendor/artisys/ORIGIN.json`.

Módulos incorporados:

- `artisys-dashboard`: valida os sete cards da Central de Estudos;
- `artisys-pdf`: boundary de carregamento/normalização de PDF, consumido com PDF.js local;
- `artisys-annotations`: normaliza anotações ligadas ao material;
- `artisys-workflows`: valida o mapa Cálculo 1 → Funções/Limites/Continuidade/Derivadas/Integrais;
- `artisys-search`: indexa tópicos e anotações em memória;
- `artisys-storage`: persiste estado em IndexedDB e cai para memória quando necessário;
- `artisys-pwa-runtime`: define o plano de cache versionado usado pelo Service Worker existente.

O core permanece **R$ 0, self-hosted/open source e sem API paga obrigatória**. React, XYFlow e serviços externos não são dependências do fluxo principal.

## Stack

- Vite + TypeScript
- SymPy 1.14.0 executando em Pyodide 314.0.7
- mpmath 1.3.0
- JSXGraph 1.13.3
- KaTeX 0.18.7
- PDF.js (`pdfjs-dist`)
- IndexedDB
- Playwright + Vitest
- Cloudflare Workers + Static Assets + D1 + R2
- Wrangler 4

O motor matemático é **self-hosted no Worker/Static Assets**. O build copia o núcleo do Pyodide para `public/pyodide` e baixa wheels fixos de SymPy/mpmath para `public/python-packages`. O navegador publicado não depende de API matemática paga nem de CDN para executar cálculos.

## Desenvolvimento

Requisitos: Node.js 22+ e Python 3.14 para os testes do kernel.

```bash
npm install
npx playwright install chromium
npm run dev
```

O `postinstall` prepara os assets locais do runtime matemático.

## Verificação completa

```bash
npm test
python -m pip install "sympy==1.14.0" "mpmath==1.3.0"
python -m unittest discover -s tests -p "test_*.py"
npm run typecheck
npm run build
npm run test:e2e
```

Os E2E comprovam que os sete recursos estão aparentes e funcionais na UI, incluindo seleção de tópico, busca, anotação dinâmica, persistência após reload, PDF local, estado PWA e viewport mobile.

## Atualização dos snapshots Apple Utils

A atualização é deliberada: copie novamente apenas os sources reutilizáveis do módulo, atualize `vendor/artisys/ORIGIN.json` com versão/SHA/licença e rode a verificação completa. O produto não usa submodule nem `fetch` runtime contra `utilidades`.

## Primeiro deploy Cloudflare no Windows / PowerShell

Este é o fluxo recomendado para o ambiente Windows usado no Termius. Não use `chmod`, `&&` ou continuação com `\` no Windows PowerShell 5.1.

O terminal precisa estar autenticado no GitHub e na Cloudflare. O script **não reutiliza recursos desconhecidos** com o mesmo nome.

```powershell
git.exe clone https://github.com/nutricionistaalmeidavh-spec/MotorCalculoEngCivil.git
Set-Location .\MotorCalculoEngCivil
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\provision.ps1
```

O provisionamento cria, na conta Cloudflare autenticada:

- Worker: `motor-calculo-eng-civil`
- D1: `motor-calculo-eng-civil-db`
- R2: `motor-calculo-eng-civil-files`

Depois do primeiro provisionamento, se o Wrangler alterar `wrangler.jsonc` com IDs dos bindings, o script mostra o comando PowerShell para versionar essa alteração.

## Deploy desta branch antes do merge

```powershell
git.exe fetch origin
git.exe switch feat/apple-utils-study-hub
git.exe pull --ff-only origin feat/apple-utils-study-hub
npm install
npx playwright install chromium
npm test
npm run typecheck
npm run build
npm run test:e2e
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\deploy.ps1
```

## Atualizações posteriores no Windows / PowerShell

```powershell
git.exe pull --ff-only
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\deploy.ps1
```

## Linux / Git Bash

```bash
./scripts/provision.sh
./scripts/deploy.sh
```

A URL final é exibida pelo `wrangler deploy` e usa o domínio padrão `*.workers.dev`. O endpoint `/api/health` confirma que D1 e R2 estão vinculados.
