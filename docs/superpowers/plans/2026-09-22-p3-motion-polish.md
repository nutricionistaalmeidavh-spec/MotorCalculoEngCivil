# P3 Motion and Visual Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add accessible, non-blocking motion and visual polish across study, mind map, progress, history, and exam flows without changing mathematical behavior or adding runtime dependencies.

**Architecture:** Implement P3 as a presentation layer on top of the completed P2 DOM structure. Centralize motion timing/state classes in CSS and use only minimal TypeScript helpers where JavaScript is required to mark view/result transitions; preserve all existing functional controllers and rely on `prefers-reduced-motion` for accessibility.

**Tech Stack:** TypeScript 7, Vitest 5, Vite 8, CSS animations/transitions, semantic HTML, existing study/mind-map/progress modules.

**Spec:** `docs/superpowers/specs/2026-09-22-p2-p3-learning-ux-design.md`

## Global Constraints

- P3 must not change SymPy/Pyodide calculations, parsing rules, mastery rules, persistence schema, or history semantics.
- Add no new runtime dependency.
- Microinteractions target `120–180ms`; panel/card transitions target `180–260ms`; one-shot update highlights may last up to `500ms`.
- Do not add continuous animation, parallax, decorative looping motion, or interaction-blocking transitions.
- Under `@media (prefers-reduced-motion: reduce)`, transitions/animations become effectively instant and smooth scrolling is disabled.
- No state may depend on color alone; visible labels remain the source of truth.
- Keyboard focus must remain visible and predictable during/after transitions.
- Mobile interaction must not require precision pointing.

## Review Focus

- Rapidly switching views must never leave two views visible or a focus target hidden.
- Reduced-motion users must receive all result/exam/map feedback without animation-dependent timing.
- Re-rendering progress/map after `motor-history-updated` must not restart endless or distracting animation.
- Disabled/loading controls must remain legible and not shift layout while state changes.
- Programmatic smooth scrolling must be skipped when reduced motion is requested.

---

### Task 1: Create reusable motion state helpers

**Files:**
- Create: `src/ui/motion.ts`
- Create: `src/ui/motion.test.ts`
- Modify: `src/study/app.ts`

**Interfaces:**
- Consumes: `window.matchMedia`, target `HTMLElement`s.
- Produces: `prefersReducedMotion()`, `enterOnce(element, className?)`, `scrollIntoViewRespectingMotion(element, options?)`.

- [ ] **Step 1: Write failing helper tests**

Create `src/ui/motion.test.ts`:

```ts
import { describe, expect, it, vi } from "vitest";
import { motionBehavior, viewTransitionClasses } from "./motion";

describe("motion helpers", () => {
  it("uses auto scrolling when reduced motion is requested", () => {
    expect(motionBehavior(true)).toBe("auto");
    expect(motionBehavior(false)).toBe("smooth");
  });

  it("returns one-shot transition classes without persistent animation state", () => {
    expect(viewTransitionClasses("mindmap")).toEqual(["view-panel", "view-enter", "view-mindmap"]);
  });
});
```

Keep pure helpers testable even though browser-facing wrappers use DOM APIs.

- [ ] **Step 2: Run and confirm red**

```bash
npm test -- src/ui/motion.test.ts
```

Expected: FAIL because `src/ui/motion.ts` does not exist.

- [ ] **Step 3: Implement minimal motion helpers**

Create `src/ui/motion.ts`:

```ts
export function motionBehavior(reduced: boolean): ScrollBehavior {
  return reduced ? "auto" : "smooth";
}

export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined"
    && typeof window.matchMedia === "function"
    && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function viewTransitionClasses(view: "study" | "mindmap" | "exam"): string[] {
  return ["view-panel", "view-enter", `view-${view}`];
}

export function enterOnce(element: HTMLElement, className = "ui-enter"): void {
  element.classList.remove(className);
  if (prefersReducedMotion()) return;
  void element.offsetWidth;
  element.classList.add(className);
}

export function scrollIntoViewRespectingMotion(
  element: Element,
  options: Omit<ScrollIntoViewOptions, "behavior"> = { block: "start" },
): void {
  element.scrollIntoView({ ...options, behavior: motionBehavior(prefersReducedMotion()) });
}
```

Do not use timers for correctness; CSS animation completion is purely visual.

- [ ] **Step 4: Replace direct smooth scrolling in `study/app.ts`**

Replace:

```ts
document.querySelector(".solution-workspace")?.scrollIntoView({ behavior: "smooth", block: "start" });
```

with:

