# P2 Mind Map and Progress Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a local, history-derived Cálculo 1 progress system with an interactive mind map, deterministic study mission, topic-aware review, and no new runtime dependency.

**Architecture:** Keep IndexedDB history as the only persistent source of truth. Introduce pure progress/topic models first, then build a static HTML+SVG mind map and progress UI on top, finally wire map actions into the existing study/history flows through `topicId` and the existing `motor-history-updated` event.

**Tech Stack:** TypeScript 7, Vitest 5, Vite 8, IndexedDB, KaTeX, HTML, SVG, CSS, existing PWA/event architecture.

**Spec:** `docs/superpowers/specs/2026-09-22-p2-p3-learning-ux-design.md`

## Global Constraints

- Core remains local in the browser; no login, backend, analytics service, cloud sync, or paid runtime dependency.
- Use HTML + SVG + CSS for the map; add no graph library.
- Keep SymPy/Pyodide behavior untouched.
- IndexedDB `DB_VERSION` stays `1`; do not change the object store or indexes.
- History retention increases from `60` to exactly `240` entries.
- `HistoryEntry.topicId?: string` is optional and backward compatible.
- One history record contributes to exactly one primary topic for mastery metrics.
- `practice` counts as study activity but not assessed accuracy.
- No XP, ranks, coins, competitive badges, or topic locking.
- Mobile must not require canvas panning or precision pointing.

## Review Focus

- Legacy entries missing `topicId`, `outcome`, or `mode` must remain valid and use deterministic fallbacks.
- Unknown operations must still count toward streak activity while being ignored by per-topic mastery.
- Practice-only history must show no assessed accuracy instead of `0%` and must not enter review/mastered states.
- Streak logic must use local calendar dates and may start from today or yesterday, with gaps ending the streak.
- IndexedDB failure must leave the structural map and `Praticar agora` usable while progress persistence is reported unavailable.

---

### Task 1: Stabilize topic identity in history and exam questions

**Files:**
- Modify: `src/history/storage.ts`
- Modify: `src/study/exam.ts`
- Modify: `src/study/exam-controller.ts`
- Modify: `src/study/exam.test.ts`

**Interfaces:**
- Consumes: existing `HistoryEntry`, `ExamQuestion`, `addHistoryEntry()`.
- Produces: `HistoryEntry.topicId?: string`; `ExamQuestion.topicId: TopicIdLike`; all exam history writes persist `topicId`.

- [ ] **Step 1: Write failing exam metadata tests**

Add to `src/study/exam.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { EXAM_QUESTIONS } from "./exam";

describe("exam topic metadata", () => {
  it("assigns one stable topicId to every local exam question", () => {
    expect(EXAM_QUESTIONS.every((question) => Boolean(question.topicId))).toBe(true);
    expect(EXAM_QUESTIONS.map((question) => question.topicId)).toContain("aplicacoes-derivadas");
  });

  it("contains an explicit derivative application question", () => {
    const application = EXAM_QUESTIONS.find((question) => question.topicId === "aplicacoes-derivadas");
    expect(application?.operation).toBe("differentiate");
    expect(application?.expected).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run the focused test and confirm red**

Run:

```bash
npm test -- src/study/exam.test.ts
```

Expected: FAIL because `ExamQuestion` has no `topicId` and no application question exists.

- [ ] **Step 3: Add backward-compatible history metadata and retention**

In `src/history/storage.ts`:

```ts
export interface HistoryEntry {
  id: string;
  createdAt: number;
  expression: string;
  operation: string;
  variable: string;
  resultText: string;
  topic?: string;
  topicId?: string;
  outcome?: HistoryOutcome;
  mode?: HistoryMode;
  target?: string;
  direction?: string;
  derivativeOrder?: number;
  tangentPoint?: string;
  lower?: string;
  upper?: string;
}

const MAX_HISTORY = 240;
```

Do not change `DB_VERSION`, store name, key path, or index creation.

- [ ] **Step 4: Add explicit exam topic IDs and one application question**

Extend `ExamQuestion` in `src/study/exam.ts` with:

```ts
topicId:
  | "funcoes"
  | "limites"
  | "derivadas"
  | "aplicacoes-derivadas"
  | "integrais"
  | "analise-funcoes"
  | "algebra";
