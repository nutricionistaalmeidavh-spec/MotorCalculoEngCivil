# Apple Utils Study Hub Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrar sete módulos Apple Utils ao MotorCalculoEngCivil, torná-los visíveis e funcionalmente acionáveis na UI e comprovar presença + comportamento com Playwright E2E.

**Architecture:** O frontend Vite + TypeScript vanilla permanece intacto. Os sete módulos serão incorporados como snapshots ESM versionados em `vendor/artisys`, com declarações `.d.mts` mínimas para o TypeScript e wrappers tipados em `src/studyHub/adapters`. A Central de Estudos será montada abaixo do workspace matemático atual e usará IndexedDB local, busca em memória, workflow validado, PDF.js local e o Service Worker existente.

**Tech Stack:** Vite 8, TypeScript 7 strict, Vitest 5, Playwright, PDF.js (`pdfjs-dist`), DOM/TypeScript vanilla, IndexedDB, Service Worker, módulos ESM `@artisys/*` incorporados por snapshot.

**Spec:** `docs/superpowers/specs/2026-09-21-apple-utils-study-hub-design.md`

## Global Constraints

- Núcleo obrigatório: R$ 0, self-hosted/open source, sem serviço pago como dependência silenciosa.
- Preservar Vite + TypeScript vanilla já existente.
- Preservar SymPy/Pyodide, JSXGraph, KaTeX, histórico local e deploy Cloudflare atual.
- O clone/build/deploy do Motor não pode depender de autenticação no repositório privado `utilidades`.
- Todo módulo integrado deve ficar aparente na UI e ter comportamento observável validado por E2E.
- A implementação deve funcionar no navegador; adaptadores React ou peers opcionais não são obrigatórios.
- TDD: cada comportamento novo começa por teste falhando, seguido pela implementação mínima que o faz passar.

## Review Focus

1. **IndexedDB indisponível/bloqueado:** a Central de Estudos deve cair para memória sem quebrar a calculadora nem a UI principal.
2. **Workflow inválido/cíclico:** dados inválidos não devem ser renderizados como mapa válido; o erro deve ser determinístico e testável.
3. **PDF ausente/corrompido:** o painel deve exibir erro visível e continuar utilizável.
4. **Service Worker indisponível:** a UI deve exibir `Indisponível`, nunca fingir `Ativo`.
5. **Anotação criada durante a sessão:** deve entrar imediatamente no índice de busca e persistir após reload quando IndexedDB estiver disponível.

---

## File Structure

### Criar

- `vendor/artisys/ORIGIN.json` — proveniência, versões, SHAs e licenças dos sete snapshots.
- `vendor/artisys/dashboard/index.mjs` + `index.d.mts`
- `vendor/artisys/pdf/index.mjs` + `index.d.mts`
- `vendor/artisys/annotations/index.mjs` + `index.d.mts`
- `vendor/artisys/workflows/index.mjs` + `index.d.mts`
- `vendor/artisys/search/index.mjs` + `index.d.mts`
- `vendor/artisys/storage/browser.mjs` + `browser.d.mts`
- `vendor/artisys/pwa-runtime/index.mjs` + `index.d.mts`
- `src/studyHub/types.ts` — tipos do estado da Central de Estudos.
- `src/studyHub/fixtures.ts` — layout, workflow e documentos iniciais.
- `src/studyHub/state.ts` — store serializável e reducer mínimo.
- `src/studyHub/view.ts` — markup/renderização/event binding da Central de Estudos.
- `src/studyHub/bootstrap.ts` — orquestra inicialização de adapters + view.
- `src/studyHub/adapters/dashboard.ts`
- `src/studyHub/adapters/pdf.ts`
- `src/studyHub/adapters/annotations.ts`
- `src/studyHub/adapters/workflows.ts`
- `src/studyHub/adapters/search.ts`
- `src/studyHub/adapters/storage.ts`
- `src/studyHub/adapters/pwa.ts`
- `src/studyHub/studyHub.test.ts`
- `src/studyHub/adapters.test.ts`
- `src/studyHub/studyHub.css`
- `public/study/calculo1-demo.pdf`
- `tests/e2e/study-hub.spec.ts`
- `playwright.config.ts`

### Modificar

