import JXG from "jsxgraph";
import type { CalculationResult, GraphOverlay, GraphPoint, RootResult } from "../math/engine";

let board: any;
let plottedObjects: any[] = [];

function ensureBoard(): any {
  if (board) return board;

  board = JXG.JSXGraph.initBoard("graph", {
    boundingbox: [-10, 10, 10, -10],
    axis: true,
    grid: true,
    keepaspectratio: false,
    showNavigation: true,
    showCopyright: false,
    pan: { enabled: true, needTwoFingers: false },
    zoom: { enabled: true, wheel: true, pinch: true, needShift: false },
  } as any);

  return board;
}

function clearPlot(): void {
  if (!board || plottedObjects.length === 0) return;
  board.removeObject(plottedObjects);
  plottedObjects = [];
}

function createEvaluator(jsExpression: string): (x: number) => number {
  return new Function(
    "x",
    `"use strict"; const value = (${jsExpression}); return Number.isFinite(value) ? value : NaN;`,
  ) as (x: number) => number;
}

function safeEvaluate(evaluator: (x: number) => number, x: number): number {
  try {
    return evaluator(x);
  } catch {
    return Number.NaN;
  }
}

function addFunctionGraph(
  activeBoard: any,
  jsExpression: string,
  attributes: Record<string, unknown> = {},
): { curve: any; evaluator: (x: number) => number } {
  const evaluator = createEvaluator(jsExpression);
  const curve = activeBoard.create(
    "functiongraph",
    [(x: number) => safeEvaluate(evaluator, x)],
    attributes,
  );
  plottedObjects.push(curve);
  return { curve, evaluator };
}

function addRoots(activeBoard: any, roots: RootResult[]): void {
  for (const root of roots.slice(0, 12)) {
    const point = activeBoard.create("point", [root.numeric, 0], {
      name: root.exact,
      fixed: true,
      size: 3,
    });
    plottedObjects.push(point);
  }
}

function addGraphPoints(activeBoard: any, points: GraphPoint[]): void {
  for (const graphPoint of points.slice(0, 16)) {
    const point = activeBoard.create("point", [graphPoint.x, graphPoint.y], {
      name: graphPoint.label,
      fixed: true,
      size: graphPoint.kind === "critical" ? 4 : 3,
      face: graphPoint.kind === "critical" ? "o" : "[]",
    });
    plottedObjects.push(point);
  }
}

function addOverlay(activeBoard: any, overlay: GraphOverlay): void {
  const attributes =
    overlay.kind === "derivative"
      ? { dash: 2, strokeWidth: 2 }
      : { dash: 1, strokeWidth: 2 };

  addFunctionGraph(activeBoard, overlay.js, attributes);
}

function addIntegralRegion(
  activeBoard: any,
  evaluator: (x: number) => number,
  lower: number,
  upper: number,
): void {
  if (!Number.isFinite(lower) || !Number.isFinite(upper) || lower === upper) return;

  const samples = 72;
  const xs: number[] = [lower];
  const ys: number[] = [0];
  let valid = true;

  for (let index = 0; index <= samples; index += 1) {
    const x = lower + ((upper - lower) * index) / samples;
    const y = safeEvaluate(evaluator, x);
    if (!Number.isFinite(y)) {
      valid = false;
      break;
    }
    xs.push(x);
    ys.push(y);
  }

  if (!valid) return;

  xs.push(upper);
  ys.push(0);

  const region = activeBoard.create("curve", [xs, ys], {
    strokeOpacity: 0,
    fillOpacity: 0.18,
    fixed: true,
    highlight: false,
  });
  plottedObjects.push(region);
}

export function plotCalculation(result: CalculationResult): void {
  const activeBoard = ensureBoard();
  clearPlot();

  if (!result.graph_js) {
    activeBoard.update();
    return;
  }

  activeBoard.suspendUpdate();
  try {
    const { evaluator } = addFunctionGraph(activeBoard, result.graph_js, {
      strokeWidth: 2.5,
    });

    if (result.integral_region) {
      addIntegralRegion(
        activeBoard,
        evaluator,
        result.integral_region.lower,
        result.integral_region.upper,
      );
    }

    for (const overlay of result.graph_overlays) {
      addOverlay(activeBoard, overlay);
    }

    addRoots(activeBoard, result.roots);
    addGraphPoints(activeBoard, result.graph_points ?? []);
  } finally {
    activeBoard.unsuspendUpdate();
  }
}

export function initializeGraph(): void {
  ensureBoard();
}