```ts
const solutionWorkspace = document.querySelector(".solution-workspace");
if (solutionWorkspace) scrollIntoViewRespectingMotion(solutionWorkspace, { block: "start" });
```

Use the same helper for any P2 map/history navigation that currently forces smooth scrolling.

- [ ] **Step 5: Run tests/typecheck and commit**

```bash
npm test -- src/ui/motion.test.ts
npm run typecheck
```

```bash
git add src/ui/motion.ts src/ui/motion.test.ts src/study/app.ts
git commit -m "feat: add accessible motion helpers"
```

---

### Task 2: Add view, result, progress, and map transition states

**Files:**
- Modify: `src/study/app.ts`
- Modify: `src/mindmap/ui.ts`
- Modify: `src/progress/ui.ts`
- Modify: `src/ux.css`

**Interfaces:**
- Consumes: P2 view containers, map nodes, progress elements, `enterOnce()`.
- Produces: one-shot CSS states `view-enter`, `result-enter`, `step-enter`, `progress-updated`, `mindmap-node-updated`.

- [ ] **Step 1: Add explicit view transition hook**

In the P2 view-switch function, after the selected view becomes visible:

```ts
selected.classList.remove("view-enter");
if (!prefersReducedMotion()) {
  void selected.offsetWidth;
  selected.classList.add("view-enter");
}
```

Focus behavior must remain independent of this class.

- [ ] **Step 2: Mark newly rendered solution content**

After `renderResult(result)` and after each newly revealed learning step, call:

```ts
enterOnce(resultContent, "result-enter");
for (const step of learningSteps.querySelectorAll<HTMLElement>(".learning-step")) {
  if (!step.dataset.animated) {
    step.dataset.animated = "true";
    enterOnce(step, "step-enter");
  }
}
```

The `data-animated` flag prevents old steps from repeatedly animating when the state re-renders.

- [ ] **Step 3: Highlight only changed progress/map states**

In `progress/ui.ts` and `mindmap/ui.ts`, retain the previous rendered numeric/state snapshot in module-local memory. When a progress percentage or topic state changes, add a one-shot class only to the changed element:

```ts
if (previousState && previousState !== node.state) {
  enterOnce(button, "mindmap-node-updated");
}
```

Do not animate unchanged nodes on every `motor-history-updated` event.

- [ ] **Step 4: Add timing tokens and keyframes to `src/ux.css`**

At `:root` add:

```css
--motion-fast: 150ms;
--motion-panel: 220ms;
--motion-highlight: 480ms;
--motion-ease: cubic-bezier(.2, .8, .2, 1);
```

Add one-shot transitions/keyframes:

```css
.view-enter,
.result-enter {
  animation: ui-rise var(--motion-panel) var(--motion-ease) both;
}

.step-enter {
  animation: ui-rise var(--motion-panel) var(--motion-ease) both;
}

.mindmap-node-updated,
.progress-updated {
  animation: ui-emphasis var(--motion-highlight) var(--motion-ease) both;
}

@keyframes ui-rise {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes ui-emphasis {
  0% { transform: scale(1); }
  45% { transform: scale(1.025); }
  100% { transform: scale(1); }
}
```

No looping animations.

- [ ] **Step 5: Run tests and commit**

```bash
npm test
npm run typecheck
npm run build
```

```bash
git add src/study/app.ts src/mindmap/ui.ts src/progress/ui.ts src/ux.css
git commit -m "feat: animate study state transitions"
```

---

### Task 3: Polish interactive states, hierarchy, loading, and focus

**Files:**
- Modify: `src/study/shell.ts`
- Modify: `src/history/ui.ts`
- Modify: `src/mindmap/ui.ts`
- Modify: `src/progress/ui.ts`
- Modify: `src/ux.css`

**Interfaces:**
- Consumes: existing semantic buttons/cards and P2 state labels.
- Produces: consistent hover/pressed/focus-visible/disabled styling and stronger empty/loading/error presentation.

- [ ] **Step 1: Ensure status-bearing controls expose semantic state**

Progress bars use:

```html
<div class="progress-meter" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="64">
  <span class="progress-meter-fill" style="--progress:64%"></span>
</div>
```

Map nodes keep visible state text in the button itself; do not rely on color or icons only.

- [ ] **Step 2: Add consistent focus-visible treatment**

Add:

```css
:where(button, input, textarea, select, summary, [tabindex]):focus-visible {
  outline: 3px solid rgba(125, 211, 252, .95);
  outline-offset: 3px;
}
```

Do not globally remove native outlines before the replacement applies.

- [ ] **Step 3: Normalize interactive microstates**

