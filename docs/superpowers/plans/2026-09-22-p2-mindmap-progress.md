# P2 Mind Map and Progress Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a local, history-derived Cálculo 1 progress system with an interactive mind map, deterministic study mission, topic-aware review, and no new runtime dependency.

**Architecture:** Keep IndexedDB history as the only persistent source of truth. Introduce pure progress/topic models first, then build a static HTML+SVG mind map and progress UI on top, finally wire map and mission actions into existing study/history flows through `topicId` and the existing `motor-history-updated` event.

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
- Produces: `HistoryEntry.topicId?: string`; `ExamTopicId`; `ExamQuestion.topicId: ExamTopicId`; all exam history writes persist `topicId`.

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

```bash
npm test -- src/study/exam.test.ts
```

Expected: FAIL because `ExamQuestion` has no `topicId` and no application question exists.

- [ ] **Step 3: Add backward-compatible history metadata and retention**

In `src/history/storage.ts` add `topicId?: string` to `HistoryEntry` and change only:

```ts
const MAX_HISTORY = 240;
```

Do not change `DB_VERSION`, store name, key path, or index creation.

- [ ] **Step 4: Add explicit exam topic IDs and one application question**

In `src/study/exam.ts`, define:

```ts
export type ExamTopicId =
  | "funcoes"
  | "limites"
  | "derivadas"
  | "aplicacoes-derivadas"
  | "integrais"
  | "analise-funcoes"
  | "algebra";
```

Add `topicId: ExamTopicId` to `ExamQuestion`, assign every existing question, and append:

```ts
{
  id: "derivative-rate",
  prompt: "A altura é modelada por h(x)=x³-6x²+9x. Encontre a taxa instantânea h′(x).",
  expression: "x^3 - 6*x^2 + 9*x",
  operation: "differentiate",
  topic: "Aplicações de derivadas",
  topicId: "aplicacoes-derivadas",
  expected: "3*x^2 - 12*x + 9",
},
```

- [ ] **Step 5: Persist exam `topicId`**

In `src/study/exam-controller.ts`, include:

```ts
topicId: question.topicId,
```

inside the object passed to `buildHistoryEntry()`.

- [ ] **Step 6: Run tests and commit**

```bash
npm test -- src/study/exam.test.ts
npm run typecheck
git add src/history/storage.ts src/study/exam.ts src/study/exam-controller.ts src/study/exam.test.ts
git commit -m "feat: add stable topic metadata"
```

Expected: tests and typecheck PASS.

---

### Task 2: Build the pure progress and mission model

**Files:**
- Create: `src/progress/topics.ts`
- Create: `src/progress/model.ts`
- Create: `src/progress/model.test.ts`

**Interfaces:**
- Consumes: `HistoryEntry[]`.
- Produces: `TOPIC_ORDER`, `TopicId`, `resolveTopicId(entry)`, `buildProgress(entries, now?)`, `ProgressSummary`, `TopicProgress`, `StudyMission`.

- [ ] **Step 1: Write failing state/fallback/streak tests**

