# Corpus de Cálculo 1 e Revisão por Conteúdo — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Incorporar os nove materiais didáticos e os dez exercícios enviados ao MotorCalculoEngCivil, relacionando cada questão a conteúdos específicos e adicionando uma experiência de revisão por tópico integrada ao Modo Prova e ao histórico local.

**Architecture:** O corpus será versionado no próprio repositório: metadados e exercícios em TypeScript, texto integral extraído dos PDFs em Markdown estático sob `public/content/calculo1/`. A UI ganhará uma terceira visão `Revisar`, alimentada por funções puras de catálogo/progresso. O Modo Prova passará a consumir o mesmo banco de `StudyExercise`, com validadores por tipo de resposta. O histórico continuará em IndexedDB e receberá apenas novos campos opcionais, evitando migração de schema.

**Tech Stack:** Vite 8, TypeScript 7, Vitest 5, KaTeX 0.18.7, SymPy/Pyodide já existentes, IndexedDB, Service Worker estático, Cloudflare Workers/Static Assets.

**Spec:** `docs/superpowers/specs/2026-09-23-calculo1-corpus-revisao-design.md`

## Global Constraints

- Núcleo obrigatório: **R$ 0 / self-hosted / open source**.
- Nenhuma API matemática paga, serviço externo obrigatório ou CDN nova.
- Manter SymPy/Pyodide como motor matemático.
- O texto integral dos PDFs deve ser preservado como fonte; não completar lacunas silenciosamente com conhecimento geral.
- Quando texto, fórmula, figura ou tabela não puder ser recuperado fielmente, usar a marca explícita `[conteúdo visual/fórmula não recuperado integralmente da fonte]`.
- O texto completo dos materiais não deve entrar no bundle JavaScript principal; deve ser carregado sob demanda a partir de `public/content/calculo1/`.
- Conteúdo relacionado e resolução de uma questão só podem ser exibidos depois da correção no Modo Prova.
- As capturas de tela dos exercícios não precisam ser publicadas como assets; somente a transcrição estruturada deve entrar no app.
- O progresso permanece local em IndexedDB; sem login, backend de usuário ou sincronização em nuvem.
- Não substituir resultados matemáticos por alternativas provavelmente esperadas quando houver erro no enunciado; a inconsistência deve permanecer explicitamente marcada.

## Review Focus

1. **Material com página quase toda visual ou fórmula mal extraída:** o texto salvo deve manter o separador da página e uma marca de lacuna, sem inventar conteúdo. Coberto em Task 2.
2. **Questão de múltipla escolha com alternativa inconsistente:** a correção usa o gabarito matemático/estruturado e o `warning` explica a divergência depois da resposta. Coberto em Task 4 e Task 7.
3. **Usuário abre material online, depois fica offline:** o Markdown já visitado deve abrir a partir do cache do service worker. Coberto em Task 9.
4. **Histórico antigo sem novos campos (`exerciseId`, `topicIds`):** filtros e progresso devem ignorar esses campos ausentes sem quebrar. Coberto em Task 5 e Task 6.
5. **Filtro “errei” ou “ainda não respondi” em tópico sem histórico:** o resultado deve ser vazio ou conter apenas não respondidas, sem tratar ausência como erro. Coberto em Task 6.

---

## Task 1: Definir tipos, taxonomia e catálogo de materiais

**Files:**
- Create: `src/study/content/types.ts`
- Create: `src/study/content/topics.ts`
- Create: `src/study/content/materials.ts`
- Create: `src/study/content/content-index.test.ts`

**Interfaces:**
- Produces: `StudyTopic`, `StudyMaterial`, `StudyExercise`, `AnswerKind`, `STUDY_TOPICS`, `STUDY_MATERIALS`, `getTopicById()`.
- Consumed later by: exercises, review helpers, exam controller, review controller.

- [ ] **Step 1: Write the failing integrity tests for topic/material IDs**

Create `src/study/content/content-index.test.ts` with assertions equivalent to:

