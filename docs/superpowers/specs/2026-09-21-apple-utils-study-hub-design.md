# Apple Utils Study Hub — Design

## Goal

Integrar sete módulos reutilizáveis do repositório privado `nutricionistaalmeidavh-spec/utilidades` ao `MotorCalculoEngCivil`, expondo funcionalidades reais e visíveis na interface de estudo de Cálculo 1, sem introduzir dependência paga, serviço externo obrigatório ou migração do frontend atual para React.

## Scope

Módulos incluídos:

1. `@artisys/dashboard`
2. `@artisys/pdf`
3. `@artisys/annotations`
4. `@artisys/workflows`
5. `@artisys/search`
6. `@artisys/storage`
7. `@artisys/pwa-runtime`

Fora do escopo desta entrega: OCR, IA local, colaboração em tempo real, autenticação, sincronização em nuvem, editor React/XYFlow completo e serviços pagos.

## Constraints

- Núcleo obrigatório: R$ 0, self-hosted/open source, sem serviço pago como dependência silenciosa.
- Preservar Vite + TypeScript vanilla já existente.
- Preservar SymPy/Pyodide, JSXGraph, KaTeX, histórico local e deploy Cloudflare atual.
- O clone/build/deploy do Motor não pode depender de autenticação no repositório privado `utilidades`.
- Todo módulo integrado deve ficar aparente na UI e ter comportamento observável validado por E2E.
- A implementação deve funcionar no navegador; adaptadores React ou peers opcionais não são obrigatórios.

## Integration Strategy

Usar snapshots versionados dos módulos necessários dentro do próprio `MotorCalculoEngCivil`, contendo apenas os arquivos redistribuíveis necessários (`src`, `LICENSE`, metadados de origem/versão e, quando necessário, assets locais). Cada snapshot deve registrar:

- módulo de origem;
- versão;
- commit/SHA do `utilidades` usado na importação;
- licença;
- arquivos copiados.

Isso evita submodule privado e mantém o deploy reprodutível. Atualizações futuras dos módulos devem ser explícitas, por nova sincronização de snapshot.

## UI Architecture

Adicionar uma área `Central de Estudos` abaixo do workspace matemático atual. Ela deve ser composta por seções visíveis e navegáveis, sem substituir o fluxo existente de cálculo.

### 1. Dashboard

`@artisys/dashboard` fornece o contrato de layout da Central de Estudos. A UI consumidora continua em DOM/TypeScript vanilla.

Comportamento visível:
- cards para Mapa de Estudos, Materiais, Busca, Anotações, Progresso e Status Offline;
- layout validado pelo contrato do módulo;
- cards renderizados com identificadores estáveis para E2E.

### 2. PDF

`@artisys/pdf` fornece validação/normalização e carregamento de documentos; o consumidor instala apenas o upstream necessário para visualização local.

Comportamento visível:
- painel `Material PDF`;
- capacidade de abrir um PDF local/fixture da aplicação;
- confirmação visual de documento carregado e número de páginas;
- nenhuma dependência de CDN.

### 3. Annotations

`@artisys/annotations` fornece o contrato de marcações.

Comportamento visível:
- criar anotação textual ligada ao material ativo;
- listar anotação criada;
- remover anotação;
- persistir via storage local.

### 4. Workflows

`@artisys/workflows` representa o mapa curricular como `{ nodes, edges }`, sem obrigar XYFlow/React.

Mapa inicial:
- Cálculo 1
  - Funções
  - Limites
  - Continuidade
  - Derivadas
  - Integrais

Comportamento visível:
- nós e conexões renderizados em UI simples do consumidor;
- seleção de nó atualiza painel de conteúdo;
- validação do grafo pelo módulo antes da renderização.

### 5. Search

`@artisys/search` indexa localmente tópicos, fórmulas, materiais e anotações.

Comportamento visível:
- campo de busca na Central de Estudos;
- busca por `limite` retorna conteúdo relacionado;
- anotações criadas passam a ser pesquisáveis sem reload.

### 6. Storage

`@artisys/storage` usa seu export browser para persistir estado da Central de Estudos.

Persistir pelo menos:
- tópico selecionado;
- anotações;
- progresso simples por tópico;
- preferências de cards quando aplicável.

Comportamento visível:
- reload mantém estado previamente salvo;
- falha de storage não impede uso básico da calculadora.

### 7. PWA Runtime

`@artisys/pwa-runtime` complementa o PWA já existente com contrato explícito de cache/update/offline.