```

Assign existing questions to `limites`, `derivadas`, `integrais`, or `analise-funcoes`, and append:

```ts
{
  id: "derivative-motion",
  prompt: "A posição é s(t)=t³-6t²+9t. Encontre a velocidade v(t).",
  expression: "x^3 - 6*x^2 + 9*x",
  operation: "differentiate",
  topic: "Aplicações de derivadas",
  topicId: "aplicacoes-derivadas",
  expected: "3*x^2 - 12*x + 9",
},
```

Use `x` because the current equivalence checker receives the app's principal variable.

- [ ] **Step 5: Persist `topicId` from exam attempts**

In `src/study/exam-controller.ts`, include:

```ts
topicId: question.topicId,
```

inside the object passed to `buildHistoryEntry()`.

- [ ] **Step 6: Run tests and commit**

Run:

```bash
npm test -- src/study/exam.test.ts
npm run typecheck
```

Expected: PASS.

Commit:

```bash
git add src/history/storage.ts src/study/exam.ts src/study/exam-controller.ts src/study/exam.test.ts
git commit -m "feat: add stable topic metadata"
```

---

### Task 2: Build the pure progress model

**Files:**
- Create: `src/progress/topics.ts`
- Create: `src/progress/model.ts`
- Create: `src/progress/model.test.ts`

**Interfaces:**
- Consumes: `HistoryEntry[]`.
- Produces: `TOPIC_ORDER`, `TopicId`, `resolveTopicId(entry)`, `buildProgress(entries, now?)`, `ProgressSummary`, `TopicProgress`, `StudyMission`.

- [ ] **Step 1: Write failing topic and progress tests**

Create `src/progress/model.test.ts` with fixtures using fixed timestamps:

```ts
import { describe, expect, it } from "vitest";
import type { HistoryEntry } from "../history/storage";
import { buildProgress } from "./model";

const at = (iso: string, patch: Partial<HistoryEntry> = {}): HistoryEntry => ({
  id: iso,
  createdAt: new Date(iso).getTime(),
  expression: "x",
  operation: "limit",
  variable: "x",
  resultText: "ok",
  outcome: "practice",
  mode: "study",
  ...patch,
});