```ts
import { describe, expect, it } from 'vitest';
import { STUDY_MATERIALS } from './materials';
import { STUDY_TOPICS } from './topics';

function unique(values: string[]): boolean {
  return new Set(values).size === values.length;
}

describe('study content catalog', () => {
  it('uses unique topic ids', () => {
    expect(unique(STUDY_TOPICS.map((topic) => topic.id))).toBe(true);
  });

  it('uses unique material ids and valid topic references', () => {
    expect(unique(STUDY_MATERIALS.map((material) => material.id))).toBe(true);
    const topicIds = new Set(STUDY_TOPICS.map((topic) => topic.id));
    for (const material of STUDY_MATERIALS) {
      for (const topicId of material.topics) expect(topicIds.has(topicId)).toBe(true);
    }
  });

  it('registers all nine source PDFs', () => {
    expect(STUDY_MATERIALS).toHaveLength(9);
  });
});
```

- [ ] **Step 2: Run the test and verify failure**

Run: `npm test -- src/study/content/content-index.test.ts`

Expected: FAIL because `topics.ts` / `materials.ts` do not exist.

- [ ] **Step 3: Implement the shared types**

Create `src/study/content/types.ts`:

```ts
export type AnswerKind = 'expression' | 'single-choice' | 'multi-choice' | 'text';
export type StudyDifficulty = 'basico' | 'intermediario' | 'avancado';

export interface StudyTopic {
  id: string;
  group: 'Limites' | 'Continuidade' | 'Derivadas';
  title: string;
  summary: string;
  essentials: string[];
}

export interface StudyMaterial {
  id: string;
  title: string;
  originalFileName: string;
  topics: string[];
  textPath: string;
  pages?: number;
  notes?: string[];
}

export interface StudyExerciseOption {
  id: string;
  label: string;
}

export interface StudyExercise {
  id: string;
  origin: 'usuario' | 'material';
  prompt: string;
  expression?: string;
  operation: 'limit' | 'differentiate' | 'integrate' | 'analyze';
  answerKind: AnswerKind;
  options?: StudyExerciseOption[];
  correctOptionIds?: string[];
  expected?: string;
  explanation: string;
  relatedContentReason: string;
  topicIds: string[];
  primaryTopicId: string;
  difficulty: StudyDifficulty;
  sourceRefs: Array<{ materialId?: string; page?: number; imageName?: string }>;
  tags: string[];
  warning?: string;
  target?: string;
  direction?: '+' | '-' | '+-';
  lower?: string;
  upper?: string;
}
```

- [ ] **Step 4: Implement the stable topic taxonomy**

Create `src/study/content/topics.ts` containing exactly the IDs approved in the spec:

```ts
import type { StudyTopic } from './types';

export const STUDY_TOPICS: StudyTopic[] = [
  { id: 'limites.introducao', group: 'Limites', title: 'Introdução aos limites', summary: 'Comportamento de uma função quando a variável se aproxima de um valor.', essentials: [] },
  { id: 'limites.laterais', group: 'Limites', title: 'Limites laterais', summary: 'Comportamento pela esquerda e pela direita.', essentials: [] },
  { id: 'limites.propriedades', group: 'Limites', title: 'Propriedades de limites', summary: 'Regras algébricas aplicadas a limites existentes.', essentials: [] },
  { id: 'limites.fatoracao-cancelamento', group: 'Limites', title: 'Fatoração e cancelamento', summary: 'Remoção de indeterminações algébricas por fatoração.', essentials: [] },
  { id: 'limites.infinitos', group: 'Limites', title: 'Limites infinitos', summary: 'Casos em que a função cresce ou decresce sem limite.', essentials: [] },
  { id: 'limites.no-infinito', group: 'Limites', title: 'Limites no infinito', summary: 'Comportamento quando a variável tende a ±∞.', essentials: [] },
  { id: 'limites.assintotas', group: 'Limites', title: 'Assíntotas', summary: 'Relação entre limites e retas assintóticas.', essentials: [] },
  { id: 'limites.aplicacoes', group: 'Limites', title: 'Aplicações de limites', summary: 'Modelos e interpretações físicas ou contextuais.', essentials: [] },
  { id: 'continuidade.definicao', group: 'Continuidade', title: 'Definição de continuidade', summary: 'Condições para uma função ser contínua em um ponto.', essentials: [] },
  { id: 'continuidade.funcoes-por-partes', group: 'Continuidade', title: 'Funções por partes', summary: 'Continuidade nos pontos em que a lei da função muda.', essentials: [] },
  { id: 'continuidade.limites-laterais', group: 'Continuidade', title: 'Continuidade e limites laterais', summary: 'Comparação dos limites laterais com o valor da função.', essentials: [] },
  { id: 'continuidade.removivel', group: 'Continuidade', title: 'Descontinuidade removível', summary: 'Descontinuidade corrigível pela redefinição pontual da função.', essentials: [] },
  { id: 'continuidade.salto', group: 'Continuidade', title: 'Descontinuidade por salto', summary: 'Limites laterais finitos e diferentes.', essentials: [] },
  { id: 'continuidade.infinita', group: 'Continuidade', title: 'Descontinuidade infinita', summary: 'Comportamento não limitado próximo ao ponto.', essentials: [] },
  { id: 'derivadas.definicao-taxa-variacao', group: 'Derivadas', title: 'Derivada e taxa de variação', summary: 'Interpretação da derivada como taxa instantânea.', essentials: [] },
  { id: 'derivadas.linearidade', group: 'Derivadas', title: 'Linearidade da derivada', summary: 'Soma, diferença e multiplicação por constante.', essentials: [] },
  { id: 'derivadas.potencia', group: 'Derivadas', title: 'Regra da potência', summary: 'Derivação de potências da variável.', essentials: [] },
  { id: 'derivadas.produto', group: 'Derivadas', title: 'Regra do produto', summary: 'Derivação do produto de duas funções.', essentials: [] },
  { id: 'derivadas.quociente', group: 'Derivadas', title: 'Regra do quociente', summary: 'Derivação do quociente de duas funções.', essentials: [] },
  { id: 'derivadas.cadeia', group: 'Derivadas', title: 'Regra da cadeia', summary: 'Derivação de funções compostas.', essentials: [] },
  { id: 'derivadas.exponenciais-logaritmicas', group: 'Derivadas', title: 'Exponenciais e logarítmicas', summary: 'Regras de derivação para funções exponenciais e logarítmicas.', essentials: [] },
  { id: 'derivadas.trigonometricas', group: 'Derivadas', title: 'Derivadas trigonométricas', summary: 'Regras de derivação para seno, cosseno, tangente e relacionadas.', essentials: [] },
  { id: 'derivadas.implicita', group: 'Derivadas', title: 'Derivação implícita', summary: 'Derivação de relações em que y não está isolado.', essentials: [] },
  { id: 'derivadas.reta-tangente', group: 'Derivadas', title: 'Reta tangente', summary: 'Uso da derivada como inclinação da reta tangente.', essentials: [] },
];

export function getTopicById(id: string): StudyTopic | undefined {
  return STUDY_TOPICS.find((topic) => topic.id === id);
}
```

Populate `essentials` only with formulas/rules directly supported by the source PDFs during Task 2; do not fill from general knowledge here.

- [ ] **Step 5: Register the nine materials**

Create `src/study/content/materials.ts` with one `StudyMaterial` per approved source filename and `textPath` under `/content/calculo1/materials/`. Topic arrays may be conservative initially and must be refined while extracting each source in Task 2.

- [ ] **Step 6: Run tests and commit**

Run:

```bash
npm test -- src/study/content/content-index.test.ts
npm run typecheck
```

Expected: PASS.

Commit: `feat: add calculus study content catalog`

---

## Task 2: Extrair e versionar o texto integral dos nove PDFs

**Files:**
- Create: `public/content/calculo1/materials/slid-aula5-unid4.md`
- Create: `public/content/calculo1/materials/aula5-mod2.md`
- Create: `public/content/calculo1/materials/aula3-mod3.md`
- Create: `public/content/calculo1/materials/slides-aula4-mod2.md`
- Create: `public/content/calculo1/materials/aula3-unid3.md`
- Create: `public/content/calculo1/materials/slides-unidade2.md`
- Create: `public/content/calculo1/materials/mod3-aula3.md`
- Create: `public/content/calculo1/materials/slides-aula3-mod2.md`
- Create: `public/content/calculo1/materials/unidade2calc2.md`
- Create: `public/content/calculo1/manifest.json`
- Modify: `src/study/content/materials.ts`
- Modify: `src/study/content/topics.ts`
- Modify: `src/study/content/content-index.test.ts`

