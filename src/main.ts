import katex from "katex";
import "katex/dist/katex.min.css";
import "./styles.css";
import "./round2.css";
import { initializeGraph, plotCalculation } from "./graph/graph";
import {
  calculate,
  initializeMathEngine,
  type CalculationRequest,
  type CalculationResult,
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

const OPERATION_LABELS = Object.fromEntries(
  ACTIONS.map(({ operation, label }) => [operation, label]),
) as Record<MathOperation, string>;

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
      <p class="hint">
        Pode escrever como no caderno: <code>x²</code>, <code>√x</code>, <code>|x|</code>,
        <code>½x</code>, <code>sen(x)</code>, <code>π</code>, <code>e^x</code> ou <code>f(x)=...</code>.
      </p>

      <div class="examples" aria-label="Exemplos rápidos">
        <button type="button" class="example" data-operation="graph" data-expression="x² - 4x + 3">Quadrática</button>
        <button type="button" class="example" data-operation="limit" data-expression="(x² - 4)/(x - 2)" data-target="2">Limite clássico</button>
        <button type="button" class="example" data-operation="differentiate" data-expression="x³ - 6x² + 9x">Derivada</button>
        <button type="button" class="example" data-operation="integrate" data-expression="sen(x)" data-lower="0" data-upper="π">Integral 0 → π</button>
      </div>

      <p class="mode-label">Escolha a operação</p>
      <div class="actions" aria-label="Operações matemáticas">
        ${ACTIONS.map(
          ({ operation, label }, index) =>
            `<button type="button" class="action${index === 0 ? " active" : ""}" data-operation="${operation}" aria-pressed="${index === 0}">${label}</button>`,
        ).join("")}
      </div>

      <div id="parameter-panel" class="parameter-panel" hidden>
        <div id="limit-parameters" class="parameter-group" hidden>
          <label>Tende a
            <input id="limit-target" value="0" placeholder="0, 2, π, ∞, -∞" />
          </label>
          <label>Direção
            <select id="limit-direction">
              <option value="+-">Dos dois lados</option>
              <option value="-">Pela esquerda</option>
              <option value="+">Pela direita</option>
            </select>
          </label>
          <div class="parameter-presets span-full" aria-label="Atalhos para ponto do limite">
            <button type="button" class="preset limit-preset" data-target="0">x → 0</button>
            <button type="button" class="preset limit-preset" data-target="∞">x → ∞</button>
            <button type="button" class="preset limit-preset" data-target="-∞">x → -∞</button>
          </div>
        </div>

        <div id="derivative-parameters" class="parameter-group" hidden>
          <label>Ordem
            <select id="derivative-order">
              <option value="1">1ª derivada</option>
              <option value="2">2ª derivada</option>
              <option value="3">3ª derivada</option>
              <option value="4">4ª derivada</option>
              <option value="5">5ª derivada</option>
            </select>
          </label>
          <label>Ponto para reta tangente
            <input id="tangent-point" placeholder="opcional: 0, 2, π..." />
          </label>
          <p class="parameter-help span-full">Se informar um ponto, o sistema calcula e desenha a reta tangente à função original.</p>
        </div>

        <div id="integral-parameters" class="parameter-group" hidden>
          <label>Limite inferior
            <input id="lower-bound" placeholder="vazio = indefinida" />
          </label>
          <label>Limite superior
            <input id="upper-bound" placeholder="vazio = indefinida" />
          </label>
          <div class="parameter-presets span-full" aria-label="Atalhos para integral">
            <button type="button" class="preset integral-preset" data-lower="" data-upper="">Indefinida</button>
            <button type="button" class="preset integral-preset" data-lower="0" data-upper="1">0 → 1</button>
            <button type="button" class="preset integral-preset" data-lower="0" data-upper="π">0 → π</button>
          </div>
        </div>
      </div>

      <button id="calculate-button" type="button" class="calculate-button">Calcular gráfico</button>
      <p class="keyboard-hint">Atalho: Ctrl/⌘ + Enter</p>
    </section>

    <div class="workspace">
      <section class="card result-card" aria-labelledby="result-title">
        <div class="section-heading compact">
          <div><p class="step">02</p><h2 id="result-title">Resultado</h2></div>
        </div>
        <div id="result-empty" class="empty-state">Escolha uma operação e toque em Calcular.</div>
        <div id="result-content" hidden>
          <p class="result-label">Entrada</p>
          <div id="input-math" class="math-output"></div>
          <p class="result-label">Resultado</p>
          <div id="result-math" class="math-output result-primary"></div>
          <pre id="result-text" class="result-text"></pre>
          <div id="result-details" class="result-details" hidden></div>
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
        <div id="graph-legend" class="graph-legend" aria-live="polite"></div>
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
const resultDetails = mustGet<HTMLDivElement>("result-details");
const warnings = mustGet<HTMLDivElement>("warnings");
const errorEl = mustGet<HTMLDivElement>("error");
const parameterPanel = mustGet<HTMLDivElement>("parameter-panel");
const limitParameters = mustGet<HTMLDivElement>("limit-parameters");
const derivativeParameters = mustGet<HTMLDivElement>("derivative-parameters");
const integralParameters = mustGet<HTMLDivElement>("integral-parameters");
const limitTarget = mustGet<HTMLInputElement>("limit-target");
const limitDirection = mustGet<HTMLSelectElement>("limit-direction");
const derivativeOrder = mustGet<HTMLSelectElement>("derivative-order");
const tangentPoint = mustGet<HTMLInputElement>("tangent-point");
const lowerBound = mustGet<HTMLInputElement>("lower-bound");
const upperBound = mustGet<HTMLInputElement>("upper-bound");
const calculateButton = mustGet<HTMLButtonElement>("calculate-button");
const graphLegend = mustGet<HTMLDivElement>("graph-legend");

let selectedOperation: MathOperation = "graph";

initializeGraph();
configureParameters(selectedOperation);
void bootEngine();

for (const button of document.querySelectorAll<HTMLButtonElement>(".example")) {
  button.addEventListener("click", () => {
    expressionInput.value = button.dataset.expression ?? "";
    if (button.dataset.target !== undefined) limitTarget.value = button.dataset.target;
    if (button.dataset.lower !== undefined) lowerBound.value = button.dataset.lower;
    if (button.dataset.upper !== undefined) upperBound.value = button.dataset.upper;

    const operation = button.dataset.operation as MathOperation | undefined;
    if (operation) selectOperation(operation);
    expressionInput.focus();
  });
}

for (const button of document.querySelectorAll<HTMLButtonElement>(".action")) {
  button.addEventListener("click", () => {
    selectOperation(button.dataset.operation as MathOperation);
  });
}

for (const button of document.querySelectorAll<HTMLButtonElement>(".limit-preset")) {
  button.addEventListener("click", () => {
    limitTarget.value = button.dataset.target ?? "0";
  });
}

for (const button of document.querySelectorAll<HTMLButtonElement>(".integral-preset")) {
  button.addEventListener("click", () => {
    lowerBound.value = button.dataset.lower ?? "";
    upperBound.value = button.dataset.upper ?? "";
  });
}

calculateButton.addEventListener("click", () => {
  void runCalculation();
});

expressionInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
    event.preventDefault();
    void runCalculation();
  }
});

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