- `src/bootstrap.ts` — montar Central de Estudos e compartilhar status do PWA.
- `src/pwa/register.ts` — retornar status real de registro sem esconder falha.
- `public/sw.js` — usar plano/versionamento compatível com `artisys-pwa-runtime` e incluir fixture PDF no cache.
- `package.json` — adicionar `pdfjs-dist`, `@playwright/test`, `test:e2e` e comando auxiliar de preview.
- `README.md` — documentar Central de Estudos, snapshots, testes e deploy.

---

### Task 1: Incorporar os sete snapshots Apple Utils com proveniência

**Files:**
- Create: `vendor/artisys/ORIGIN.json`
- Create: `vendor/artisys/dashboard/index.mjs`
- Create: `vendor/artisys/dashboard/index.d.mts`
- Create: `vendor/artisys/pdf/index.mjs`
- Create: `vendor/artisys/pdf/index.d.mts`
- Create: `vendor/artisys/annotations/index.mjs`
- Create: `vendor/artisys/annotations/index.d.mts`
- Create: `vendor/artisys/workflows/index.mjs`
- Create: `vendor/artisys/workflows/index.d.mts`
- Create: `vendor/artisys/search/index.mjs`
- Create: `vendor/artisys/search/index.d.mts`
- Create: `vendor/artisys/storage/browser.mjs`
- Create: `vendor/artisys/storage/browser.d.mts`
- Create: `vendor/artisys/pwa-runtime/index.mjs`
- Create: `vendor/artisys/pwa-runtime/index.d.mts`
- Test: `src/studyHub/adapters.test.ts`

**Interfaces:**
- Consumes: os exports ESM existentes no repo `utilidades`.
- Produces: imports locais estáveis sob `vendor/artisys/*` sem acesso ao repo privado em build/deploy.

- [ ] **Step 1: Write the failing vendor contract test**

```ts
import { describe, expect, it } from "vitest";
import { validateDashboardLayout } from "../../vendor/artisys/dashboard/index.mjs";
import { normalizeHighlight } from "../../vendor/artisys/pdf/index.mjs";
import { normalizeAnnotation } from "../../vendor/artisys/annotations/index.mjs";
import { validateWorkflow } from "../../vendor/artisys/workflows/index.mjs";
import { buildSearchIndex, searchIndex } from "../../vendor/artisys/search/index.mjs";
import { MemoryStorage } from "../../vendor/artisys/storage/browser.mjs";
import { createCachePlan } from "../../vendor/artisys/pwa-runtime/index.mjs";

describe("Apple Utils vendored contracts", () => {
  it("loads and executes all seven module contracts", async () => {
    expect(validateDashboardLayout([{ id: "a", x: 0, y: 0, w: 1, h: 1 }])).toHaveLength(1);
    expect(normalizeHighlight({ id: "h", pageNumber: 1, rect: { x1: 0, y1: 0, x2: 1, y2: 1 } }).id).toBe("h");
    expect(normalizeAnnotation({ id: "n", targetType: "pdf", targetId: "demo", page: 1, geometry: { type: "rect", x: 0, y: 0, width: 1, height: 1 }, text: "ok" }).id).toBe("n");
    expect(validateWorkflow({ nodes: [{ id: "root", type: "topic" }], edges: [] }).nodes).toHaveLength(1);
    const index = buildSearchIndex([{ id: "limites", title: "Limites" }]);
    expect(searchIndex(index, "limite")[0]?.id).toBe("limites");
    const storage = new MemoryStorage();
    await storage.put("state", { ok: true });
    expect((await storage.get("state"))?.value).toEqual({ ok: true });
    expect(createCachePlan({ prefix: "motor-calculo", version: "2" }).cacheName).toBe("motor-calculo-2");
  });
});
```

- [ ] **Step 2: Run the test and verify RED**

Run: `npm test -- src/studyHub/adapters.test.ts`

Expected: FAIL because the vendored module paths do not exist.

- [ ] **Step 3: Copy the exact reusable ESM sources and add type declarations**

Copy these source SHAs from `utilidades/main`:

```text
dashboard index.mjs     e9591c9a5511d00716bde5feb3fc301e81948c6a
pdf index.mjs           046eeaf79a1e8e419e5ec6b40168fe32b8114f37
annotations index.mjs   ea1369eae21611b68075ff44f5b45b59c7f6055a
workflows index.mjs     0535bbd6d3b56f0e56cb23c32bad3afa824a7fa0
search index.mjs        48292fa0f1dd25343e9e0d71e96bb376cd676d24
storage browser.mjs     46064050f4ea3cd30c1148a1962bdca11077021f
pwa-runtime index.mjs   17312eae198f337b0218f1fc18517855dda08705
```