**Interfaces:**
- Produces static source texts loadable by `fetch(material.textPath)`.
- Produces manifest entries `{ id, path, originalFileName, pages }`.

- [ ] **Step 1: Extend the failing integrity test to require every static text path**

Add a test that loads the manifest JSON from the repository fixture representation and verifies exactly nine entries, unique IDs, and one path per registered material. Since Vitest does not fetch `public/`, import a generated TypeScript-side manifest mirror or read the JSON using Node `fs` in the test:

```ts
import { readFileSync } from 'node:fs';

const manifest = JSON.parse(readFileSync('public/content/calculo1/manifest.json', 'utf8')) as Array<{ id: string; path: string }>;
expect(manifest).toHaveLength(9);
for (const material of STUDY_MATERIALS) {
  expect(manifest.some((entry) => entry.id === material.id && entry.path === material.textPath)).toBe(true);
  expect(() => readFileSync(`public${material.textPath}`, 'utf8')).not.toThrow();
}
```

- [ ] **Step 2: Run test and verify failure**

Run: `npm test -- src/study/content/content-index.test.ts`

Expected: FAIL because the corpus files do not exist.

- [ ] **Step 3: Extract source text page by page**

For each of the nine attached PDFs, use the project Files source as the authority. Preserve source order and page boundaries in this format:

```md
# <original filename>

## Página 1

<text faithfully extracted from page 1>

## Página 2

<text faithfully extracted from page 2>
```

Rules for every page:
- preserve headings and mathematical notation as faithfully as retrieval allows;
- do not silently repair missing equations;
- when a visual, equation, table or symbol is materially missing from extracted text, insert `[conteúdo visual/fórmula não recuperado integralmente da fonte]` at that point;
- do not add explanatory prose to the source transcript;
- if a page has only a visual, still create the `## Página N` section.

- [ ] **Step 4: Build `manifest.json`**

Use a deterministic array with `id`, `path`, `originalFileName`, and `pages`. Keep its order equal to `STUDY_MATERIALS`.

- [ ] **Step 5: Refine topic mappings from source evidence**

As each source is extracted, update `materials.ts` topic arrays and only then populate `StudyTopic.essentials` when a rule/formula is explicitly present in one or more source texts.

- [ ] **Step 6: Add the “visual-gap” regression test**

Add a fixture assertion against at least one known page where parsed text is incomplete: the corresponding Markdown must contain the explicit gap marker rather than an invented reconstruction.

- [ ] **Step 7: Run tests and commit**

Run:

```bash
npm test -- src/study/content/content-index.test.ts
npm run typecheck
npm run build
```

Expected: PASS.

Commit: `content: add full calculus source corpus`

---

## Task 3: Cadastrar os dez exercícios enviados com tópicos e soluções

**Files:**
- Create: `src/study/content/exercises.ts`
- Modify: `src/study/content/content-index.test.ts`

**Interfaces:**
- Produces: `STUDY_EXERCISES`, `getExerciseById()`, `getExercisesByTopic()`.

- [ ] **Step 1: Write failing exercise integrity tests**

Add tests for:
- exactly ten initial user exercises;
- unique exercise IDs;
- valid `primaryTopicId` and every `topicIds` item;
- `primaryTopicId` included in `topicIds`;
- option-based questions have options and every `correctOptionIds` value exists;
- `expression` questions have `expected`;
- source image references use the actual screenshot filenames from the current corpus.

Example:

```ts
expect(STUDY_EXERCISES.filter((q) => q.origin === 'usuario')).toHaveLength(10);
```

- [ ] **Step 2: Run test and verify failure**

Run: `npm test -- src/study/content/content-index.test.ts`

Expected: FAIL because `exercises.ts` is absent.

- [ ] **Step 3: Implement all ten exercises**

