import katex from "katex";
import "katex/dist/katex.min.css";
import "./styles.css";
import { initializeGraph, plotFunction } from "./graph/graph";
import {
  calculate,
  initializeMathEngine,
  type CalculationRequest,
  type MathOperation,
} from "./math/engine";
import { normalizeMathInput } from "./math/normalize";

const ACTIONS: Array<{ operation: MathOperation; label: string }> = [
  { operation: "graph", label: "Gráfico" },
  { operation: "roots", label: "Raízes" },
  { operation: "differentiate", label: "Derivar" },
  { operation: "integrate", label: "Integrar" },
  { operation: "limit", label: "Limite" },
  { operation: "simplify", label: "Simplificar" },
  { operation: "factor", label: "Fatorar" },
  { operation: "expand", label: "Expandir" },
  { operation: "solve", label: "Resolver" },
];

const app = document.querySelector<HTMLDivElement>("#app");
if (!app) throw new Error("Elemento #app não encontrado.");

app.innerHTML = `
  <main class="shell">
    <header class="hero">
      <div>
        <p class="eyebrow">Engenharia Civil · Cálculo 1</p>
        <h1>Motor de Cálculo</h1>
        <p class="subtitle">Cálculo simbólico com SymPy e gráfico interativo, direto no navegador.</p>
      </div>
      <div id="engine-status" class="status" role="status" aria-live="polite">Carregando motor matemático…</div>
    </header>

    <section class="card input-card" aria-labelledby="expression-title">
      <div class="section-heading">
        <div>
          <p class="step">01</p>
          <h2 id="expression-title">Digite a expressão</h2>
        </div>
        <label class="variable-field">Variável
          <input id="variable" value="x" maxlength="1" inputmode="text" aria-label="Variável principal" />
        </label>
      </div>

      <label class="sr-only" for="expression">Expressão matemática</label>
      <textarea id="expression" rows="2" spellcheck="false" autocomplete="off">x² - 4x + 3</textarea>
      <p class="hint">Aceita exemplos como <code>sen(x)</code>, <code>x²</code>, <code>sqrt(x)</code>, <code>f(x)=...</code> e equações com <code>=</code>.</p>

      <div class="examples" aria-label="Exemplos rápidos">
        <button type="button" class="example" data-expression="x² - 4x + 3">Quadrática</button>
        <button type="button" class="example" data-expression="(x² - 4)/(x - 2)">Limite clássico</button>
        <button type="button" class="example" data-expression="x³ - 6x² + 9x">Cúbica</button>
        <button type="button" class="example" data-expression="sin(x)/x">Trigonométrica</button>
      </div>

      <div id="parameter-panel" class="parameter-panel" hidden>
        <label id="limit-target-field">Tende a
          <input id="limit-target" value="0" placeholder="0, 2, oo, -oo" />
        </label>
        <label id="limit-direction-field">Direção
          <select id="limit-direction">
            <option value="+-">Dos dois lados</option>
            <option value="-">Pela esquerda</option>
            <option value="+">Pela direita</option>
          </select>
        </label>
        <label id="lower-field">De
          <input id="lower-bound" placeholder="opcional" />
        </label>
        <label id="upper-field">Até
          <input id="upper-bound" placeholder="opcional" />
        </label>
      </div>

      <div class="actions" aria-label="Operações matemáticas">
        ${ACTIONS.map(
          ({ operation, label }) => `<button type="button" class="action" data-operation="${operation}">${label}</button>`,
        ).join("")}
      </div>
    </section>

    <div class="workspace">
      <section class="card result-card" aria-labelledby="result-title">
        <div class="section-heading compact">
          <div><p class="step">02</p><h2 id="result-title">Resultado</h2></div>
        </div>
        <div id="result-empty" class="empty-state">Escolha uma operação para calcular.</div>
        <div id="result-content" hidden>
          <p class="result-label">Entrada</p>
          <div id="input-math" class="math-output"></div>
          <p class="result-label">Resultado</p>
          <div id="result-math" class="math-output result-primary"></div>
          <pre id="result-text" class="result-text"></pre>
          <div id="warnings" class="warnings" hidden></div>
        </div>
        <div id="error" class="error" role="alert" hidden></div>
      </section>

      <section class="card graph-card" aria-labelledby="graph-title">
        <div class="section-heading compact">
          <div><p class="step">03</p><h2 id="graph-title">Gráfico interativo</h2></div>
          <span class="touch-hint">arraste · pinça para zoom</span>
        </div>
        <div id="graph" class="jxgbox" aria-label="Gráfico cartesiano interativo"></div>
      </section>
    </div>
  </main>
`;

