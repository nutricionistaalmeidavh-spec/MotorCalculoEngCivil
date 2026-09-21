import JXG from "jsxgraph";
import "jsxgraph/distrib/jsxgraph.css";
import type { RootResult } from "../math/engine";

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

export function plotFunction(jsExpression: string, roots: RootResult[]): void {
  const activeBoard = ensureBoard();
  clearPlot();

  if (!jsExpression) {
    activeBoard.update();
    return;
  }

  const evaluator = new Function(
    "x",
    `"use strict"; const value = (${jsExpression}); return Number.isFinite(value) ? value : NaN;`,
  ) as (x: number) => number;

  const curve = activeBoard.create("functiongraph", [
    (x: number) => {
      try {
        return evaluator(x);
      } catch {
        return Number.NaN;
      }
    },
  ]);
  plottedObjects.push(curve);

  for (const root of roots.slice(0, 12)) {
    const point = activeBoard.create("point", [root.numeric, 0], {
      name: root.exact,
      fixed: true,
      size: 3,
    });
    plottedObjects.push(point);
  }

  activeBoard.update();
}

export function initializeGraph(): void {
  ensureBoard();
}