Transcribe the ten distinct questions represented by `IMG_3329.png` through `IMG_3345.png`, consolidating multi-screenshot questions into one record. Use these stable IDs:

```text
usuario-continuidade-pecas-t4
usuario-limite-computadores-x9
usuario-limite-ohm-r0-direita
usuario-continuidade-partes-x0
usuario-limite-racional-x2
usuario-derivada-populacao-exponencial
usuario-derivada-tangente-polinomio
usuario-implicita-circulo-tangente
usuario-regras-derivacao-afirmacoes
usuario-derivada-cos-exp
```

The exact primary mappings are:

```text
continuidade.funcoes-por-partes
limites.fatoracao-cancelamento
limites.infinitos
continuidade.definicao
limites.propriedades
derivadas.exponenciais-logaritmicas
derivadas.trigonometricas
derivadas.implicita
derivadas.produto
derivadas.trigonometricas
```

Add complementary topics from the approved design table.

- [ ] **Step 4: Preserve the inconsistent derivative-assertions question explicitly**

For `usuario-regras-derivacao-afirmacoes`, store the mathematically supported result in the explanation and add a `warning` that the original alternatives do not perfectly match it. If an “expected by source system” option is retained for study context, label it in the warning only; do not overwrite the mathematical conclusion.

- [ ] **Step 5: Add helper functions**

```ts
export function getExerciseById(id: string): StudyExercise | undefined;
export function getExercisesByTopic(topicId: string): StudyExercise[];
```

- [ ] **Step 6: Run tests and commit**

Run:

```bash
npm test -- src/study/content/content-index.test.ts
npm run typecheck
```

Expected: PASS.

Commit: `content: add submitted calculus exercises`

---

## Task 4: Generalizar a correção do Modo Prova para quatro tipos de resposta

**Files:**
- Create: `src/study/answer-checker.ts`
- Create: `src/study/answer-checker.test.ts`
- Modify: `src/study/exam.ts`
- Modify: `src/study/exam.test.ts`

**Interfaces:**
- Produces: `checkStudyAnswer(exercise, answer, variable): Promise<boolean>`.
- `answer` shape:

```ts
export type StudyAnswer =
  | { kind: 'expression' | 'text'; value: string }
  | { kind: 'single-choice'; optionIds: [string] | [] }
  | { kind: 'multi-choice'; optionIds: string[] };
```

- [ ] **Step 1: Write failing validator tests**

Cover:
- symbolic equivalence via existing `checkEquivalent()`;
- one correct radio option;
- exact set equality for multi-choice independent of selection order;
- normalized text (`trim`, collapse whitespace, lowercase);
- incomplete or wrong answer returns `false`.

- [ ] **Step 2: Run test and verify failure**

Run: `npm test -- src/study/answer-checker.test.ts`

Expected: FAIL because implementation does not exist.

- [ ] **Step 3: Implement `checkStudyAnswer`**

Use existing symbolic equivalence only for `expression`. For choices, compare IDs. For text, normalize conservatively; do not add fuzzy or AI-based grading.

- [ ] **Step 4: Adapt `exam.ts` summary helpers to `StudyExercise`**

Replace the hard-coded six generic `EXAM_QUESTIONS` as the authoritative corpus. Keep `buildExamSummary`, but make attempts store `exerciseId` and derive review IDs from `primaryTopicId` / `topicIds`.

Define:

```ts
export interface ExamAttempt {
  exerciseId: string;
  correct: boolean;
}

export function buildExamSummary(
  attempts: ExamAttempt[],
  exercises: StudyExercise[] = STUDY_EXERCISES,
): { total: number; correct: number; incorrect: number; reviewTopicIds: string[] };
```

- [ ] **Step 5: Run tests and commit**

Run:

```bash
npm test -- src/study/answer-checker.test.ts src/study/exam.test.ts
npm run typecheck
```

Expected: PASS.

Commit: `feat: support multiple exam answer types`

---

## Task 5: Estender histórico local com IDs de exercício e tópicos

**Files:**
- Modify: `src/history/storage.ts`
- Modify: `src/history/storage.test.ts`

**Interfaces:**
- Extends `HistoryEntry` with optional:

```ts
exerciseId?: string;
topicIds?: string[];
primaryTopicId?: string;
sourceMaterialId?: string;
```

- [ ] **Step 1: Add failing metadata preservation test**

Extend `storage.test.ts` so `buildHistoryEntry()` preserves all four new fields.

- [ ] **Step 2: Add backward-compatibility test**

Construct a legacy entry without the new fields and assert the existing shape remains valid and no helper requires those fields.

- [ ] **Step 3: Implement optional fields only**

Do not bump `DB_VERSION`; IndexedDB records are schemaless here and no index on the new fields is needed. Keep existing `MAX_HISTORY` behavior unchanged.

- [ ] **Step 4: Run tests and commit**

Run:

```bash
npm test -- src/history/storage.test.ts
npm run typecheck
```

Expected: PASS.

Commit: `feat: track exercise topics in local history`

---

## Task 6: Criar funções puras de revisão, filtro e progresso

**Files:**
- Create: `src/study/review.ts`
- Create: `src/study/review.test.ts`

**Interfaces:**
- Produces:

```ts
export type ReviewFilter = 'all' | 'incorrect' | 'unanswered';
export interface TopicProgress { attempted: number; correct: number; incorrect: number; lastReviewedAt?: number }
export function filterExercisesForReview(exercises: StudyExercise[], history: HistoryEntry[], topicId: string, filter: ReviewFilter): StudyExercise[];
export function calculateTopicProgress(history: HistoryEntry[], topicId: string): TopicProgress;
export function materialsForTopic(topicId: string): StudyMaterial[];
```

- [ ] **Step 1: Write failing pure-function tests**

Cover:
- `all` returns all exercises tagged with topic;
- `incorrect` returns exercises whose most recent exam attempt is incorrect;
- `unanswered` returns exercises with no matching history record;
- empty history does not throw;
- legacy history without `topicIds` is ignored for topic progress;
- `lastReviewedAt` uses latest matching timestamp;
- materials group correctly by topic.

- [ ] **Step 2: Run test and verify failure**

Run: `npm test -- src/study/review.test.ts`

Expected: FAIL because `review.ts` is absent.

- [ ] **Step 3: Implement the pure helpers**

Use `exerciseId` for per-question status and `topicIds ?? []` for backward-compatible history filtering. Do not mutate inputs.

- [ ] **Step 4: Run tests and commit**

Run:

```bash
npm test -- src/study/review.test.ts
npm run typecheck
```

Expected: PASS.

Commit: `feat: add topic review and progress helpers`

---

## Task 7: Atualizar o Modo Prova para o corpus real e feedback pedagógico

**Files:**
- Modify: `src/study/shell.ts`
- Modify: `src/study/exam-controller.ts`
- Modify: `src/study/exam.test.ts`
- Modify: `src/round2.css`

**Interfaces:**
- Consumes: `STUDY_EXERCISES`, `checkStudyAnswer`, `getTopicById`, extended history.
- Produces browser UI for expression, single-choice, multi-choice and text answers.

- [ ] **Step 1: Add controller-level tests around answer control rendering where practical**

Keep pure behavior in tested helpers. Add at least one DOM-capable Vitest test or extracted render helper test that verifies:
- radio controls for `single-choice`;
- checkbox controls for `multi-choice`;
- text input for `expression` / `text`;
- related content absent before correction and present after correction.

- [ ] **Step 2: Modify shell answer markup**

Replace the single fixed `<input id="exam-answer">` dependency with:

```html
<div id="exam-answer-control"></div>
<div id="exam-related-content" hidden></div>
```

Keep labels/ARIA generated by the controller.

- [ ] **Step 3: Render input controls per `answerKind`**

In `exam-controller.ts`, create a local `renderAnswerControl(exercise)` that builds native inputs without `innerHTML` for user-facing option text.

- [ ] **Step 4: Collect and check answers**

Call `checkStudyAnswer()` instead of `checkEquivalent()` directly.

- [ ] **Step 5: Render post-answer feedback**