Apply `transition` only to transform/background/border/box-shadow using `var(--motion-fast)`. Hover may lift cards/buttons by at most `2px`; `:active` returns to baseline. Disabled/loading buttons retain stable dimensions and have `cursor: progress` or `not-allowed` as appropriate.

Do not animate height for math/result content because KaTeX dimensions may change after render.

- [ ] **Step 4: Strengthen empty/error/loading visuals without changing copy semantics**

Style these existing states distinctly but quietly:

- `.empty-state`
- `.error`
- `.warnings`
- `.history-status`
- progress unavailable state
- no-history map guidance
- exam correct/incorrect/warning feedback

Maintain all existing text content that communicates the state.

- [ ] **Step 5: Verify tab order and commit**

Run:

```bash
npm run dev
```

Keyboard-check tabs → study controls → map nodes → topic CTAs → exam controls → history controls. Then:

```bash
npm run typecheck
npm run build
```

Commit:

```bash
git add src/study/shell.ts src/history/ui.ts src/mindmap/ui.ts src/progress/ui.ts src/ux.css
git commit -m "feat: polish interactive study states"
```

---

### Task 4: Implement reduced-motion coverage and final accessibility regression

**Files:**
- Modify: `src/ux.css`
- Modify only TypeScript files if verification exposes a reduced-motion dependency.

**Interfaces:**
- Consumes: all P3 motion classes.
- Produces: equivalent functionality with effectively instant motion under the user preference.

- [ ] **Step 1: Add the reduced-motion override**

At the end of `src/ux.css`:

```css
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }

  *,
  *::before,
  *::after {
    animation-duration: .001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .001ms !important;
    scroll-behavior: auto !important;
  }
}
```

No visibility, display, focus, or pointer-events behavior may depend on animation completion.

- [ ] **Step 2: Run the reduced-motion helper tests and full suite**

```bash
npm test -- src/ui/motion.test.ts
npm test
python -m unittest discover -s tests -p "test_*.py"
npm run typecheck
npm run build
```

Expected: all pass.

- [ ] **Step 3: Manually verify normal motion**

With reduced motion disabled, confirm:

- view switch fades/slides once;
- result and only newly revealed steps enter once;
- progress bar/state changes animate once;
- changed map node highlights once;
- exam feedback remains instantly readable while visual emphasis runs;
- controls stay clickable throughout animations.

- [ ] **Step 4: Manually verify reduced motion**

With OS/browser `prefers-reduced-motion: reduce`, confirm:

- view changes are effectively immediate;
- programmatic scrolling uses `auto`;
- result, exam, map, progress, and history state changes remain fully visible;
- focus is not lost after view changes;
- no content waits for `animationend` or `transitionend`.

- [ ] **Step 5: Commit only if fixes were required**

```bash
git add <only-files-changed-by-verification>
git commit -m "fix: harden reduced motion behavior"
```

If no fixes were required, do not create an empty commit.

---

### Task 5: Final P3 CI-equivalent verification

**Files:**
- Modify only files required by defects discovered during verification.

**Interfaces:**
- Consumes: complete P2+P3 branch.
- Produces: release-ready branch for PR review.

- [ ] **Step 1: Run exact project verification**

```bash
npm install --no-audit --no-fund
npm test
python -m unittest discover -s tests -p "test_*.py"
npm run typecheck
npm run build
```

Expected: all checks pass.

- [ ] **Step 2: Verify deployment scripts match CI syntax checks**

```powershell
[ScriptBlock]::Create((Get-Content -Raw 'scripts/provision.ps1')) | Out-Null
[ScriptBlock]::Create((Get-Content -Raw 'scripts/deploy.ps1')) | Out-Null
```

Expected: no syntax error; GitHub Actions is authoritative for Windows PowerShell 5.1.

- [ ] **Step 3: Visual regression sweep at three widths**

Check approximately 390px, 768px, and >=1180px widths. Verify no horizontal page overflow, no clipped KaTeX answer, map remains readable, progress cards wrap correctly, and sticky graph behavior remains unchanged on desktop.

- [ ] **Step 4: Functional regression sweep**

Verify: universal calculation, Learn/Solve toggle, graph, full function analysis, exam correction, history restore/delete/filters, mind-map practice, mind-map review filter, mission CTA, progress refresh after exam result, and offline/local-only messaging.

- [ ] **Step 5: Commit fixes if any, then push for CI**

```bash
git add <only-files-changed-by-verification>
git commit -m "fix: finalize P3 visual polish"
```

If no fixes were required, do not create an empty commit. Push `feat/p2-p3-learning-ux` and require the repository CI jobs `verify` and `windows-powershell-51` to succeed before merge.