Each `.d.mts` must expose only the functions/classes consumed by the Motor, with typed arguments rather than `any` where practical. Example for dashboard:

```ts
export interface DashboardItem {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
}
export function validateDashboardLayout<T extends DashboardItem>(layout: T[]): T[];
```

`ORIGIN.json` must record `sourceRepository`, `sourceBranch`, `sourcePath`, `version`, `blobSha` and `license: "MIT"` for every module.

- [ ] **Step 4: Run contract test and typecheck**

Run:

```bash
npm test -- src/studyHub/adapters.test.ts
npm run typecheck
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add vendor/artisys src/studyHub/adapters.test.ts
git commit -m "feat: vendor Apple Utils study contracts"
```

---

### Task 2: Criar estado persistente com fallback seguro

**Files:**
- Create: `src/studyHub/types.ts`
- Create: `src/studyHub/state.ts`
- Create: `src/studyHub/adapters/storage.ts`
- Test: `src/studyHub/studyHub.test.ts`

**Interfaces:**
- Produces: `StudyHubState`, `createInitialStudyHubState()`, `createStudyStorage()`, `loadStudyState()`, `saveStudyState()`.

- [ ] **Step 1: Write failing storage/state tests**

```ts
import { describe, expect, it } from "vitest";
import { createInitialStudyHubState } from "./state";
import { createStudyStorage, loadStudyState, saveStudyState } from "./adapters/storage";

describe("study storage", () => {
  it("persists selected topic, annotation and progress", async () => {
    const storage = createStudyStorage({ indexedDB: undefined });
    const state = createInitialStudyHubState();
    state.selectedTopicId = "limites";
    state.progress.limites = true;
    state.annotations.push({ id: "note-1", targetId: "calculo1-demo", page: 1, text: "rever limite lateral" });
    await saveStudyState(storage, state);
    expect(await loadStudyState(storage)).toMatchObject({
      selectedTopicId: "limites",
      progress: { limites: true },
      annotations: [{ id: "note-1" }],
    });
  });

  it("falls back to memory when IndexedDB is unavailable", async () => {
    const storage = createStudyStorage({ indexedDB: undefined });
    expect((await storage.health()).driver).toBe("memory-browser");
  });
});
```

- [ ] **Step 2: Verify RED**

Run: `npm test -- src/studyHub/studyHub.test.ts`

Expected: FAIL because state/storage files do not exist.

- [ ] **Step 3: Implement minimal state and storage adapter**

`StudyHubState`:

```ts
export interface StudyHubAnnotation {
  id: string;
  targetId: string;
  page: number;
  text: string;
}

export interface StudyHubState {
  selectedTopicId: string;
  progress: Record<string, boolean>;
  annotations: StudyHubAnnotation[];
}
```

`createStudyStorage()` should try `new IndexedDbStorage({ indexedDB, dbName: "motor-calculo-study" })`, call `health()`, and fall back to `MemoryStorage` if construction/health fails. Wrap with `namespaceStorage(storage, "study-hub")`.

Persist under `state.json` only; keep serialization simple and deterministic.

- [ ] **Step 4: Verify GREEN**

Run:

```bash
npm test -- src/studyHub/studyHub.test.ts
npm run typecheck
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/studyHub/types.ts src/studyHub/state.ts src/studyHub/adapters/storage.ts src/studyHub/studyHub.test.ts
git commit -m "feat: add persistent study hub state"
```

---

### Task 3: Adaptar workflow, busca e anotações

**Files:**
- Create: `src/studyHub/fixtures.ts`
- Create: `src/studyHub/adapters/workflows.ts`
- Create: `src/studyHub/adapters/search.ts`
- Create: `src/studyHub/adapters/annotations.ts`
- Test: `src/studyHub/adapters.test.ts`

**Interfaces:**
- Produces: `STUDY_WORKFLOW`, `validateStudyWorkflow()`, `getStudyTopic()`, `createStudySearch()`, `upsertSearchDocuments()`, `createStudyAnnotation()`.