describe("buildProgress", () => {
  it("keeps practice out of assessed accuracy", () => {
    const result = buildProgress([at("2026-09-22T12:00:00-03:00")], new Date("2026-09-22T21:00:00-03:00"));
    expect(result.assessedAttempts).toBe(0);
    expect(result.accuracy).toBeNull();
    expect(result.byTopic.limites.state).toBe("studying");
  });

  it("moves a weak assessed topic to review", () => {
    const result = buildProgress([
      at("2026-09-20T12:00:00-03:00", { outcome: "incorrect" }),
      at("2026-09-21T12:00:00-03:00", { outcome: "correct" }),
    ], new Date("2026-09-22T21:00:00-03:00"));
    expect(result.byTopic.limites.state).toBe("review");
  });

  it("requires three correct assessed attempts before mastered", () => {
    const result = buildProgress([
      at("2026-09-20T10:00:00-03:00", { outcome: "correct" }),
      at("2026-09-21T10:00:00-03:00", { outcome: "correct" }),
    ], new Date("2026-09-22T21:00:00-03:00"));
    expect(result.byTopic.limites.state).toBe("studying");
  });

  it("recovers to mastered after sufficient later correctness", () => {
    const result = buildProgress([
      at("2026-09-18T10:00:00-03:00", { outcome: "incorrect" }),
      at("2026-09-19T10:00:00-03:00", { outcome: "correct" }),
      at("2026-09-20T10:00:00-03:00", { outcome: "correct" }),
      at("2026-09-21T10:00:00-03:00", { outcome: "correct" }),
      at("2026-09-22T10:00:00-03:00", { outcome: "correct" }),
    ], new Date("2026-09-22T21:00:00-03:00"));
    expect(result.byTopic.limites.state).toBe("mastered");
  });

  it("removes mastered when the newest assessed attempt is wrong", () => {
    const history = [
      at("2026-09-18T10:00:00-03:00", { outcome: "correct" }),
      at("2026-09-19T10:00:00-03:00", { outcome: "correct" }),
      at("2026-09-20T10:00:00-03:00", { outcome: "correct" }),
      at("2026-09-21T10:00:00-03:00", { outcome: "incorrect" }),
    ];
    expect(buildProgress(history, new Date("2026-09-22T21:00:00-03:00")).byTopic.limites.state).toBe("review");
  });

  it("prefers explicit topicId over operation and never double counts", () => {
    const result = buildProgress([
      at("2026-09-22T10:00:00-03:00", {
        operation: "differentiate",
        topicId: "aplicacoes-derivadas",
        outcome: "correct",
      }),
    ], new Date("2026-09-22T21:00:00-03:00"));
    expect(result.byTopic["aplicacoes-derivadas"].assessedAttempts).toBe(1);
    expect(result.byTopic.derivadas.assessedAttempts).toBe(0);
  });

  it("uses operation fallback and ignores unknown operations for topic mastery", () => {
    const result = buildProgress([
      at("2026-09-22T10:00:00-03:00", { operation: "differentiate", outcome: "correct" }),
      at("2026-09-22T11:00:00-03:00", { operation: "future-op", outcome: "correct" }),
    ], new Date("2026-09-22T21:00:00-03:00"));
    expect(result.byTopic.derivadas.assessedAttempts).toBe(1);
    expect(result.streakDays).toBe(1);
  });

  it("starts streak today or yesterday and stops on a gap", () => {
    const history = [
      at("2026-09-19T09:00:00-03:00"),
      at("2026-09-20T09:00:00-03:00"),
      at("2026-09-21T09:00:00-03:00"),
    ];
    expect(buildProgress(history, new Date("2026-09-22T21:00:00-03:00")).streakDays).toBe(3);
  });
});
```

- [ ] **Step 2: Run the test and confirm red**

```bash
npm test -- src/progress/model.test.ts
```

Expected: FAIL because the progress module does not exist.

- [ ] **Step 3: Define stable topic IDs and fallback mapping**

Create `src/progress/topics.ts`:

```ts
import type { HistoryEntry } from "../history/storage";

export const TOPIC_ORDER = [
  "algebra",
  "funcoes",
  "limites",
  "derivadas",
  "aplicacoes-derivadas",
  "analise-funcoes",
  "integrais",
] as const;

export type TopicId = (typeof TOPIC_ORDER)[number];

const OPERATION_TOPIC: Record<string, TopicId> = {
  simplify: "algebra",
  factor: "algebra",
  expand: "algebra",
  solve: "algebra",
  graph: "funcoes",
  roots: "funcoes",
  limit: "limites",
  differentiate: "derivadas",
  analyze: "analise-funcoes",
  integrate: "integrais",
};

const LEGACY_TOPIC: Record<string, TopicId> = {
  "Álgebra": "algebra",
  "Fatoração": "algebra",
  "Equações": "algebra",
  "Gráficos": "funcoes",
  "Raízes e zeros": "funcoes",
  "Limites": "limites",
  "Derivadas": "derivadas",
  "Aplicações de derivadas": "aplicacoes-derivadas",
  "Análise de funções": "analise-funcoes",
  "Integrais": "integrais",
};

export function isTopicId(value: string | undefined): value is TopicId {
  return Boolean(value && (TOPIC_ORDER as readonly string[]).includes(value));
}

export function resolveTopicId(entry: HistoryEntry): TopicId | null {
  if (isTopicId(entry.topicId)) return entry.topicId;
  return OPERATION_TOPIC[entry.operation] ?? (entry.topic ? LEGACY_TOPIC[entry.topic] ?? null : null);
}
```

- [ ] **Step 4: Implement the pure model exactly from the spec rules**

Create `src/progress/model.ts` exporting:

```ts
export type TopicState = "not_started" | "studying" | "review" | "mastered";

export interface TopicProgress {
  id: TopicId;
  state: TopicState;
  total: number;
  practice: number;
  correct: number;
  incorrect: number;
  assessedAttempts: number;
  accuracy: number | null;
  latestAssessedAt: number | null;
  latestAssessedOutcome: "correct" | "incorrect" | null;
}

