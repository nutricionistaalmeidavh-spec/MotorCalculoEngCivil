# Status das branches de integração

Branch canônica de compatibilização:

- `integration/calculo1-unificado-2026-09-25`

As branches abaixo estão **OBSOLETAS / SUPERADAS** e não devem receber novas alterações:

- `feat/calculo1-corpus-revisao`
- `feat/p2-p3-learning-ux`
- `feat/apple-utils-study-hub`

Todo o histórico dessas três branches foi incorporado à branch canônica. Os commits de origem permanecem preservados como ancestrais da integração.

## Integração

- `feat/calculo1-corpus-revisao`: incorporada pelo PR #4.
- `feat/p2-p3-learning-ux`: incorporada pelo PR #5.
- `feat/apple-utils-study-hub`: compatibilizada manualmente no merge `fa5ca36`, preservando o shell/revisão mais novos e adicionando Central de Estudos, vendor local, PDF.js, Playwright, PWA e bindings Cloudflare.

Novos trabalhos que dependam dessas linhas devem partir de `integration/calculo1-unificado-2026-09-25` (ou da `main` depois que essa integração for aprovada e mergeada).
