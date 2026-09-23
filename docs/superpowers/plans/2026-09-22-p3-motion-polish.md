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
- Re-rendering progress/map after `motor-history-updated` must not restart unchanged animation.
- Disabled/loading controls must remain legible and not shift layout while state changes.
- Programmatic smooth scrolling must be skipped when reduced motion is requested.

---

### Task 1: Create reusable motion helpers and remove forced smooth scrolling

**Files:**
- Create: `src/ui/motion.ts`
- Create: `src/ui/motion.test.ts`
- Modify: `src/study/app.ts`
- Modify: `src/history/ui.ts`

**Interfaces:**
- Consumes: `window.matchMedia`, target `Element`s.
- Produces: `motionBehavior(reduced)`, `prefersReducedMotion()`, `enterOnce(element, className?)`, `scrollIntoViewRespectingMotion(element, options?)`.

- [ ] **Step 1: Write failing helper tests**

Create `src/ui/motion.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { motionBehavior } from "./motion";

describe("motionBehavior", () => {
  it("uses auto scrolling when reduced motion is requested", () => {
    expect(motionBehavior(true)).toBe("auto");
    expect(motionBehavior(false)).toBe("smooth");
  });
});
```

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

Do not use timers, `animationend`, or `transitionend` for correctness.

- [ ] **Step 4: Replace every known forced smooth scroll**

In `src/study/app.ts`, replace solution scrolling with:

```ts
const solutionWorkspace = document.querySelector(".solution-workspace");
if (solutionWorkspace) scrollIntoViewRespectingMotion(solutionWorkspace, { block: "start" });
```

In `src/history/ui.ts`, replace the two `scrollIntoView({ behavior: "smooth", ... })` calls used by history restore/topic filtering with `scrollIntoViewRespectingMotion(...)`.

- [ ] **Step 5: Run tests/typecheck and commit**

```bash
npm test -- src/ui/motion.test.ts
npm run typecheck
```

Expected: PASS.

```bash
git add src/ui/motion.ts src/ui/motion.test.ts src/study/app.ts src/history/ui.ts
git commit -m "feat: add accessible motion helpers"
```

---

### Task 2: Add one-shot view, result, progress, and map transitions

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
enterOnce(selected, "view-enter");
```

Visibility and focus changes happen before this call and do not depend on the animation class.

- [ ] **Step 2: Animate new result content and only newly revealed steps**

After `renderResult(result)`:

```ts
enterOnce(resultContent, "result-enter");
```

When steps render, mark only first-time nodes:

```ts
for (const step of learningSteps.querySelectorAll<HTMLElement>(".learning-step")) {
  if (step.dataset.animated === "true") continue;
  step.dataset.animated = "true";
  enterOnce(step, "step-enter");
}
```

Preserve `data-animated` on already rendered/reused nodes so changing study mode does not replay every old step.

- [ ] **Step 3: Highlight only actual progress/map changes**

In `src/progress/ui.ts`, store the previous overall percentage. After rendering a new value:

```ts
if (previousOverallPercent !== null && previousOverallPercent !== progress.overallPercent) {
  enterOnce(progressMeter, "progress-updated");
}
previousOverallPercent = progress.overallPercent;
```

In `src/mindmap/ui.ts`, keep `Map<TopicId, TopicState>` from the previous refresh. For each node:

```ts
const previousState = previousStates.get(node.id);
if (previousState && previousState !== node.state) {
  enterOnce(button, "mindmap-node-updated");
}
previousStates.set(node.id, node.state);
```

Unchanged nodes must not animate on `motor-history-updated`.

- [ ] **Step 4: Add timing tokens and keyframes**

At `:root` in `src/ux.css`:

```css
--motion-fast: 150ms;
--motion-panel: 220ms;
--motion-highlight: 480ms;
--motion-ease: cubic-bezier(.2, .8, .2, 1);
```

Add:

```css
.view-enter,
.result-enter,
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

- [ ] **Step 5: Verify rapid view switching and unchanged refreshes**

Run:

```bash
npm run dev
```

Rapidly switch `Estudar → Mapa Mental → Modo Prova → Estudar`. Confirm exactly one view is visible and focusable. Trigger a history refresh that does not change topic states and confirm map nodes do not replay highlight animation.