- [ ] **Step 1: Add failing behavior tests**

```ts
it("rejects a cyclic study workflow", () => {
  expect(() => validateStudyWorkflow({
    nodes: [{ id: "a", type: "topic" }, { id: "b", type: "topic" }],
    edges: [{ source: "a", target: "b" }, { source: "b", target: "a" }],
  })).toThrow("workflow contains a cycle");
});

it("finds topics and newly-added annotations", () => {
  const search = createStudySearch([{ id: "limites", title: "Limites", description: "Limites laterais" }]);
  expect(search.query("limite")[0]?.document.id).toBe("limites");
  search.replaceDocuments([
    { id: "limites", title: "Limites", description: "Limites laterais" },
    { id: "annotation:abc", title: "Anotação", description: "termo-unico-e2e" },
  ]);
  expect(search.query("termo-unico-e2e")[0]?.document.id).toBe("annotation:abc");
});

it("normalizes study annotations through artisys-annotations", () => {
  expect(createStudyAnnotation({ id: "a1", targetId: "calculo1-demo", page: 1, text: "limite" })).toMatchObject({
    id: "a1",
    targetType: "pdf",
    page: 1,
  });
});
```

- [ ] **Step 2: Verify RED**

Run: `npm test -- src/studyHub/adapters.test.ts`

Expected: FAIL because adapters do not exist.

- [ ] **Step 3: Implement workflow/search/annotation adapters**

`STUDY_WORKFLOW` nodes:

```text
calculo-1
funcoes
limites
continuidade
derivadas
integrais
```

Edges: `calculo-1 ->` every topic node. Every topic `data` must include `label`, `summary` and one `example` string.

`validateStudyWorkflow()` must call both `validateWorkflow(workflow)` and `topologicalOrder(workflow)` so cycles fail before rendering.

Search fields: `title`, `description`, `kind`; weights `{ title: 3, description: 1, kind: 1 }`.

Annotations must call `normalizeAnnotation()` with a deterministic normalized rectangle:

```ts
geometry: { type: "rect", x: 0.05, y: 0.05, width: 0.9, height: 0.08, coordinateSpace: "normalized" }
```

- [ ] **Step 4: Verify GREEN**

Run: `npm test -- src/studyHub/adapters.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/studyHub/fixtures.ts src/studyHub/adapters/workflows.ts src/studyHub/adapters/search.ts src/studyHub/adapters/annotations.ts src/studyHub/adapters.test.ts
git commit -m "feat: add study workflow search and annotations"
```

---

### Task 4: Montar Dashboard/Central de Estudos na UI

**Files:**
- Create: `src/studyHub/adapters/dashboard.ts`
- Create: `src/studyHub/view.ts`
- Create: `src/studyHub/bootstrap.ts`
- Create: `src/studyHub/studyHub.css`
- Modify: `src/bootstrap.ts`
- Test: `src/studyHub/studyHub.test.ts`

**Interfaces:**
- Produces: `mountStudyHub(root?: HTMLElement): Promise<void>`.

- [ ] **Step 1: Write failing dashboard-layout test**

```ts
it("validates the seven visible study cards", () => {
  const layout = createStudyDashboardLayout();
  expect(layout.map((item) => item.id)).toEqual([
    "dashboard",
    "pdf",
    "annotations",
    "workflow",
    "search",
    "storage",
    "pwa",
  ]);
});
```

- [ ] **Step 2: Verify RED**

Run: `npm test -- src/studyHub/studyHub.test.ts`

Expected: FAIL because dashboard adapter does not exist.

- [ ] **Step 3: Implement validated layout and view markup**

`createStudyDashboardLayout()` must feed seven items into `validateDashboardLayout()`.

`view.ts` must append one `<section id="study-hub" aria-labelledby="study-hub-title">` after the existing calculator shell. Render seven visible cards with semantic headings:

```text
Central de Estudos
Painel de Estudos
Material PDF
Anotações
Mapa de Estudos
Busca Local
Progresso e Armazenamento
Offline / PWA
```

The workflow card must render one button per node with `data-study-topic="<id>"`. Selecting `Limites` must update a detail element containing its summary/example.

The annotation card must provide input `#study-annotation-input`, create button `#study-annotation-add` and list `#study-annotation-list`.

Search must provide `#study-search-input` and `#study-search-results`.