function selectOperation(operation: MathOperation): void {
  selectedOperation = operation;
  for (const button of document.querySelectorAll<HTMLButtonElement>(".action")) {
    const active = button.dataset.operation === operation;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  }
  configureParameters(operation);
  calculateButton.textContent = `Calcular ${OPERATION_LABELS[operation].toLowerCase()}`;
}

function configureParameters(operation: MathOperation): void {
  const showLimit = operation === "limit";
  const showDerivative = operation === "differentiate";
  const showIntegral = operation === "integrate";

  parameterPanel.hidden = !(showLimit || showDerivative || showIntegral);
  limitParameters.hidden = !showLimit;
  derivativeParameters.hidden = !showDerivative;
  integralParameters.hidden = !showIntegral;
}

async function runCalculation(): Promise<void> {
  const expression = normalizeMathInput(expressionInput.value);
  if (!expression) {
    showError(new Error("Digite uma expressão antes de calcular."));
    return;
  }

  clearError();
  setBusy(true);

  const request: CalculationRequest = {
    operation: selectedOperation,
    expression,
    variable: variableInput.value.trim() || "x",
  };

  if (selectedOperation === "limit") {
    request.target = normalizeMathInput(limitTarget.value);
    request.direction = limitDirection.value as "+" | "-" | "+-";
  }

  if (selectedOperation === "differentiate") {
    request.derivativeOrder = Number.parseInt(derivativeOrder.value, 10);
    request.tangentPoint = normalizeMathInput(tangentPoint.value);
  }

  if (selectedOperation === "integrate") {
    request.lower = normalizeMathInput(lowerBound.value);
    request.upper = normalizeMathInput(upperBound.value);
  }

  try {
    const result = await calculate(request);
    renderResult(result);
    plotCalculation(result);
    renderGraphLegend(result);
  } catch (error) {
    showError(error);
  } finally {
    setBusy(false);
  }
}

function renderResult(result: CalculationResult): void {
  resultEmpty.hidden = true;
  resultContent.hidden = false;

  renderMath(inputMath, result.input_latex);
  renderMath(resultMath, result.result_latex || "\\text{sem resultado}");
  resultText.textContent = result.result_text;

  resultDetails.replaceChildren();
  for (const detail of result.details) {
    const card = document.createElement("div");
    card.className = "detail-card";

    const label = document.createElement("p");
    label.className = "detail-label";
    label.textContent = detail.label;

    const math = document.createElement("div");
    math.className = "math-output detail-math";
    renderMath(math, detail.latex);

    const text = document.createElement("code");
    text.className = "detail-text";
    text.textContent = detail.text;

    card.append(label, math, text);
    resultDetails.append(card);
  }
  resultDetails.hidden = result.details.length === 0;

  warnings.hidden = result.warnings.length === 0;
  warnings.textContent = result.warnings.join(" ");
}

function renderGraphLegend(result: CalculationResult): void {
  graphLegend.replaceChildren();

  const labels = result.graph_js ? ["Função original"] : [];
  labels.push(...result.graph_overlays.map((overlay) => overlay.label));
  if (result.integral_region) labels.push("Intervalo da integral");

  for (const labelText of labels) {
    const item = document.createElement("span");
    item.className = "legend-item";
    item.textContent = labelText;
    graphLegend.append(item);
  }
}

function renderMath(target: HTMLElement, latex: string): void {
  katex.render(latex, target, {
    throwOnError: false,
    displayMode: true,
    strict: "warn",
  });
}

function setBusy(busy: boolean): void {
  for (const button of document.querySelectorAll<HTMLButtonElement>(
    ".action, .example, .preset, #calculate-button",
  )) {
    button.disabled = busy;
  }
  calculateButton.classList.toggle("loading", busy);
  if (busy) calculateButton.setAttribute("aria-busy", "true");
  else calculateButton.removeAttribute("aria-busy");
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