- [ ] **Step 6: Run tests and commit**

```bash
npm test
npm run typecheck
npm run build
```

Expected: PASS.

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

- [ ] **Step 1: Ensure progress status is semantic and textual**

Render the overall meter as:

```html
<div class="progress-meter" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="64">
  <span class="progress-meter-fill" style="--progress:64%"></span>
</div>
<span class="progress-value">64%</span>
```

The actual implementation uses the calculated value, not a hard-coded `64`. Map nodes retain visible state text inside each button.

- [ ] **Step 2: Add consistent focus-visible treatment**

In `src/ux.css`:

```css
:where(button, input, textarea, select, summary, [tabindex]):focus-visible {
  outline: 3px solid rgba(125, 211, 252, .95);
  outline-offset: 3px;
}
```

Do not remove native outlines unless this replacement applies.

- [ ] **Step 3: Normalize interactive microstates**

Apply transitions only to `transform`, `background`, `border-color`, and `box-shadow` using `var(--motion-fast)`. Hover may lift interactive cards/buttons by at most `2px`; `:active` returns to baseline. Disabled controls retain their dimensions and use `cursor: not-allowed`; the calculation loading state uses `cursor: progress`.

Do not animate height for KaTeX/result containers.

- [ ] **Step 4: Strengthen empty/error/loading visuals without changing meaning**

Style these states distinctly while preserving existing copy:

- `.empty-state`
- `.error`
- `.warnings`
- `.history-status`
- progress unavailable state
- no-history map guidance
- `.feedback-correct`
- `.feedback-incorrect`
- `.feedback-warning`

- [ ] **Step 5: Verify disabled/loading stability and keyboard order**

Run:

```bash
npm run dev
```

Start a calculation and confirm the calculate button does not change width/height when disabled/loading. Keyboard-check tabs → study controls → map nodes → topic CTAs → exam controls → history controls; visible focus must remain present.

- [ ] **Step 6: Run checks and commit**

```bash
npm test
npm run typecheck
npm run build
```

Expected: PASS.

```bash
git add src/study/shell.ts src/history/ui.ts src/mindmap/ui.ts src/progress/ui.ts src/ux.css
git commit -m "feat: polish interactive study states"
```

---

### Task 4: Implement reduced-motion coverage and accessibility regression

**Files:**
- Modify: `src/ux.css`
- Modify only tracked TypeScript files if verification exposes a reduced-motion dependency.

**Interfaces:**
- Consumes: all P3 motion classes and `scrollIntoViewRespectingMotion()`.
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

No visibility, display, focus, `pointer-events`, or state update may depend on animation completion.

- [ ] **Step 2: Run reduced-motion helper tests and full suite**

```bash
npm test -- src/ui/motion.test.ts
npm test
python -m unittest discover -s tests -p "test_*.py"
npm run typecheck
npm run build
```

Expected: PASS.

- [ ] **Step 3: Manually verify normal motion**

With reduced motion disabled, confirm: view switch animates once; result and newly revealed steps animate once; progress changes animate once; only changed map nodes highlight; exam feedback is readable immediately; controls stay clickable during animations.

- [ ] **Step 4: Manually verify reduced motion**

With `prefers-reduced-motion: reduce`, confirm: view changes are immediate; programmatic scrolling uses `auto`; result/exam/map/progress/history updates remain visible; focus is not lost; no behavior waits for animation completion.

- [ ] **Step 5: Commit only if verification required fixes**

If `git status --short` shows tracked fixes:

```bash
git add -u
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

Verify: universal calculation, Learn/Solve toggle, graph, full function analysis, exam correction, history restore/delete/filters, mind-map practice, mind-map review filter, mission CTA, progress refresh after exam result, and local/offline messaging.

- [ ] **Step 5: Commit fixes if any and push for CI**

If `git status --short` shows tracked fixes:

```bash
git add -u
git commit -m "fix: finalize P3 visual polish"
```

If no fixes were required, do not create an empty commit. Push `feat/p2-p3-learning-ux` and require repository CI jobs `verify` and `windows-powershell-51` to succeed before merge.