Progress card must expose one checkbox/button for current topic and show storage driver (`indexeddb` or `memory-browser`).

- [ ] **Step 4: Wire bootstrap and persistence**

`src/bootstrap.ts` becomes:

```ts
import "./main";
import "./final.css";
import "./studyHub/studyHub.css";
import { mountHistory } from "./history/ui";
import { registerPwa } from "./pwa/register";
import { mountStudyHub } from "./studyHub/bootstrap";

const pwaStatus = registerPwa();
mountHistory();
void mountStudyHub({ pwaStatus });
```

`mountStudyHub()` must load persisted state, initialize search with topic docs + annotation docs, mount UI, and persist after topic/progress/annotation changes.

- [ ] **Step 5: Run unit suite/typecheck**

Run:

```bash
npm test
npm run typecheck
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/bootstrap.ts src/studyHub
git commit -m "feat: render Apple Utils study hub"
```

---

### Task 5: Integrar PDF.js local e fixture PDF

**Files:**
- Create: `src/studyHub/adapters/pdf.ts`
- Create: `public/study/calculo1-demo.pdf`
- Modify: `package.json`
- Test: `src/studyHub/adapters.test.ts`

**Interfaces:**
- Produces: `loadStudyPdf(url: string): Promise<{ pages: number; url: string }>`.

- [ ] **Step 1: Write failing PDF adapter tests using injected runtimes**

```ts
it("reports page count from the Artisys PDF boundary", async () => {
  const pdfjs = {
    getDocument: () => ({ promise: Promise.resolve({ numPages: 3 }) }),
  };
  await expect(loadStudyPdf("/study/demo.pdf", pdfjs)).resolves.toEqual({
    pages: 3,
    url: "/study/demo.pdf",
  });
});

it("propagates a readable PDF load failure", async () => {
  const pdfjs = {
    getDocument: () => ({ promise: Promise.reject(new Error("arquivo corrompido")) }),
  };
  await expect(loadStudyPdf("/study/bad.pdf", pdfjs)).rejects.toThrow("arquivo corrompido");
});
```

- [ ] **Step 2: Verify RED**

Run: `npm test -- src/studyHub/adapters.test.ts`

Expected: FAIL because PDF adapter does not exist.

- [ ] **Step 3: Add public dependency and adapter**

Add runtime dependency:

```json
"pdfjs-dist": "^5.4.149"
```

Use explicit runtime injection in production:

```ts
import * as pdfjs from "pdfjs-dist";
import { loadPdfDocument } from "../../../vendor/artisys/pdf/index.mjs";

export async function loadStudyPdf(url: string, runtime = pdfjs) {
  const document = await loadPdfDocument(url, { pdfjs: runtime });
  return { pages: document.numPages, url };
}
```

Do not rely on the vendored module's bare dynamic import in the browser.

Generate a tiny valid one-page PDF fixture at `public/study/calculo1-demo.pdf`; it must contain the visible title `Material de demonstração - Calculo 1`.

- [ ] **Step 4: Wire visible PDF behavior**

The `Material PDF` card gets button `#study-pdf-open`, status `#study-pdf-status`, and `<iframe id="study-pdf-frame">` hidden until success. On success show `Carregado · N página(s)`; on failure show `Falha ao carregar PDF: ...`.

- [ ] **Step 5: Verify tests/build**

Run:

```bash
npm test
npm run typecheck
npm run build
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add package.json src/studyHub/adapters/pdf.ts src/studyHub public/study/calculo1-demo.pdf
git commit -m "feat: add local PDF study material"
```

---

### Task 6: Integrar PWA runtime ao Service Worker existente

**Files:**
- Create: `src/studyHub/adapters/pwa.ts`
- Modify: `src/pwa/register.ts`
- Modify: `public/sw.js`
- Test: `src/studyHub/adapters.test.ts`

**Interfaces:**
- Produces: `PwaUiStatus = "registrando" | "ativo" | "indisponível" | "falhou"`, `registerPwa(): Promise<PwaUiStatus>`.

- [ ] **Step 1: Write failing cache-plan/status tests**