After correction, show:
- correct/incorrect;
- expected answer or correct option labels;
- `exercise.explanation`;
- topic titles resolved from `topicIds`;
- `exercise.relatedContentReason`;
- `exercise.warning` when present;
- a `Revisar este conteúdo` button carrying `primaryTopicId`.

Do not render those blocks before answer submission.

- [ ] **Step 6: Persist enriched history**

When calling `buildHistoryEntry`, include `exerciseId`, `topicIds`, `primaryTopicId`, and first referenced `materialId` if available.

- [ ] **Step 7: Make summary specific**

Resolve `reviewTopicIds` to topic titles, e.g. `regra do produto`, `derivadas trigonométricas`, rather than generic `Derivadas`.

- [ ] **Step 8: Run tests and commit**

Run:

```bash
npm test -- src/study/exam.test.ts src/study/answer-checker.test.ts
npm run typecheck
npm run build
```

Expected: PASS.

Commit: `feat: connect real calculus corpus to exam mode`

---

## Task 8: Adicionar a visão Revisar com materiais, tópicos, progresso e prática filtrada

**Files:**
- Create: `src/study/review-controller.ts`
- Modify: `src/study/shell.ts`
- Modify: `src/study/app.ts`
- Modify: `src/round2.css`
- Modify: `src/ux.css`
- Create: `src/study/review-controller.test.ts` or keep DOM-free behavior in `review.test.ts` and add a minimal integration test.

**Interfaces:**
- Consumes: topics, materials, exercises, review helpers, `listHistory()`.
- Emits custom event for filtered practice:

```ts
window.dispatchEvent(new CustomEvent('motor-start-topic-exam', { detail: { topicId } }));
```

- [ ] **Step 1: Add failing navigation/review rendering test**

Verify that the shell exposes three tabs with `data-view="study"`, `data-view="review"`, `data-view="exam"`, and that review state can resolve a selected topic.

- [ ] **Step 2: Add `Revisar` tab and section in `shell.ts`**

Create `#review-view` with:
- macro-group filter;
- topic card list;
- topic detail region;
- review filter buttons (`all`, `incorrect`, `unanswered`);
- material viewer region;
- related exercises region.

- [ ] **Step 3: Generalize view switching in `app.ts`**

Replace the boolean exam toggle with a three-view switch that hides all views except the selected target. Initialize `mountReviewController()` once after shell creation.

- [ ] **Step 4: Implement topic cards and progress**

For each topic render title, exercise count, attempted/correct/incorrect counts, last review when available, `Revisar conteúdo` and `Praticar questões`.

- [ ] **Step 5: Implement material viewer**

On material click:

```ts
const response = await fetch(material.textPath);
if (!response.ok) throw new Error('Não foi possível abrir o material.');
const markdown = await response.text();
```

Render as safe plain text / structured sections; do not inject Markdown with unsanitized HTML. A simple `<pre>` or line-to-elements renderer is sufficient for this delivery.

- [ ] **Step 6: Implement review filters**

Use `filterExercisesForReview()` and refresh from `listHistory()` after `motor-history-updated`.

- [ ] **Step 7: Wire topic practice to exam controller**

Extend `mountExamController()` with an optional exercise provider or `setExamExercises(exercises)` so `Praticar questões` starts a round containing only exercises tagged with the selected topic.

- [ ] **Step 8: Wire post-answer “Revisar este conteúdo”**

The button from Task 7 switches to the review tab and selects the referenced topic.

- [ ] **Step 9: Run tests and commit**

Run:

```bash
npm test -- src/study/review.test.ts src/study/exam.test.ts
npm run typecheck
npm run build
```

Expected: PASS.

Commit: `feat: add calculus topic review workspace`

---

## Task 9: Garantir cache offline dos materiais de revisão

**Files:**
- Modify: `public/sw.js`
- Modify: `public/content/calculo1/manifest.json` only if a cache version field is chosen.
- Optional Test: `src/pwa/content-cache.test.ts` if logic is extracted to TypeScript; otherwise verify behavior by browser/manual build test.

**Interfaces:**
- Static paths under `/content/calculo1/` use runtime cache-after-first-load.

- [ ] **Step 1: Inspect existing `sw.js` cache strategy before editing**

Preserve current runtime and app-shell caching semantics.