Create `src/progress/model.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import type { HistoryEntry } from "../history/storage";
import { buildProgress } from "./model";

const at = (iso: string, patch: Partial<HistoryEntry> = {}): HistoryEntry => ({
  id: `${iso}-${patch.topicId ?? patch.operation ?? "entry"}`,
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

  it("moves weak performance to review", () => {
    const result = buildProgress([
      at("2026-09-20T12:00:00-03:00", { outcome: "incorrect" }),
      at("2026-09-21T12:00:00-03:00", { outcome: "correct" }),
    ], new Date("2026-09-22T21:00:00-03:00"));
    expect(result.byTopic.limites.state).toBe("review");
  });

  it("requires at least three correct answers for mastered", () => {
    const result = buildProgress([
      at("2026-09-20T10:00:00-03:00", { outcome: "correct" }),
      at("2026-09-21T10:00:00-03:00", { outcome: "correct" }),
    ], new Date("2026-09-22T21:00:00-03:00"));
    expect(result.byTopic.limites.state).toBe("studying");
  });

  it("recovers to mastered at 80 percent with a latest correct answer", () => {
    const result = buildProgress([
      at("2026-09-18T10:00:00-03:00", { outcome: "incorrect" }),
      at("2026-09-19T10:00:00-03:00", { outcome: "correct" }),
      at("2026-09-20T10:00:00-03:00", { outcome: "correct" }),
      at("2026-09-21T10:00:00-03:00", { outcome: "correct" }),
      at("2026-09-22T10:00:00-03:00", { outcome: "correct" }),
    ], new Date("2026-09-22T21:00:00-03:00"));
    expect(result.byTopic.limites.state).toBe("mastered");
  });

  it("removes mastered when the newest assessed result is incorrect", () => {
    const result = buildProgress([
      at("2026-09-18T10:00:00-03:00", { outcome: "correct" }),
      at("2026-09-19T10:00:00-03:00", { outcome: "correct" }),
      at("2026-09-20T10:00:00-03:00", { outcome: "correct" }),
      at("2026-09-21T10:00:00-03:00", { outcome: "incorrect" }),
    ], new Date("2026-09-22T21:00:00-03:00"));
    expect(result.byTopic.limites.state).toBe("review");
  });

  it("prefers topicId over operation and never double counts", () => {
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

  it("starts streak yesterday and stops at the first gap", () => {
    const history = [
      at("2026-09-19T09:00:00-03:00"),
      at("2026-09-20T09:00:00-03:00"),
      at("2026-09-21T09:00:00-03:00"),
    ];
    expect(buildProgress(history, new Date("2026-09-22T21:00:00-03:00")).streakDays).toBe(3);
  });
});
```

- [ ] **Step 2: Run and confirm red**

```bash
npm test -- src/progress/model.test.ts
```

Expected: FAIL because the progress module does not exist.

- [ ] **Step 3: Define stable IDs and fallback mapping**

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
  simplify: "algebra", factor: "algebra", expand: "algebra", solve: "algebra",
  graph: "funcoes", roots: "funcoes", limit: "limites",
  differentiate: "derivadas", analyze: "analise-funcoes", integrate: "integrais",
};

const LEGACY_TOPIC: Record<string, TopicId> = {
  "Álgebra": "algebra", "Fatoração": "algebra", "Equações": "algebra",
  "Gráficos": "funcoes", "Raízes e zeros": "funcoes", "Limites": "limites",
  "Derivadas": "derivadas", "Aplicações de derivadas": "aplicacoes-derivadas",
  "Análise de funções": "analise-funcoes", "Integrais": "integrais",
};

export function isTopicId(value: string | undefined): value is TopicId {
  return Boolean(value && (TOPIC_ORDER as readonly string[]).includes(value));
}

export function resolveTopicId(entry: HistoryEntry): TopicId | null {
  if (isTopicId(entry.topicId)) return entry.topicId;
  return OPERATION_TOPIC[entry.operation] ?? (entry.topic ? LEGACY_TOPIC[entry.topic] ?? null : null);
}
```

- [ ] **Step 4: Implement the model contracts and exact state rules**

Create `src/progress/model.ts` with:

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
  targetView: "study";
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

Implementation rules are literal from the spec: missing `outcome` becomes `practice`; mastery is checked before review; weights are `0`, `0.40`, `0.55`, `1.00`; local calendar dates use `getFullYear()/getMonth()/getDate()`; all initial mission CTAs target `study` so the topic can be prefilled consistently.

- [ ] **Step 5: Add concrete mission and overall-progress tests**

Append:

```ts
it("prioritizes a review topic over untouched topics", () => {
  const result = buildProgress([
    at("2026-09-22T10:00:00-03:00", { topicId: "limites", outcome: "incorrect" }),
  ], new Date("2026-09-22T21:00:00-03:00"));
  expect(result.priorityTopicId).toBe("limites");
  expect(result.mission.kind).toBe("review");
  expect(result.mission.targetView).toBe("study");
});