export interface StudyMission {
  topicId: TopicId;
  kind: "review" | "practice" | "explore" | "maintenance";
  title: string;
  reason: string;
  targetView: "study" | "exam";
}

export interface ProgressSummary {
  byTopic: Record<TopicId, TopicProgress>;
  overallPercent: number;
  streakDays: number;
  assessedAttempts: number;
  correct: number;
  incorrect: number;
  accuracy: number | null;
  masteredCount: number;
  priorityTopicId: TopicId;
  mission: StudyMission;
}

export function buildProgress(entries: HistoryEntry[], now = new Date()): ProgressSummary;
```

Implement state order exactly: empty → `not_started`; mastery check; review check; otherwise `studying`. Treat missing `outcome` as `practice`. Overall weights are `0`, `0.40`, `0.55`, `1.00`. Use local `getFullYear()/getMonth()/getDate()` keys for streaks. Mission tie-breaking follows the spec in order.

- [ ] **Step 5: Add deterministic mission tests**

Append tests that assert: review topics win; lower accuracy wins; more errors breaks ties; newest error breaks the next tie; otherwise least-correct studying topic; otherwise first not-started in `TOPIC_ORDER`; all mastered falls back to maintenance.

- [ ] **Step 6: Run focused and full TypeScript tests, then commit**

```bash
npm test -- src/progress/model.test.ts
npm test
npm run typecheck
```

Expected: PASS.

```bash
git add src/progress/topics.ts src/progress/model.ts src/progress/model.test.ts
git commit -m "feat: derive study progress from history"
```

---

### Task 3: Define and validate the mind-map content model

**Files:**
- Create: `src/mindmap/data.ts`
- Create: `src/mindmap/model.ts`
- Create: `src/mindmap/model.test.ts`

**Interfaces:**
- Consumes: `TopicId`, `ProgressSummary`, `TopicProgress` from Task 2.
- Produces: `MIND_MAP_TOPICS`, `MIND_MAP_EDGES`, `buildMindMap(progress)`, `MindMapNode`, `MindMapModel`.

- [ ] **Step 1: Write failing topology tests**

Create `src/mindmap/model.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { buildProgress } from "../progress/model";
import { MIND_MAP_EDGES, MIND_MAP_TOPICS } from "./data";
import { buildMindMap } from "./model";

it("has seven unique ordered topics and valid edges", () => {
  const ids = MIND_MAP_TOPICS.map((topic) => topic.id);
  expect(ids).toHaveLength(7);
  expect(new Set(ids).size).toBe(7);
  for (const edge of MIND_MAP_EDGES) {
    expect(ids).toContain(edge.from);
    expect(ids).toContain(edge.to);
  }
});

it("does not inherit generic derivative activity into applications", () => {
  const progress = buildProgress([{
    id: "1",
    createdAt: Date.now(),
    expression: "x^2",
    operation: "differentiate",
    variable: "x",
    resultText: "2*x",
    outcome: "correct",
    mode: "exam",
  }]);
  const model = buildMindMap(progress);
  expect(model.nodes.find((node) => node.id === "derivadas")?.correct).toBe(1);
  expect(model.nodes.find((node) => node.id === "aplicacoes-derivadas")?.correct).toBe(0);
});
```

- [ ] **Step 2: Run and confirm red**

```bash
npm test -- src/mindmap/model.test.ts
```

Expected: FAIL because map files do not exist.

- [ ] **Step 3: Create the static topic catalog**

`src/mindmap/data.ts` must export a `MindMapTopic` interface containing `id`, `title`, `summary`, `concepts`, `formulas`, `relatedOperations`, and `practiceQuestion`, plus exactly these topic IDs: `algebra`, `funcoes`, `limites`, `derivadas`, `aplicacoes-derivadas`, `analise-funcoes`, `integrais`.

Define edges exactly from the spec:

```ts
export const MIND_MAP_EDGES = [
  { from: "algebra", to: "funcoes" },
  { from: "funcoes", to: "limites" },
  { from: "funcoes", to: "derivadas" },
  { from: "limites", to: "derivadas" },
  { from: "derivadas", to: "aplicacoes-derivadas" },
  { from: "derivadas", to: "analise-funcoes" },
  { from: "aplicacoes-derivadas", to: "analise-funcoes" },
  { from: "limites", to: "integrais" },
  { from: "derivadas", to: "integrais" },
] as const;
```

- [ ] **Step 4: Build the render-ready model**

`buildMindMap(progress)` returns nodes in `TOPIC_ORDER`, with each node carrying title/content plus `state`, `practice`, `correct`, `incorrect`, `incoming`, and `outgoing`. Do not derive additional mastery here; use `ProgressSummary.byTopic` as the source of state.

- [ ] **Step 5: Run tests and commit**

```bash
npm test -- src/mindmap/model.test.ts src/progress/model.test.ts
npm run typecheck
```

Expected: PASS.

```bash
git add src/mindmap/data.ts src/mindmap/model.ts src/mindmap/model.test.ts
git commit -m "feat: add calculus mind map model"
```

---

### Task 4: Add pure history filtering for topic-aware review

**Files:**
- Create: `src/history/filter.ts`
- Create: `src/history/filter.test.ts`
- Modify: `src/history/ui.ts`

**Interfaces:**
- Consumes: `HistoryEntry[]`, `TopicId | "all"`, outcome filter.
- Produces: `filterHistoryEntries(entries, filters)`; window event contract `motor-history-filter` with `{ topicId, outcome }`.

- [ ] **Step 1: Write failing filter tests**

```ts
import { describe, expect, it } from "vitest";
import { filterHistoryEntries } from "./filter";