- [ ] **Step 2: Add content-path caching rule**

For GET requests whose pathname begins with `/content/calculo1/`, use cache-first after first successful network load:

```js
const cached = await caches.match(request);
if (cached) return cached;
const response = await fetch(request);
if (response.ok) {
  const cache = await caches.open(CACHE_NAME);
  await cache.put(request, response.clone());
}
return response;
```

Do not pre-cache every Markdown file if that would unnecessarily increase first-install transfer. Pre-cache at most the corpus manifest; individual materials become offline-capable after being opened once.

- [ ] **Step 3: Bump service-worker cache version**

Use a new deterministic cache name so old clients activate the updated logic.

- [ ] **Step 4: Verify offline behavior**

Run `npm run build`, serve the built app locally, open one material online, switch network offline, reopen the same material and confirm it renders. Also confirm an unopened material reports a normal fetch error rather than hanging.

- [ ] **Step 5: Commit**

Commit: `feat: cache calculus review content offline`

---

## Task 10: Integração final, acessibilidade, documentação e critérios de aceite

**Files:**
- Modify: `README.md`
- Modify: `src/study/app.ts` if integration defects remain
- Modify: `src/round2.css` / `src/ux.css` only for verified UX issues
- Tests: all existing and new tests

**Interfaces:**
- Final shipped behavior only; no new architectural interface.

- [ ] **Step 1: Add README section for corpus/review**

Document:
- nine versioned source texts;
- ten submitted exercises;
- Review tab;
- topic-specific exam practice;
- all-local/offline-after-load behavior;
- no external paid dependency.

- [ ] **Step 2: Run complete automated verification**

Run:

```bash
npm test
npm run typecheck
npm run build
```

Expected: all PASS.

- [ ] **Step 3: Perform acceptance walkthrough**

Verify each criterion explicitly:
1. Nine materials appear in catalog.
2. Each material opens its full extracted text.
3. Ten submitted exercises exist.
4. Every exercise has topic mapping and solution.
5. Related content is hidden before answer and shown after answer.
6. Review tab filters Limites, Continuidade, Derivadas and subtópicos.
7. Filters `todos`, `errei`, `ainda não respondi` work with empty and populated history.
8. Topic-only practice launches the expected subset.
9. Exam accepts symbolic, single-choice, multi-choice and text answers.
10. Exam summary reports specific subtópicos.
11. Legacy history entries do not break review UI.
12. Inconsistent derivative-assertions question displays a warning separating mathematical result from likely source-system expectation.
13. Previously opened material remains available offline.
14. Existing Study mode calculations, graph, history, PWA and math engine still work.

- [ ] **Step 4: Check accessibility and mobile layout**

On a narrow viewport:
- all three top-level tabs are reachable and readable;
- radio/checkbox labels have adequate tap targets;
- topic cards do not overflow horizontally;
- material text wraps or scrolls intentionally;
- focus moves to relevant heading/control after switching to Review or filtered Exam;
- related-content warning uses text, not color alone.

- [ ] **Step 5: Final regression verification**

Run again after any fixes:

```bash
npm test
npm run typecheck
npm run build
```

Expected: PASS with no TypeScript diagnostics.

- [ ] **Step 6: Commit final docs/fixes**

Commit: `docs: document calculus corpus review workflow`

---

## Final Review Checklist

Before merging, compare the branch against the approved spec and verify:

- [ ] Every approved taxonomy ID remains stable.
- [ ] Every one of the nine PDFs has one local Markdown transcript and one catalog entry.
- [ ] Every page in each PDF has a page separator in the transcript.
- [ ] No missing source content was silently reconstructed.
- [ ] All ten user exercises are represented exactly once.
- [ ] The question split across multiple screenshots is not duplicated.
- [ ] The inconsistent derivative assertion is visibly flagged.
- [ ] All four answer kinds have tests.
- [ ] Review progress tolerates old history entries.
- [ ] Content is loaded on demand, not bundled into the main JS.
- [ ] Opened content is available offline.
- [ ] No paid or externally hosted dependency was introduced.
- [ ] `npm test`, `npm run typecheck`, and `npm run build` all pass.