```ts
it("builds the Motor cache through artisys-pwa-runtime", () => {
  expect(createMotorCachePlan()).toMatchObject({
    cacheName: "motor-calculo-2",
    offlineFallback: "/",
  });
  expect(createMotorCachePlan().shell).toContain("/study/calculo1-demo.pdf");
});

it("returns indisponível when service workers are unsupported", async () => {
  await expect(resolvePwaRegistration({ navigator: {} as Navigator })).resolves.toBe("indisponível");
});
```

- [ ] **Step 2: Verify RED**

Run: `npm test -- src/studyHub/adapters.test.ts`

Expected: FAIL because PWA adapter does not exist.

- [ ] **Step 3: Implement cache plan and registration state**

`createMotorCachePlan()` must call:

```ts
createCachePlan({
  prefix: "motor-calculo",
  version: "2",
  offlineFallback: "/",
  shell: [
    "/",
    "/manifest.webmanifest",
    "/icon-192.png",
    "/icon-512.png",
    "/vendor/jsxgraph.css",
    "/study/calculo1-demo.pdf",
    "/python-packages/mpmath-1.3.0-py3-none-any.whl",
    "/python-packages/sympy-1.14.0-py3-none-any.whl",
    "/pyodide/pyodide.mjs",
  ],
});
```

Update `public/sw.js` constants to the same plan values. Keep current network-first navigation and cache-first assets logic.

Refactor `registerPwa()` to return a Promise status. It must not swallow registration errors silently.

- [ ] **Step 4: Bind real status to UI**

The PWA card status element `#study-pwa-status` must begin as `Registrando…`, then resolve to `Ativo`, `Indisponível` or `Falhou`. Never set `Ativo` without a successful registration/ready state.

- [ ] **Step 5: Verify tests/build**

Run:

```bash
npm test
npm run typecheck
npm run build
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/pwa/register.ts src/studyHub/adapters/pwa.ts public/sw.js src/studyHub
git commit -m "feat: expose verified PWA runtime status"
```

---

### Task 7: Adicionar Playwright E2E que comprova UI + funcionamento real

**Files:**
- Create: `tests/e2e/study-hub.spec.ts`
- Create: `playwright.config.ts`
- Modify: `package.json`

**Interfaces:**
- Produces: `npm run test:e2e` com Chromium e servidor Vite local.

- [ ] **Step 1: Install/configure Playwright and write E2E before final UI fixes**

Add dev dependency:

```json
"@playwright/test": "^1.55.0"
```

Scripts:

```json
"preview:test": "vite --host 127.0.0.1 --port 4173",
"test:e2e": "playwright test"
```

`playwright.config.ts`:

```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  use: { baseURL: "http://127.0.0.1:4173", trace: "retain-on-failure" },
  webServer: {
    command: "npm run dev -- --host 127.0.0.1 --port 4173",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: false,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
```

- [ ] **Step 2: Write the seven-module visibility/behavior test**

```ts
import { expect, test } from "@playwright/test";

test("seven Apple Utils resources are visible and functional", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Central de Estudos" })).toBeVisible();

  for (const heading of [
    "Painel de Estudos",
    "Material PDF",
    "Anotações",
    "Mapa de Estudos",
    "Busca Local",
    "Progresso e Armazenamento",
    "Offline / PWA",
  ]) {
    await expect(page.getByRole("heading", { name: heading })).toBeVisible();
  }

  await page.getByRole("button", { name: "Limites" }).click();
  await expect(page.getByTestId("study-topic-detail")).toContainText("limite");

  await page.getByLabel("Buscar no material").fill("limite");
  await expect(page.getByTestId("study-search-results")).toContainText("Limites");

  await page.getByLabel("Nova anotação").fill("termo-unico-e2e");
  await page.getByRole("button", { name: "Adicionar anotação" }).click();
  await expect(page.getByTestId("study-annotation-list")).toContainText("termo-unico-e2e");

  await page.getByLabel("Buscar no material").fill("termo-unico-e2e");
  await expect(page.getByTestId("study-search-results")).toContainText("termo-unico-e2e");

  await page.getByRole("button", { name: "Abrir material PDF" }).click();
  await expect(page.getByTestId("study-pdf-status")).toContainText(/Carregado.*1 página/);

  await expect(page.getByTestId("study-storage-status")).toContainText(/indexeddb|memory-browser/);
  await expect(page.getByTestId("study-pwa-status")).toContainText(/Ativo|Indisponível|Falhou/);
});
```

- [ ] **Step 3: Write persistence E2E**