it("uses lower accuracy to break review priority", () => {
  const result = buildProgress([
    at("2026-09-20T10:00:00-03:00", { topicId: "limites", outcome: "incorrect" }),
    at("2026-09-21T10:00:00-03:00", { topicId: "limites", outcome: "correct" }),
    at("2026-09-19T10:00:00-03:00", { topicId: "derivadas", outcome: "incorrect" }),
    at("2026-09-20T11:00:00-03:00", { topicId: "derivadas", outcome: "incorrect" }),
    at("2026-09-21T11:00:00-03:00", { topicId: "derivadas", outcome: "correct" }),
  ], new Date("2026-09-22T21:00:00-03:00"));
  expect(result.priorityTopicId).toBe("derivadas");
});

it("uses the first not-started topic when nothing needs review", () => {
  const result = buildProgress([], new Date("2026-09-22T21:00:00-03:00"));
  expect(result.priorityTopicId).toBe("algebra");
  expect(result.mission.kind).toBe("explore");
});

it("computes overall progress from topic-state weights", () => {
  const result = buildProgress([
    at("2026-09-20T10:00:00-03:00", { topicId: "limites", outcome: "correct" }),
    at("2026-09-21T10:00:00-03:00", { topicId: "limites", outcome: "correct" }),
    at("2026-09-22T10:00:00-03:00", { topicId: "limites", outcome: "correct" }),
  ], new Date("2026-09-22T21:00:00-03:00"));
  expect(result.byTopic.limites.state).toBe("mastered");
  expect(result.overallPercent).toBe(14);
});
```

Also add an all-mastered fixture by generating three explicit `correct` entries for each `TOPIC_ORDER` ID and assert `mission.kind === "maintenance"`.

- [ ] **Step 6: Run focused/full tests and commit**

```bash
npm test -- src/progress/model.test.ts
npm test
npm run typecheck
git add src/progress/topics.ts src/progress/model.ts src/progress/model.test.ts
git commit -m "feat: derive study progress from history"
```

Expected: PASS.

---

### Task 3: Define and validate mind-map content/topology

**Files:**
- Create: `src/mindmap/data.ts`
- Create: `src/mindmap/model.ts`
- Create: `src/mindmap/model.test.ts`

**Interfaces:**
- Consumes: `TopicId`, `ProgressSummary` from Task 2.
- Produces: `MIND_MAP_TOPICS`, `MIND_MAP_EDGES`, `buildMindMap(progress)`, `MindMapNode`, `MindMapModel`.

- [ ] **Step 1: Write failing topology tests**

Create `src/mindmap/model.test.ts`:

```ts
import { expect, it } from "vitest";
import { buildProgress } from "../progress/model";
import { MIND_MAP_EDGES, MIND_MAP_TOPICS } from "./data";
import { buildMindMap } from "./model";