const entries = [
  { id: "1", createdAt: 1, expression: "a", operation: "limit", variable: "x", resultText: "", topicId: "limites", outcome: "incorrect" },
  { id: "2", createdAt: 2, expression: "b", operation: "differentiate", variable: "x", resultText: "", topicId: "derivadas", outcome: "incorrect" },
  { id: "3", createdAt: 3, expression: "c", operation: "limit", variable: "x", resultText: "", outcome: "correct" },
] as const;

it("combines topic and outcome filters", () => {
  expect(filterHistoryEntries([...entries], { topicId: "limites", outcome: "incorrect" }).map((entry) => entry.id)).toEqual(["1"]);
});

it("uses topic fallback for old entries without topicId", () => {
  expect(filterHistoryEntries([...entries], { topicId: "limites", outcome: "all" }).map((entry) => entry.id)).toEqual(["1", "3"]);
});
```

- [ ] **Step 2: Run and confirm red**

```bash
npm test -- src/history/filter.test.ts
```

- [ ] **Step 3: Implement filter helper using `resolveTopicId()`**

```ts
export interface HistoryFilters {
  topicId: TopicId | "all";
  outcome: "all" | "incorrect";
}

export function filterHistoryEntries(entries: HistoryEntry[], filters: HistoryFilters): HistoryEntry[] {
  return entries.filter((entry) => {
    const topicMatches = filters.topicId === "all" || resolveTopicId(entry) === filters.topicId;
    const outcomeMatches = filters.outcome === "all" || entry.outcome === "incorrect";
    return topicMatches && outcomeMatches;
  });
}
```

- [ ] **Step 4: Refactor `history/ui.ts` to use explicit filters**

Replace `onlyErrors` with:

```ts
let filters: HistoryFilters = { topicId: "all", outcome: "all" };
```

Use `listHistory(240)`, then `filterHistoryEntries()`. Keep the global error button behavior by toggling only `filters.outcome`. Listen for:

```ts
window.addEventListener("motor-history-filter", (event) => {
  const detail = (event as CustomEvent<{ topicId: TopicId; outcome: "incorrect" }>).detail;
  filters = { topicId: detail.topicId, outcome: detail.outcome };
  scheduleRender();
  document.getElementById("history-card")?.scrollIntoView({ behavior: "smooth", block: "start" });
});
```

Display a clear topic filter chip/button when `topicId !== "all"`; clearing it must retain the current outcome filter.

- [ ] **Step 5: Run tests and commit**

```bash
npm test -- src/history/filter.test.ts
npm test
npm run typecheck
```

```bash
git add src/history/filter.ts src/history/filter.test.ts src/history/ui.ts
git commit -m "feat: filter study history by topic"
```

---

### Task 5: Render progress summary and interactive mind map

**Files:**
- Create: `src/progress/ui.ts`
- Create: `src/mindmap/ui.ts`
- Modify: `src/study/shell.ts`
- Modify: `src/study/app.ts`
- Modify: `src/ux.css`

**Interfaces:**
- Consumes: `listHistory(240)`, `buildProgress()`, `buildMindMap()`, `MIND_MAP_TOPICS`.
- Produces: `mountProgressAndMindMap()` and DOM events `motor-practice-topic`, `motor-review-topic`; new `mindmap` main view.

- [ ] **Step 1: Add the third main view markup**

In `src/study/shell.ts`, change the view switch to three buttons:

```html
<button type="button" class="view-tab active" data-view="study" aria-pressed="true">Estudar</button>
<button type="button" class="view-tab" data-view="mindmap" aria-pressed="false">Mapa Mental</button>
<button type="button" class="view-tab" data-view="exam" aria-pressed="false">Modo Prova</button>
```

Add `#mindmap-view` containing:

```html
<section id="progress-summary" class="progress-summary" aria-live="polite"></section>
<section class="card mindmap-card">
  <div id="mindmap-canvas" class="mindmap-canvas"></div>
  <aside id="mindmap-detail" class="mindmap-detail" aria-live="polite"></aside>
</section>
```

- [ ] **Step 2: Implement resilient progress UI**

`src/progress/ui.ts` exports:

```ts
export async function renderProgressSummary(target: HTMLElement): Promise<ProgressSummary | null>;
```

On success, render overall progress, streak, assessed accuracy (`Sem questões avaliadas ainda` when null), mastered count, and mission with one CTA. On IndexedDB failure, render `Progresso local indisponível neste navegador` and return `null` without throwing.

- [ ] **Step 3: Implement semantic map UI**

`src/mindmap/ui.ts` exports:

```ts
export function mountMindMap(container: HTMLElement, detail: HTMLElement): {
  refresh(progress: ProgressSummary | null): void;
};
```

Render HTML `<button>` nodes in pedagogical order. Render SVG edges with `aria-hidden="true"`. Every node contains its title plus visible state text (`Não iniciado`, `Em estudo`, `Revisar`, `Dominado`). If progress is unavailable, keep all structural nodes visible with an `Indisponível` supplemental message without disabling practice.

The detail panel must expose topic summary, formulas/concepts, `X acertos · Y erros · Z práticas`, incoming/outgoing relations, recent-error count, `Praticar agora`, and conditional `Revisar meus erros`.

- [ ] **Step 4: Wire refresh to the existing history event**

In `src/study/app.ts`, mount the progress/map controller after the shell. On `motor-history-updated`, re-read history, rebuild progress, and call `refresh()` without page reload.

Update tab logic from boolean `exam` to explicit view IDs:

```ts
const views = {
  study: get<HTMLElement>("study-view"),
  mindmap: get<HTMLElement>("mindmap-view"),
  exam: get<HTMLElement>("exam-view"),
};
```

Hide all except the selected view and update `aria-pressed` on all tabs.

- [ ] **Step 5: Add responsive map/progress styling**

Desktop/tablet: CSS grid with positioned HTML nodes and absolute decorative SVG behind them. Mobile at `max-width: 640px`: switch `.mindmap-canvas` to a vertical grid/list; hide/replace complex edge geometry with simple connector lines; no pan/zoom container.

- [ ] **Step 6: Run regression tests and commit**

```bash
npm test
python -m unittest discover -s tests -p "test_*.py"
npm run typecheck
npm run build
```

Expected: all pass.

```bash
git add src/progress/ui.ts src/mindmap/ui.ts src/study/shell.ts src/study/app.ts src/ux.css
git commit -m "feat: add progress dashboard and mind map"
```

---

### Task 6: Wire topic actions and preserve/discard practice context correctly

**Files:**
- Modify: `src/study/app.ts`
- Modify: `src/history/ui.ts`
- Create: `src/study/topic-context.ts`
- Create: `src/study/topic-context.test.ts`

**Interfaces:**
- Consumes: map events from Task 5 and `HistoryEntry.topicId` from Task 1.
- Produces: temporary `topicId` context that survives map-prefill → solve → history capture, but clears on manual edit.

- [ ] **Step 1: Write failing context tests**