```ts
test("annotation and progress survive reload", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Limites" }).click();
  await page.getByLabel("Tópico concluído").check();
  await page.getByLabel("Nova anotação").fill("persistencia-e2e");
  await page.getByRole("button", { name: "Adicionar anotação" }).click();
  await page.reload();
  await expect(page.getByTestId("study-topic-detail")).toContainText("Limites");
  await expect(page.getByLabel("Tópico concluído")).toBeChecked();
  await expect(page.getByTestId("study-annotation-list")).toContainText("persistencia-e2e");
});
```

- [ ] **Step 4: Run E2E and fix only behavior required by failures**

Run:

```bash
npx playwright install chromium
npm run test:e2e
```

Expected: PASS.

- [ ] **Step 5: Run responsive smoke check**

Add one Playwright test with viewport `{ width: 390, height: 844 }` and assert the Central de Estudos plus calculator input remain visible without horizontal overflow:

```ts
expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
```

- [ ] **Step 6: Commit**

```bash
git add tests/e2e playwright.config.ts package.json src/studyHub
git commit -m "test: verify Apple Utils study hub end to end"
```

---

### Task 8: Final verification, documentation and deploy readiness

**Files:**
- Modify: `README.md`
- Modify as needed: only files implicated by verification failures.

**Interfaces:**
- Produces: documented deploy command compatible with current Cloudflare scripts.

- [ ] **Step 1: Update README**

Document:

```text
Central de Estudos
- 7 Apple Utils modules
- vendored snapshot origin
- npm test
- npm run typecheck
- npm run build
- npm run test:e2e
- update workflow for snapshots
```

Keep the existing PowerShell deployment flow as canonical:

```powershell
git.exe pull --ff-only
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\deploy.ps1
```

For deploying the feature branch before merge, document:

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

- [ ] **Step 2: Run complete JavaScript gate**

Run:

```bash
npm test
npm run typecheck
npm run build
npm run test:e2e
```

Expected: all PASS.

- [ ] **Step 3: Run existing Python kernel suite**

Run:

```bash
python -m pip install "sympy==1.14.0" "mpmath==1.3.0"
python -m unittest discover -s tests -p "test_*.py"
```

Expected: all existing kernel tests PASS.

- [ ] **Step 4: Inspect git diff for forbidden dependencies**

Verify there is no:

```text
git submodule pointing at private utilidades repo
runtime fetch from github.com/nutricionistaalmeidavh-spec/utilidades
paid API key
external mathematical API
React migration
second service worker
```

- [ ] **Step 5: Final commit**

```bash
git add README.md
git commit -m "docs: document study hub verification and deploy"
```

- [ ] **Step 6: Record verification evidence**

Final handoff must report exact results of:

```text
npm test
npm run typecheck
npm run build
npm run test:e2e
python -m unittest discover -s tests -p "test_*.py"
```

Do not claim completion if any command is red; report the failing command and failing test by name.

---

## Self-Review

### Spec coverage

- Seven modules incorporated: Tasks 1–6.
- Seven visible UI areas: Task 4.
- Real behavior per module: Tasks 2–6.
- PDF fixture and page count: Task 5.
- PWA real status, no fake `ativo`: Task 6.
- Search dynamically includes annotations: Task 3 + Task 7.
- Persistence across reload: Task 2 + Task 7.
- E2E presence + functionality: Task 7.
- R$ 0 / self-hosted / no private-repo deploy dependency: Task 1 + Task 8.
- Existing kernel/deploy compatibility: Task 8.

### Placeholder scan

No `TBD`, `TODO`, "implement later", generic "add tests", or unnamed error-handling steps remain.

### Type consistency

- `StudyHubState` is defined once in Task 2 and consumed by later tasks.
- PWA status values are fixed to `registrando | ativo | indisponível | falhou`.
- `loadStudyPdf()` returns `{ pages, url }` in tests and production.
- Storage path is fixed to namespace `study-hub` + `state.json`.

### Review Focus coverage

- IndexedDB unavailable: Task 2 tests memory fallback.
- Cyclic workflow: Task 3 test rejects cycle.
- PDF corrupt: Task 5 failure test.
- Service Worker unsupported: Task 6 test returns `indisponível`.
- Dynamic annotation search + persistence: Tasks 3 and 7.
