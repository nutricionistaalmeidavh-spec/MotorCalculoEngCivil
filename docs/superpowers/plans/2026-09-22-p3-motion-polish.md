# P3 Motion and Visual Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add accessible, non-blocking motion and visual polish across study, mind map, progress, history, and exam flows without changing mathematical behavior or adding runtime dependencies.

**Architecture:** Implement P3 as a presentation layer on top of the completed P2 DOM structure. Centralize timing/state classes in CSS and use minimal TypeScript helpers only to mark one-shot view/result/progress/map/exam transitions; preserve functional controllers and make reduced motion a first-class behavior.

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

- [ ] **Step 3: Implement minimal helpers**

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

In `src/history/ui.ts`, replace both smooth-scroll calls used by restore/topic filtering with `scrollIntoViewRespectingMotion(...)`.

- [ ] **Step 5: Run checks and commit**

```bash
npm test -- src/ui/motion.test.ts
npm run typecheck
git add src/ui/motion.ts src/ui/motion.test.ts src/study/app.ts src/history/ui.ts
git commit -m "feat: add accessible motion helpers"
```

Expected: PASS.

---

### Task 2: Add one-shot view/result/map/progress/exam transitions

**Files:**
- Modify: `src/study/app.ts`
- Modify: `src/study/exam-controller.ts`
- Modify: `src/mindmap/ui.ts`
- Modify: `src/progress/ui.ts`
- Modify: `src/ux.css`

**Interfaces:**
- Consumes: P2 view containers, result steps, map nodes/detail panel, progress meter, exam feedback, `enterOnce()`.
- Produces: `view-enter`, `result-enter`, `step-enter`, `progress-updated`, `mindmap-node-updated`, `mindmap-detail-enter`, `exam-feedback-updated`.

- [ ] **Step 1: Animate a selected view only after visibility state is correct**

In the P2 view-switch function:

```ts
for (const [name, element] of Object.entries(views)) {
  element.hidden = name !== selectedView;
}
const selected = views[selectedView];
enterOnce(selected, "view-enter");
```

Focus changes happen after visibility is set and do not depend on the animation class.

- [ ] **Step 2: Animate result and only newly revealed learning steps**

After `renderResult(result)`:

```ts
enterOnce(resultContent, "result-enter");
```

When steps are rendered:

```ts
for (const step of learningSteps.querySelectorAll<HTMLElement>(".learning-step")) {
  if (step.dataset.animated === "true") continue;
  step.dataset.animated = "true";
  enterOnce(step, "step-enter");
}
```

Preserve the marker for already-visible steps so Learn/Solve toggles do not replay the whole stack.

- [ ] **Step 3: Animate only actual progress and map-state changes**

In `src/progress/ui.ts`, retain previous overall percent:

```ts
if (previousOverallPercent !== null && previousOverallPercent !== progress.overallPercent) {
  enterOnce(progressMeter, "progress-updated");
}
previousOverallPercent = progress.overallPercent;
```

In `src/mindmap/ui.ts`, retain previous topic states:

```ts
const previousState = previousStates.get(node.id);
if (previousState && previousState !== node.state) {
  enterOnce(button, "mindmap-node-updated");
}
previousStates.set(node.id, node.state);
```

Unchanged nodes must not replay highlight animation on history refresh.

- [ ] **Step 4: Animate topic-detail opening without blocking controls**

At the end of the map node selection/render routine:

```ts
enterOnce(detail, "mindmap-detail-enter");
```

Buttons inside the detail panel are inserted and clickable before this call. Do not use `pointer-events: none` during the animation.

- [ ] **Step 5: Animate exam correction feedback after text/class are updated**

In `src/study/exam-controller.ts`, after setting `feedback.textContent` and `feedback.className`:

```ts
enterOnce(feedback, "exam-feedback-updated");
```

Correct/incorrect meaning remains in text and border/state classes; animation is supplemental.