```ts
import { expect, it } from "vitest";
import { createTopicContext } from "./topic-context";

it("keeps map topic context until the seeded question is changed", () => {
  const context = createTopicContext();
  context.seed("limites", "Calcule o limite de 1/x quando x tende a ∞");
  expect(context.topicIdFor("Calcule o limite de 1/x quando x tende a ∞")).toBe("limites");
  expect(context.topicIdFor("Calcule o limite de x quando x tende a 0")).toBeNull();
});
```

- [ ] **Step 2: Run and confirm red**

```bash
npm test -- src/study/topic-context.test.ts
```

- [ ] **Step 3: Implement a tiny pure context helper**

```ts
export function createTopicContext() {
  let topicId: TopicId | null = null;
  let seededQuestion = "";
  return {
    seed(id: TopicId, question: string) { topicId = id; seededQuestion = question.trim(); },
    clear() { topicId = null; seededQuestion = ""; },
    topicIdFor(question: string) {
      if (!topicId || question.trim() !== seededQuestion) return null;
      return topicId;
    },
  };
}
```

- [ ] **Step 4: Wire `Praticar agora`**

When `motor-practice-topic` fires, get the selected topic's `practiceQuestion`, call `context.seed(topicId, question)`, fill `#expression`, reset operation lock, switch to `study`, call existing intent sync, focus the textarea, and do not auto-run.

On any user-originated `input` event whose value differs from the seeded question, clear the context.

Before/after a successful calculation, expose the active context to history capture with `expressionInput.dataset.topicId = context.topicIdFor(expressionInput.value) ?? ""`.

In `history/ui.ts`, read that dataset field in `currentSnapshot()` and set `entry.topicId` only when non-empty.

- [ ] **Step 5: Wire `Revisar meus erros`**

When `motor-review-topic` fires, dispatch:

```ts
window.dispatchEvent(new CustomEvent("motor-history-filter", {
  detail: { topicId, outcome: "incorrect" },
}));
```

The map must not directly manipulate the history DOM.

- [ ] **Step 6: Run all checks and commit**

```bash
npm test
python -m unittest discover -s tests -p "test_*.py"
npm run typecheck
npm run build
```

```bash
git add src/study/app.ts src/study/topic-context.ts src/study/topic-context.test.ts src/history/ui.ts
git commit -m "feat: connect mind map to study review flows"
```

---

### Task 7: Final P2 verification and acceptance sweep

**Files:**
- Modify only files required by defects discovered during verification.

**Interfaces:**
- Consumes: complete P2 branch.
- Produces: a CI-ready P2 implementation with no known regression against P0/P1.

- [ ] **Step 1: Run the authoritative local command set**

```bash
npm install --no-audit --no-fund
npm test
python -m unittest discover -s tests -p "test_*.py"
npm run typecheck
npm run build
```

Expected: TypeScript tests, SymPy tests, typecheck, and production build all pass.

- [ ] **Step 2: Verify five review-focus cases manually in dev mode**

Run:

```bash
npm run dev
```

Verify: empty history shows complete `Não iniciado` map; practice-only activity shows no assessed percentage; legacy records without `topicId` map by operation; map practice context clears after manual edit; IndexedDB denial/failure leaves calculation and map practice usable while progress reports unavailable.

- [ ] **Step 3: Verify desktop/mobile keyboard behavior**

At desktop and <=640px widths, tab through `Estudar`, `Mapa Mental`, `Modo Prova`, every map node, `Praticar agora`, and `Revisar meus erros`. Confirm SVG edges never receive focus and mobile requires no pan gesture.

- [ ] **Step 4: Run the exact CI-equivalent checks for deployment scripts**

On PowerShell-capable environment:

```powershell
[ScriptBlock]::Create((Get-Content -Raw 'scripts/provision.ps1')) | Out-Null
[ScriptBlock]::Create((Get-Content -Raw 'scripts/deploy.ps1')) | Out-Null
```

Expected: no syntax error. GitHub Actions remains the authority for Windows PowerShell 5.1.

- [ ] **Step 5: Commit only if verification required fixes**

```bash
git add <only-files-changed-by-verification>
git commit -m "fix: harden P2 learning progress UX"
```

If no fixes were needed, do not create an empty commit.