it("has seven unique topics and only valid edges", () => {
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
    id: "1", createdAt: Date.now(), expression: "x^2", operation: "differentiate",
    variable: "x", resultText: "2*x", outcome: "correct", mode: "exam",
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

Expected: FAIL because map modules do not exist.

- [ ] **Step 3: Create the complete static topic catalog**

`MindMapTopic` contains:

```ts
interface MindMapTopic {
  id: TopicId;
  title: string;
  summary: string;
  concepts: string[];
  formulas: string[];
  relatedOperations: string[];
  practiceQuestion: string;
  desktop: { column: number; row: number };
}
```

Use these seven entries/content anchors:

```ts
{ id: "algebra", title: "Álgebra de apoio", concepts: ["fatoração", "simplificação", "equações"], formulas: ["a^2-b^2=(a-b)(a+b)"], practiceQuestion: "Fatore x² - 4" , desktop: { column: 1, row: 2 } }
{ id: "funcoes", title: "Funções", concepts: ["domínio", "imagem", "zeros", "gráfico"], formulas: ["y=f(x)"], practiceQuestion: "Encontre as raízes de f(x)=x²-4x+3", desktop: { column: 2, row: 2 } }
{ id: "limites", title: "Limites", concepts: ["aproximação", "continuidade", "limites laterais"], formulas: ["\\lim_{x\\to a} f(x)"], practiceQuestion: "Calcule o limite de (x²-4)/(x-2) quando x tende a 2", desktop: { column: 3, row: 1 } }
{ id: "derivadas", title: "Derivadas", concepts: ["taxa de variação", "reta tangente", "regras de derivação"], formulas: ["f'(x)=\\lim_{h\\to0}\\frac{f(x+h)-f(x)}{h}"], practiceQuestion: "Encontre a derivada de f(x)=x³-6x²+9x", desktop: { column: 3, row: 3 } }
{ id: "aplicacoes-derivadas", title: "Aplicações de derivadas", concepts: ["taxas", "otimização", "movimento"], formulas: ["v(t)=s'(t)"], practiceQuestion: "Para h(x)=x³-6x²+9x, encontre a taxa instantânea h′(x)", desktop: { column: 4, row: 3 } }
{ id: "analise-funcoes", title: "Análise completa de funções", concepts: ["crescimento", "extremos", "concavidade", "inflexão"], formulas: ["f'(x)=0", "f''(x)=0"], practiceQuestion: "Analise f(x)=x³-3x e encontre máximos e mínimos", desktop: { column: 5, row: 3 } }
{ id: "integrais", title: "Integrais", concepts: ["primitiva", "área", "integral definida"], formulas: ["\\int_a^b f(x)\\,dx"], practiceQuestion: "Calcule a integral de x de 0 até 2", desktop: { column: 4, row: 1 } }
```

Fill each `summary` with at most three concise sentences and set `relatedOperations` from the corresponding app operations.

Define edges exactly:

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

- [ ] **Step 4: Build render-ready nodes without recomputing mastery**

`buildMindMap(progress)` maps `MIND_MAP_TOPICS` to nodes carrying all editorial fields plus `state`, `practice`, `correct`, `incorrect`, `incoming`, and `outgoing`, taking state/counts only from `progress.byTopic`.

- [ ] **Step 5: Run tests and commit**

```bash
npm test -- src/mindmap/model.test.ts src/progress/model.test.ts
npm run typecheck
git add src/mindmap/data.ts src/mindmap/model.ts src/mindmap/model.test.ts
git commit -m "feat: add calculus mind map model"
```

Expected: PASS.

---

### Task 4: Add pure topic-aware history filtering

**Files:**
- Create: `src/history/filter.ts`
- Create: `src/history/filter.test.ts`
- Modify: `src/history/ui.ts`

**Interfaces:**
- Consumes: `HistoryEntry[]`, `TopicId | "all"`, outcome filter.
- Produces: `filterHistoryEntries(entries, filters)`; event contract `motor-history-filter` with `{ topicId, outcome }`.

- [ ] **Step 1: Write failing filter tests**

Create `src/history/filter.test.ts`:

```ts
import { expect, it } from "vitest";
import type { HistoryEntry } from "./storage";
import { filterHistoryEntries } from "./filter";

const entries: HistoryEntry[] = [
  { id: "1", createdAt: 1, expression: "a", operation: "limit", variable: "x", resultText: "", topicId: "limites", outcome: "incorrect" },
  { id: "2", createdAt: 2, expression: "b", operation: "differentiate", variable: "x", resultText: "", topicId: "derivadas", outcome: "incorrect" },
  { id: "3", createdAt: 3, expression: "c", operation: "limit", variable: "x", resultText: "", outcome: "correct" },
];

it("combines topic and outcome filters", () => {
  expect(filterHistoryEntries(entries, { topicId: "limites", outcome: "incorrect" }).map((entry) => entry.id)).toEqual(["1"]);
});
it("uses operation fallback for old entries without topicId", () => {
  expect(filterHistoryEntries(entries, { topicId: "limites", outcome: "all" }).map((entry) => entry.id)).toEqual(["1", "3"]);
});
```

- [ ] **Step 2: Run and confirm red**

```bash
npm test -- src/history/filter.test.ts
```

Expected: FAIL because the filter module does not exist.

- [ ] **Step 3: Implement the helper with `resolveTopicId()`**

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

- [ ] **Step 4: Refactor history UI to two independent filters**

Use:

```ts
let filters: HistoryFilters = { topicId: "all", outcome: "all" };
```

Read `listHistory(240)`, call `filterHistoryEntries()`, preserve the existing global error toggle by changing only `filters.outcome`, and listen for:

```ts
window.addEventListener("motor-history-filter", (event) => {
  const detail = (event as CustomEvent<{ topicId: TopicId; outcome: "incorrect" }>).detail;
  filters = { topicId: detail.topicId, outcome: detail.outcome };
  scheduleRender();
  document.getElementById("history-card")?.scrollIntoView({ behavior: "smooth", block: "start" });
});
```

Render a removable topic-filter chip when `topicId !== "all"`; clearing the topic chip does not reset `outcome`.

- [ ] **Step 5: Run checks and commit**

```bash
npm test -- src/history/filter.test.ts
npm test
npm run typecheck
git add src/history/filter.ts src/history/filter.test.ts src/history/ui.ts
git commit -m "feat: filter study history by topic"
```

Expected: PASS.

---

### Task 5: Render progress dashboard and semantic interactive map

**Files:**
- Create: `src/progress/ui.ts`
- Create: `src/mindmap/ui.ts`
- Modify: `src/study/shell.ts`
- Modify: `src/study/app.ts`
- Modify: `src/ux.css`

**Interfaces:**
- Consumes: `listHistory(240)`, `buildProgress()`, `buildMindMap()`, `HistoryEntry[]`.
- Produces: `ProgressSnapshot`, `loadProgressSnapshot()`, `renderProgressSummary()`, `mountMindMap()`; DOM events `motor-practice-topic` and `motor-review-topic`; new `mindmap` view.

- [ ] **Step 1: Add the third main view**

Change navigation to:

```html
<button type="button" class="view-tab active" data-view="study" aria-pressed="true">Estudar</button>
<button type="button" class="view-tab" data-view="mindmap" aria-pressed="false">Mapa Mental</button>
<button type="button" class="view-tab" data-view="exam" aria-pressed="false">Modo Prova</button>
```

Add:

```html
<section id="mindmap-view" hidden>
  <section id="progress-summary" class="progress-summary" aria-live="polite"></section>
  <section class="card mindmap-card">
    <div id="mindmap-canvas" class="mindmap-canvas"></div>
    <aside id="mindmap-detail" class="mindmap-detail"></aside>
  </section>
</section>
```

- [ ] **Step 2: Load one shared history/progress snapshot**

`src/progress/ui.ts` exports:

```ts
export interface ProgressSnapshot {
  entries: HistoryEntry[];
  progress: ProgressSummary;
}
export async function loadProgressSnapshot(): Promise<ProgressSnapshot | null> {
  try {
    const entries = await listHistory(240);
    return { entries, progress: buildProgress(entries) };
  } catch {
    return null;
  }
}
export function renderProgressSummary(target: HTMLElement, progress: ProgressSummary | null): void;
```

The renderer shows overall percentage, streak, assessed accuracy (`Sem questões avaliadas ainda` for null accuracy), mastered count, priority reason, mission title, and one mission CTA. The initial mission model always targets study, so the CTA dispatches:

```ts
window.dispatchEvent(new CustomEvent("motor-practice-topic", {
  detail: { topicId: progress.mission.topicId },
}));
```

For `progress === null`, render `Progresso local indisponível neste navegador` and no misleading numeric metrics.

- [ ] **Step 3: Implement semantic map rendering with recent errors and KaTeX fallback**

`src/mindmap/ui.ts` exports:

```ts
export function mountMindMap(container: HTMLElement, detail: HTMLElement): {
  refresh(progress: ProgressSummary | null, entries: HistoryEntry[]): void;
};
```

Each topic is an HTML `<button>` in `TOPIC_ORDER` with visible state text. The SVG is `aria-hidden="true"` and only draws edges. On desktop, use each topic's `desktop.column/row`; after nodes render, draw SVG `<line>` elements between node centers using `getBoundingClientRect()` relative to the map container and redraw on resize. On <=640px, switch to a vertical list/trail and hide the geometric SVG.

On node selection, build the detail panel. Recent errors are:

```ts
const recentErrors = entries
  .filter((entry) => entry.outcome === "incorrect" && resolveTopicId(entry) === node.id)
  .sort((a, b) => b.createdAt - a.createdAt)
  .slice(0, 3);
```

Render each error's expression/result text. Render formulas through:

```ts
function renderFormula(target: HTMLElement, formula: string): void {
  try {
    katex.render(formula, target, { throwOnError: false });
  } catch {
    target.textContent = formula;
  }
}
```

The detail panel always offers `Praticar agora`; offer `Revisar meus erros` only when `node.incorrect > 0`. Dispatch only events; do not manipulate study/history DOM directly.

- [ ] **Step 4: Use one refresh pipeline in `study/app.ts`**

Create:

```ts
async function refreshLearningProgress(): Promise<void> {
  const snapshot = await loadProgressSnapshot();
  renderProgressSummary(progressSummary, snapshot?.progress ?? null);
  mindMap.refresh(snapshot?.progress ?? null, snapshot?.entries ?? []);
}
```

Call on startup and on `motor-history-updated`.

Replace boolean exam navigation with:

```ts
const views = {
  study: get<HTMLElement>("study-view"),
  mindmap: get<HTMLElement>("mindmap-view"),
  exam: get<HTMLElement>("exam-view"),
};
```

A view switch hides all non-selected views and sets tab `aria-pressed` consistently.

- [ ] **Step 5: Add responsive map/progress CSS**

Desktop/tablet: map card uses a grid with the SVG behind positioned node buttons and a detail panel beside/below it. Mobile at `max-width: 640px`: nodes become a vertical trail, SVG geometry is hidden, CTAs are full-width, and no map pan/zoom is required.

- [ ] **Step 6: Verify IndexedDB failure behavior**

In devtools, temporarily block/delete IndexedDB permissions or temporarily force `listHistory()` to reject while testing. Confirm: progress shows unavailable; all seven structural topics still render; selecting a topic still shows concepts/formulas; `Praticar agora` remains enabled; calculations and Modo Prova still work. Restore normal code/configuration before commit.

- [ ] **Step 7: Run regression checks and commit**

```bash
npm test
python -m unittest discover -s tests -p "test_*.py"
npm run typecheck
npm run build
git add src/progress/ui.ts src/mindmap/ui.ts src/study/shell.ts src/study/app.ts src/ux.css
git commit -m "feat: add progress dashboard and mind map"
```

Expected: PASS.

---

### Task 6: Wire practice/mission/review actions with safe topic context

**Files:**
- Create: `src/study/topic-context.ts`
- Create: `src/study/topic-context.test.ts`
- Modify: `src/study/app.ts`
- Modify: `src/history/ui.ts`

**Interfaces:**
- Consumes: `motor-practice-topic`, `motor-review-topic`, `MIND_MAP_TOPICS`, `HistoryEntry.topicId`.
- Produces: temporary topic context that survives map/mission prefill → calculation → history capture and clears after manual edit.

- [ ] **Step 1: Write failing context test**

Create `src/study/topic-context.test.ts`:

```ts
import { expect, it } from "vitest";
import { createTopicContext } from "./topic-context";

it("keeps context only for the exact seeded question", () => {
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

Expected: FAIL because the module does not exist.

- [ ] **Step 3: Implement the context helper**

```ts
import type { TopicId } from "../progress/topics";
export function createTopicContext() {
  let topicId: TopicId | null = null;
  let seededQuestion = "";
  return {
    seed(id: TopicId, question: string) { topicId = id; seededQuestion = question.trim(); },
    clear() { topicId = null; seededQuestion = ""; },
    topicIdFor(question: string) {
      return topicId && question.trim() === seededQuestion ? topicId : null;
    },
  };
}
```

- [ ] **Step 4: Wire map and mission `Praticar agora`**

On `motor-practice-topic`, find the topic in `MIND_MAP_TOPICS`, seed the context with its `practiceQuestion`, fill `#expression`, clear operation lock, switch to `study`, run existing intent sync, and focus the textarea. Do not auto-run.

On user `input`, if the value differs from the seeded question, call `context.clear()` and remove `expressionInput.dataset.topicId`.

In `runCalculation()`, immediately before `renderResult(result)`, set:

```ts
expressionInput.dataset.topicId = context.topicIdFor(expressionInput.value) ?? "";
```

This ordering ensures the existing result `MutationObserver` captures the topic ID.

In `history/ui.ts`, read the dataset field in `currentSnapshot()` and set `entry.topicId` only when non-empty.

- [ ] **Step 5: Wire `Revisar meus erros`**

On `motor-review-topic`, dispatch:

```ts
window.dispatchEvent(new CustomEvent("motor-history-filter", {
  detail: { topicId, outcome: "incorrect" },
}));
```

The history module owns filtering/scrolling.

- [ ] **Step 6: Run all checks and commit**

```bash
npm test
python -m unittest discover -s tests -p "test_*.py"
npm run typecheck
npm run build
git add src/study/topic-context.ts src/study/topic-context.test.ts src/study/app.ts src/history/ui.ts
git commit -m "feat: connect mind map to study review flows"
```

Expected: PASS.

---

### Task 7: Final P2 verification and acceptance sweep

**Files:**
- Modify only files required by defects discovered during verification.

**Interfaces:**
- Consumes: complete P2 branch.
- Produces: CI-ready P2 with no known P0/P1 regression.

- [ ] **Step 1: Run the authoritative local checks**

```bash
npm install --no-audit --no-fund
npm test
python -m unittest discover -s tests -p "test_*.py"
npm run typecheck
npm run build
```

Expected: all PASS.

- [ ] **Step 2: Verify review-focus cases in dev mode**

```bash
npm run dev
```

Verify: empty history → seven `Não iniciado` nodes; practice-only history → no assessed percentage; legacy no-`topicId` records → operation fallback; unknown operation → streak only; mission CTA → Estudar prefilled with correct topic context; manual edit → context cleared; IndexedDB failure → structural map/practice still usable.

- [ ] **Step 3: Verify keyboard/mobile behavior**

At desktop and <=640px, tab through main tabs, every map node, topic CTAs, study controls, exam controls, and history controls. Confirm SVG edges are never focusable and mobile needs no pan gesture.

- [ ] **Step 4: Run deployment-script syntax checks**

```powershell
[ScriptBlock]::Create((Get-Content -Raw 'scripts/provision.ps1')) | Out-Null
[ScriptBlock]::Create((Get-Content -Raw 'scripts/deploy.ps1')) | Out-Null
```

Expected: no syntax error. GitHub Actions remains authoritative for Windows PowerShell 5.1.

- [ ] **Step 5: Commit only verification fixes**

If `git status --short` shows tracked fixes:

```bash
git add -u
git commit -m "fix: harden P2 learning progress UX"
```

If no fixes were needed, do not create an empty commit.