const expressionInput = mustGet<HTMLTextAreaElement>("expression");
const variableInput = mustGet<HTMLInputElement>("variable");
const statusEl = mustGet<HTMLDivElement>("engine-status");
const resultEmpty = mustGet<HTMLDivElement>("result-empty");
const resultContent = mustGet<HTMLDivElement>("result-content");
const inputMath = mustGet<HTMLDivElement>("input-math");
const resultMath = mustGet<HTMLDivElement>("result-math");
const resultText = mustGet<HTMLPreElement>("result-text");
const warnings = mustGet<HTMLDivElement>("warnings");
const errorEl = mustGet<HTMLDivElement>("error");
const parameterPanel = mustGet<HTMLDivElement>("parameter-panel");
const limitTargetField = mustGet<HTMLElement>("limit-target-field");
const limitDirectionField = mustGet<HTMLElement>("limit-direction-field");
const lowerField = mustGet<HTMLElement>("lower-field");
const upperField = mustGet<HTMLElement>("upper-field");
const limitTarget = mustGet<HTMLInputElement>("limit-target");
const limitDirection = mustGet<HTMLSelectElement>("limit-direction");
const lowerBound = mustGet<HTMLInputElement>("lower-bound");
const upperBound = mustGet<HTMLInputElement>("upper-bound");

initializeGraph();
void bootEngine();

for (const button of document.querySelectorAll<HTMLButtonElement>(".example")) {
  button.addEventListener("click", () => {
    expressionInput.value = button.dataset.expression ?? "";
    expressionInput.focus();
  });
}

for (const button of document.querySelectorAll<HTMLButtonElement>(".action")) {
  button.addEventListener("click", async () => {
    const operation = button.dataset.operation as MathOperation;
    configureParameters(operation);
    await runCalculation(operation, button);
  });
}

function mustGet<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Elemento #${id} não encontrado.`);
  return element as T;
}

async function bootEngine(): Promise<void> {
  try {
    await initializeMathEngine();
    statusEl.textContent = "SymPy pronto · processamento local";
    statusEl.classList.add("ready");
  } catch (error) {
    statusEl.textContent = "Falha ao carregar o motor matemático";
    statusEl.classList.add("failed");
    showError(error);
  }
}

function configureParameters(operation: MathOperation): void {
  const isLimit = operation === "limit";
  const isIntegral = operation === "integrate";
  parameterPanel.hidden = !(isLimit || isIntegral);
  limitTargetField.hidden = !isLimit;
  limitDirectionField.hidden = !isLimit;
  lowerField.hidden = !isIntegral;
  upperField.hidden = !isIntegral;
}

async function runCalculation(operation: MathOperation, button: HTMLButtonElement): Promise<void> {
  const expression = normalizeMathInput(expressionInput.value);
  if (!expression) {
    showError(new Error("Digite uma expressão antes de calcular."));
    return;
  }

  clearError();
  setBusy(true, button);

  const request: CalculationRequest = {
    operation,
    expression,
    variable: variableInput.value.trim() || "x",
  };

  if (operation === "limit") {
    request.target = normalizeMathInput(limitTarget.value);
    request.direction = limitDirection.value as "+" | "-" | "+-";
  }

  if (operation === "integrate") {
    request.lower = normalizeMathInput(lowerBound.value);
    request.upper = normalizeMathInput(upperBound.value);
  }

  try {
    const result = await calculate(request);
    resultEmpty.hidden = true;
    resultContent.hidden = false;

    renderMath(inputMath, result.input_latex);
    renderMath(resultMath, result.result_latex || "\\text{sem resultado}");
    resultText.textContent = result.result_text;

    warnings.hidden = result.warnings.length === 0;
    warnings.textContent = result.warnings.join(" ");

    plotFunction(result.graph_js, result.roots);
  } catch (error) {
    showError(error);
  } finally {
    setBusy(false, button);
  }
}

function renderMath(target: HTMLElement, latex: string): void {
  katex.render(latex, target, {
    throwOnError: false,
    displayMode: true,
    strict: "warn",
  });
}

function setBusy(busy: boolean, activeButton: HTMLButtonElement): void {
  for (const button of document.querySelectorAll<HTMLButtonElement>(".action")) {
    button.disabled = busy;
  }
  activeButton.classList.toggle("loading", busy);
  if (busy) activeButton.setAttribute("aria-busy", "true");
  else activeButton.removeAttribute("aria-busy");
}

function showError(error: unknown): void {
  const message = error instanceof Error ? error.message : String(error);
  errorEl.textContent = message;
  errorEl.hidden = false;
}

function clearError(): void {
  errorEl.hidden = true;
  errorEl.textContent = "";
}