Comportamento visível:
- card `Offline/PWA` indicando estado do Service Worker;
- estado distinguível entre registrando, ativo e indisponível;
- assets da Central de Estudos entram na estratégia de cache local.

## Data Flow

1. `main.ts` inicializa o motor matemático existente.
2. Em paralelo, `studyHub/bootstrap.ts` inicializa storage, search, workflow e status PWA.
3. Estado da Central de Estudos é mantido em um store local pequeno e serializável.
4. Eventos da UI chamam adapters locais específicos de cada módulo.
5. Mudanças persistíveis passam por `@artisys/storage`.
6. Mudanças pesquisáveis atualizam `@artisys/search`.
7. Renderização permanece responsabilidade do Motor, não dos módulos.

## File Layout

Estrutura alvo:

```text
src/
  studyHub/
    bootstrap.ts
    state.ts
    view.ts
    fixtures.ts
    adapters/
      dashboard.ts
      pdf.ts
      annotations.ts
      workflows.ts
      search.ts
      storage.ts
      pwa.ts
vendor/
  artisys/
    dashboard/
    pdf/
    annotations/
    workflows/
    search/
    storage/
    pwa-runtime/
    ORIGIN.json
tests/
  e2e/
    study-hub.spec.ts
playwright.config.ts
```

Os nomes podem ser ajustados para seguir padrões já existentes, mas as responsabilidades devem permanecer separadas.

## E2E Acceptance Criteria

Playwright deve iniciar o build/dev server local e comprovar comportamento real.

### Test 1 — módulos aparentes

Ao abrir a aplicação, a Central de Estudos deve exibir sete recursos identificáveis:
- Painel/Dashboard;
- Material PDF;
- Anotações;
- Mapa de Estudos;
- Busca Local;
- Armazenamento/Progresso;
- Offline/PWA.

O teste não pode ser apenas uma enumeração de `data-testid`; deve verificar conteúdo e pelo menos um estado funcional de cada área.

### Test 2 — workflow

- abrir Mapa de Estudos;
- confirmar nós principais;
- selecionar `Limites`;
- confirmar atualização do conteúdo associado.

### Test 3 — search

- pesquisar `limite`;
- confirmar resultado relacionado;
- criar anotação contendo termo único;
- pesquisar termo único;
- confirmar que a anotação aparece.

### Test 4 — annotations + storage

- criar anotação;
- alterar progresso/tópico ativo;
- recarregar página;
- confirmar persistência;
- remover anotação e confirmar remoção.

### Test 5 — PDF

- abrir fixture PDF local;
- confirmar estado `carregado`;
- confirmar metadado de páginas maior que zero.

### Test 6 — PWA

Em contexto compatível com service worker:
- confirmar registro/ativação;
- confirmar status visível na UI.

Quando o ambiente de teste não oferecer suporte real ao SW, a aplicação deve exibir estado `indisponível` de forma explícita e o teste deve cobrir separadamente a configuração/registro do runtime por unidade; não se deve falsificar estado `ativo`.

## Unit/Integration Testing

Além do E2E:
- contratos/adapters dos sete módulos devem ter testes unitários rápidos;
- fixtures inválidas de dashboard/workflow devem falhar de forma determinística;
- storage deve cobrir fallback quando IndexedDB/local storage não estiver disponível;
- search deve cobrir indexação dinâmica de anotação;
- PDF deve cobrir erro de arquivo ausente/corrompido;
- PWA deve cobrir transições de estado sem depender de rede externa.

## Build and Verification Gate

A entrega só é considerada completa com sucesso em:

```bash
npm test
npm run typecheck
npm run build
npm run test:e2e
```

Se houver testes Python existentes do kernel, eles devem continuar passando sem alteração regressiva.

## Deployment Compatibility

- `npm install` e `npm run build` devem funcionar apenas com o conteúdo do Motor + registry público npm.
- Nenhum passo de deploy pode clonar `utilidades`.
- Cloudflare Workers/Static Assets existentes permanecem o destino.
- Nenhuma nova API externa paga é introduzida.

## Definition of Done

A rodada termina quando:

1. os sete módulos estão incorporados por snapshot versionado;
2. os sete estão visíveis na UI;
3. cada um possui comportamento real acionável;
4. E2E comprova presença + funcionamento;
5. build/typecheck/testes existentes continuam verdes;
6. documentação registra origem, versões, comandos de teste e como atualizar os snapshots;
7. nenhuma dependência paga/externa obrigatória foi adicionada.
