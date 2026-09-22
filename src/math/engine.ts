import kernelSource from "./kernel.py?raw";
import studyKernelSource from "./study_kernel.py?raw";

export type MathOperation =
  | "analyze"
  | "graph"
  | "roots"
  | "differentiate"
  | "integrate"
  | "limit"
  | "simplify"
  | "factor"
  | "expand"
  | "solve";

export interface RootResult {
  exact: string;
  latex: string;
  numeric: number;
}

export interface ResultDetail {
  label: string;
  latex: string;
  text: string;
}

export interface GraphOverlay {
  kind: "derivative" | "tangent";
  label: string;
  js: string;
}

export interface GraphPoint {
  kind: "critical" | "inflection";
  label: string;
  x: number;
  y: number;
}

export interface IntegralRegion {
  lower: number;
  upper: number;
}

export interface CalculationResult {
  operation: MathOperation;
  input_latex: string;
  result_latex: string;
  result_text: string;
  graph_js: string;
  roots: RootResult[];
  warnings: string[];
  details: ResultDetail[];
  steps: ResultDetail[];
  graph_overlays: GraphOverlay[];
  graph_points: GraphPoint[];
  integral_region: IntegralRegion | null;
}

export interface CalculationRequest {
  operation: MathOperation;
  expression: string;
  variable?: string;
  target?: string;
  direction?: "+" | "-" | "+-";
  lower?: string;
  upper?: string;
  derivativeOrder?: number;
  tangentPoint?: string;
}

interface PyodideRuntime {
  FS: {
    writeFile(path: string, data: Uint8Array): void;
  };
  runPython(code: string): unknown;
  runPythonAsync(code: string): Promise<unknown>;
  globals: {
    set(name: string, value: unknown): void;
    delete(name: string): void;
  };
}

interface PyodideModule {
  loadPyodide(options: { indexURL: string }): Promise<PyodideRuntime>;
}

const PYODIDE_BASE = "/pyodide/";
const WHEELS = [
  "/python-packages/mpmath-1.3.0-py3-none-any.whl",
  "/python-packages/sympy-1.14.0-py3-none-any.whl",
] as const;

let runtimePromise: Promise<PyodideRuntime> | undefined;

function pythonString(value: string): string {
  return JSON.stringify(value);
}

async function installPurePythonWheel(runtime: PyodideRuntime, url: string): Promise<void> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Falha ao carregar pacote matemático local: ${response.status}`);
  }

  const filename = url.split("/").at(-1);
  if (!filename) {
    throw new Error("Nome de pacote matemático inválido.");
  }

  const wheelPath = `/tmp/${filename}`;
  runtime.FS.writeFile(wheelPath, new Uint8Array(await response.arrayBuffer()));
  await runtime.runPythonAsync(`
import site
import zipfile
with zipfile.ZipFile(${pythonString(wheelPath)}) as archive:
    archive.extractall(site.getsitepackages()[0])
`);
}

async function createRuntime(): Promise<PyodideRuntime> {
  const modulePath = `${PYODIDE_BASE}pyodide.mjs`;
  const pyodideModule = (await import(/* @vite-ignore */ modulePath)) as PyodideModule;
  const runtime = await pyodideModule.loadPyodide({ indexURL: PYODIDE_BASE });

  for (const wheel of WHEELS) {
    await installPurePythonWheel(runtime, wheel);
  }

  await runtime.runPythonAsync(kernelSource);
  await runtime.runPythonAsync(studyKernelSource);
  return runtime;
}

export function initializeMathEngine(): Promise<void> {
  runtimePromise ??= createRuntime();
  return runtimePromise.then(() => undefined);
}

async function runtime(): Promise<PyodideRuntime> {
  runtimePromise ??= createRuntime();
  return runtimePromise;
}

export async function calculate(request: CalculationRequest): Promise<CalculationResult> {
  const activeRuntime = await runtime();

  activeRuntime.globals.set("_op", request.operation);
  activeRuntime.globals.set("_expr", request.expression);
  activeRuntime.globals.set("_var", request.variable ?? "x");
  activeRuntime.globals.set("_target", request.target ?? "0");
  activeRuntime.globals.set("_direction", request.direction ?? "+-");
  activeRuntime.globals.set("_lower", request.lower ?? "");
  activeRuntime.globals.set("_upper", request.upper ?? "");
  activeRuntime.globals.set("_derivative_order", request.derivativeOrder ?? 1);
  activeRuntime.globals.set("_tangent_point", request.tangentPoint ?? "");

  try {
    const raw = await activeRuntime.runPythonAsync(
      "calculate_json(_op, _expr, _var, _target, _direction, _lower, _upper, _derivative_order, _tangent_point)",
    );
    return JSON.parse(String(raw)) as CalculationResult;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const cleaned = message.split("ValueError:").at(-1)?.trim() ?? message;
    throw new Error(cleaned);
  } finally {
    for (const name of [
      "_op",
      "_expr",
      "_var",
      "_target",
      "_direction",
      "_lower",
      "_upper",
      "_derivative_order",
      "_tangent_point",
    ]) {
      activeRuntime.globals.delete(name);
    }
  }
}

export async function checkEquivalent(
  expected: string,
  answer: string,
  variable = "x",
): Promise<boolean> {
  const activeRuntime = await runtime();
  activeRuntime.globals.set("_expected", expected);
  activeRuntime.globals.set("_answer", answer);
  activeRuntime.globals.set("_answer_var", variable);

  try {
    const raw = await activeRuntime.runPythonAsync(
      "json.dumps(bool(answers_equivalent(_expected, _answer, _answer_var)))",
    );
    return JSON.parse(String(raw)) as boolean;
  } catch {
    return false;
  } finally {
    for (const name of ["_expected", "_answer", "_answer_var"]) {
      activeRuntime.globals.delete(name);
    }
  }
}