- [ ] **Step 6: Add timing tokens and one-shot keyframes**

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
.step-enter,
.mindmap-detail-enter,
.exam-feedback-updated {
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

- [ ] **Step 7: Verify rapid switching and unchanged refreshes**

```bash
npm run dev
```

Rapidly switch `Estudar → Mapa Mental → Modo Prova → Estudar`; confirm exactly one view is visible/focusable. Trigger a history refresh without state change; confirm unchanged nodes do not re-highlight. Correct an exam question; confirm feedback text appears immediately and its short entrance animation does not prevent `Próxima questão`.

- [ ] **Step 8: Run checks and commit**

```bash
npm test
npm run typecheck
npm run build
git add src/study/app.ts src/study/exam-controller.ts src/mindmap/ui.ts src/progress/ui.ts src/ux.css
git commit -m "feat: animate study state transitions"
```

Expected: PASS.

---

### Task 3: Polish hierarchy, progress growth, focus, and microstates

**Files:**
- Modify: `src/study/shell.ts`
- Modify: `src/history/ui.ts`
- Modify: `src/mindmap/ui.ts`
- Modify: `src/progress/ui.ts`
- Modify: `src/ux.css`

**Interfaces:**
- Consumes: semantic controls/cards and P2 state labels.
- Produces: semantic progressbar, transform-based progress growth, consistent focus-visible/hover/pressed/disabled/loading states, stronger empty/error presentation.

- [ ] **Step 1: Render semantic progress with transform-based growth**

`src/progress/ui.ts` sets:

```ts
const fraction = progress.overallPercent / 100;
progressMeter.setAttribute("aria-valuemin", "0");
progressMeter.setAttribute("aria-valuemax", "100");
progressMeter.setAttribute("aria-valuenow", String(progress.overallPercent));
progressFill.style.setProperty("--progress-scale", String(fraction));
progressValue.textContent = `${progress.overallPercent}%`;
```

CSS:

```css
.progress-meter-fill {
  transform: scaleX(var(--progress-scale, 0));
  transform-origin: left center;
  transition: transform var(--motion-panel) var(--motion-ease);
}
```

The visible percentage remains alongside the meter.

- [ ] **Step 2: Add consistent focus-visible treatment**

```css
:where(button, input, textarea, select, summary, [tabindex]):focus-visible {
  outline: 3px solid rgba(125, 211, 252, .95);
  outline-offset: 3px;
}
```

Do not remove native outlines unless the replacement applies.

- [ ] **Step 3: Normalize microinteractions**

Use `transition` only for transform/background/border-color/box-shadow using `var(--motion-fast)`. Hover may lift interactive cards/buttons by at most `2px`; `:active` returns to baseline. Disabled controls retain dimensions and use `cursor: not-allowed`; the calculation loading state uses `cursor: progress`. Do not animate height for KaTeX/result containers.

- [ ] **Step 4: Strengthen empty/error/loading visuals without changing meaning**

Style these states distinctly while preserving text semantics:

- `.empty-state`
- `.error`
- `.warnings`
- `.history-status`
- progress unavailable state
- no-history map guidance
- `.feedback-correct`
- `.feedback-incorrect`
- `.feedback-warning`

Map states continue to display textual `Não iniciado`, `Em estudo`, `Revisar`, or `Dominado`; color remains supplemental.

- [ ] **Step 5: Verify loading stability and keyboard order**

```bash
npm run dev
```

Start a calculation and confirm the calculate button keeps width/height while loading. Keyboard-check tabs → study controls → map nodes → topic CTAs → exam controls → history controls; visible focus must remain present.

- [ ] **Step 6: Run checks and commit**

```bash
npm test
npm run typecheck
npm run build
git add src/study/shell.ts src/history/ui.ts src/mindmap/ui.ts src/progress/ui.ts src/ux.css
git commit -m "feat: polish interactive study states"
```

Expected: PASS.

---

### Task 4: Implement reduced-motion coverage and accessibility regression

**Files:**
- Modify: `src/ux.css`
- Modify only tracked TypeScript files if verification exposes a reduced-motion dependency.

**Interfaces:**
- Consumes: all P3 motion classes and `scrollIntoViewRespectingMotion()`.
- Produces: equivalent functionality with effectively instant motion under the user preference.

- [ ] **Step 1: Add reduced-motion override**

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

- [ ] **Step 3: Verify normal motion**

With reduced motion disabled, confirm: view switch animates once; result/new steps animate once; progress grows to its current value; only changed map nodes highlight; topic panel enters once; exam feedback is readable immediately; controls stay clickable throughout.

- [ ] **Step 4: Verify reduced motion**

With `prefers-reduced-motion: reduce`, confirm: view changes are immediate; programmatic scrolling uses `auto`; progress jumps to the value without delay; result/exam/map/history updates remain fully visible; focus is not lost; no behavior waits for animation completion.

- [ ] **Step 5: Commit only verification fixes**

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

Expected: all PASS.

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
