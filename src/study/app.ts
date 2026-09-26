import katex from "katex";
import "katex/dist/katex.min.css";
import "../styles.css";
import "../round2.css";
import "../review.css";
import { initializeGraph, plotCalculation } from "../graph/graph";
import {
  calculate,
  initializeMathEngine,
  type CalculationRequest,
  type CalculationResult,
  type MathOperation,
} from "../math/engine";
import { normalizeMathInput } from "../math/normalize";
import { parseQuestionInput } from "./intent";
import { mountExamController } from "./exam-controller";
import { mountReviewController } from "./review-controller";
import { mountStudyShell } from "./shell";

const ACTIONS: Array<{ operation: MathOperation; label: string }> = [
  { operation: "analyze", label: "Analisar" },
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
const OPERATION_LABELS = Object.fromEntries(ACTIONS.map(({ operation, label }) => [operation, label])) as Record<MathOperation, string>;
type StudyMode = "learn" | "solve";
type MainView = "study" | "review" | "exam";

mountStudyShell(ACTIONS);

function get<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Elemento #${id} não encontrado.`);
  return element as T;
}

const expressionInput = get<HTMLTextAreaElement>("expression");
const variableInput = get<HTMLInputElement>("variable");
const statusEl = get<HTMLDivElement>("engine-status");
const resultEmpty = get<HTMLDivElement>("result-empty");
const resultContent = get<HTMLDivElement>("result-content");
const inputMath = get<HTMLDivElement>("input-math");
const resultMath = get<HTMLDivElement>("result-math");
const resultText = get<HTMLPreElement>("result-text");
const resultDetails = get<HTMLDivElement>("result-details");
const learningSteps = get<HTMLElement>("learning-steps");
const learningControls = get<HTMLDivElement>("learning-controls");
const nextHintButton = get<HTMLButtonElement>("next-hint");
const revealAnswerButton = get<HTMLButtonElement>("reveal-answer");
const answerBlock = get<HTMLDivElement>("answer-block");
const warnings = get<HTMLDivElement>("warnings");
const errorEl = get<HTMLDivElement>("error");
const detectedOperation = get<HTMLSpanElement>("detected-operation");
const parameterPanel = get<HTMLDivElement>("parameter-panel");
const limitParameters = get<HTMLDivElement>("limit-parameters");
const derivativeParameters = get<HTMLDivElement>("derivative-parameters");
const integralParameters = get<HTMLDivElement>("integral-parameters");
const limitTarget = get<HTMLInputElement>("limit-target");
const limitDirection = get<HTMLSelectElement>("limit-direction");
const derivativeOrder = get<HTMLSelectElement>("derivative-order");
const tangentPoint = get<HTMLInputElement>("tangent-point");
const lowerBound = get<HTMLInputElement>("lower-bound");
const upperBound = get<HTMLInputElement>("upper-bound");
const calculateButton = get<HTMLButtonElement>("calculate-button");
const graphLegend = get<HTMLDivElement>("graph-legend");
const studyView = get<HTMLElement>("study-view");
const reviewView = get<HTMLElement>("review-view");
const examView = get<HTMLElement>("exam-view");

let selectedOperation: MathOperation = "analyze";
let operationLocked = false;
let studyMode: StudyMode = "learn";
let currentResult: CalculationResult | null = null;
let visibleStepCount = 1;

initializeGraph();
configureParameters(selectedOperation);
updateDetectedOperation();
const examController = mountExamController(variableInput);
const reviewController = mountReviewController();
void bootEngine();

function showView(view: MainView): void {
  studyView.hidden = view !== "study";
  reviewView.hidden = view !== "review";
  examView.hidden = view !== "exam";
  for (const item of document.querySelectorAll<HTMLButtonElement>(".view-tab")) {
    const active = item.dataset.view === view;
    item.classList.toggle("active", active);
    item.setAttribute("aria-pressed", String(active));
  }
  if (view === "exam" && !get<HTMLInputElement>("exam-answer").hidden) get<HTMLInputElement>("exam-answer").focus();
  if (view === "review") void reviewController.refresh();
}

for (const button of document.querySelectorAll<HTMLButtonElement>(".example")) {
  button.addEventListener("click", () => {
    expressionInput.value = button.dataset.question ?? "";
    operationLocked = false;
    syncQuestionIntent();
    expressionInput.focus();
  });
}
for (const button of document.querySelectorAll<HTMLButtonElement>(".action")) {
  button.addEventListener("click", () => {
    operationLocked = true;
    selectOperation(button.dataset.operation as MathOperation);
  });
}
for (const button of document.querySelectorAll<HTMLButtonElement>(".study-mode")) {
  button.addEventListener("click", () => {
    studyMode = button.dataset.studyMode as StudyMode;
    for (const item of document.querySelectorAll<HTMLButtonElement>(".study-mode")) {
      const active = item === button;
      item.classList.toggle("active", active);
      item.setAttribute("aria-pressed", String(active));
    }
    renderLearningState();
  });
}
for (const tab of document.querySelectorAll<HTMLButtonElement>(".view-tab")) {
  tab.addEventListener("click", () => showView((tab.dataset.view ?? "study") as MainView));
}

window.addEventListener("motor-start-topic-exam", (event) => {
  const topicId = (event as CustomEvent<{ topicId?: string }>).detail?.topicId;
  examController.startTopicExam(topicId);
  showView("exam");
});
window.addEventListener("motor-review-topic", (event) => {
  const topicId = (event as CustomEvent<{ topicId?: string }>).detail?.topicId;
  if (topicId) reviewController.selectTopic(topicId);
  showView("review");
});

expressionInput.addEventListener("input", () => { operationLocked = false; syncQuestionIntent(); });
calculateButton.addEventListener("click", () => void runCalculation());
expressionInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
    event.preventDefault();
    void runCalculation();
  }
});
nextHintButton.addEventListener("click", () => {
  if (!currentResult) return;
  visibleStepCount = Math.min(currentResult.steps.length, visibleStepCount + 1);
  renderLearningState();
});
revealAnswerButton.addEventListener("click", () => {
  visibleStepCount = currentResult?.steps.length ?? visibleStepCount;
  answerBlock.hidden = false;
  resultDetails.hidden = (currentResult?.details.length ?? 0) === 0;
  learningControls.hidden = true;
  renderSteps();
});

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

function syncQuestionIntent(): void {
  const parsed = parseQuestionInput(expressionInput.value);
  if (!operationLocked) selectOperation(parsed.operation as MathOperation);
  if (parsed.target) limitTarget.value = parsed.target;
  if (parsed.lower) lowerBound.value = parsed.lower;
  if (parsed.upper) upperBound.value = parsed.upper;
  updateDetectedOperation();
}

function updateDetectedOperation(): void {
  detectedOperation.textContent = `Detectado: ${OPERATION_LABELS[selectedOperation]}`;
  calculateButton.textContent = selectedOperation === "analyze" ? "Analisar questão" : `${OPERATION_LABELS[selectedOperation]} agora`;
}

function selectOperation(operation: MathOperation): void {
  selectedOperation = operation;
  for (const button of document.querySelectorAll<HTMLButtonElement>(".action")) {
    const active = button.dataset.operation === operation;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  }
  configureParameters(operation);
  updateDetectedOperation();
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

function buildRequest(): CalculationRequest {
  const parsed = parseQuestionInput(expressionInput.value);
  if (!operationLocked) selectOperation(parsed.operation as MathOperation);
  const expression = normalizeMathInput(parsed.expression);
  if (!expression) throw new Error("Digite uma expressão ou questão antes de calcular.");
  expressionInput.dataset.solvedExpression = expression;
  const request: CalculationRequest = { operation: selectedOperation, expression, variable: variableInput.value.trim() || "x" };
  if (selectedOperation === "limit") {
    request.target = normalizeMathInput(parsed.target ?? limitTarget.value);
    request.direction = limitDirection.value as "+" | "-" | "+-";
  }
  if (selectedOperation === "differentiate") {
    request.derivativeOrder = Number.parseInt(derivativeOrder.value, 10);
    request.tangentPoint = normalizeMathInput(tangentPoint.value);
  }
  if (selectedOperation === "integrate") {
    request.lower = normalizeMathInput(parsed.lower ?? lowerBound.value);
    request.upper = normalizeMathInput(parsed.upper ?? upperBound.value);
  }
  return request;
}

async function runCalculation(): Promise<void> {
  clearError();
  setBusy(true);
  try {
    const result = await calculate(buildRequest());
    currentResult = result;
    visibleStepCount = 1;
    renderResult(result);
    plotCalculation(result);
    renderGraphLegend(result);
    renderLearningState();
    document.querySelector(".solution-workspace")?.scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (error) {
    showError(error);
  } finally {
    setBusy(false);
  }
}

function renderMath(target: HTMLElement, latex: string): void {
  katex.render(latex, target, { throwOnError: false, displayMode: true, strict: "warn" });
}

function renderResult(result: CalculationResult): void {
  resultEmpty.hidden = true;
  resultContent.hidden = false;
  renderMath(inputMath, result.input_latex);
  renderMath(resultMath, result.result_latex || "\\text{sem resultado}");
  resultText.textContent = result.result_text;
  renderSteps();
  resultDetails.replaceChildren();
  for (const detail of result.details) {
    const card = document.createElement("article");
    card.className = "detail-card analysis-item";
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
  warnings.hidden = result.warnings.length === 0;
  warnings.textContent = result.warnings.join(" ");
}

function renderSteps(): void {
  learningSteps.replaceChildren();
  if (!currentResult) return;
  const count = studyMode === "solve" ? currentResult.steps.length : visibleStepCount;
  for (const [index, step] of currentResult.steps.slice(0, count).entries()) {
    const item = document.createElement("article");
    item.className = "learning-step";
    const number = document.createElement("span");
    number.className = "learning-step-number";
    number.textContent = String(index + 1).padStart(2, "0");
    const body = document.createElement("div");
    const heading = document.createElement("h3");
    heading.textContent = step.label;
    const math = document.createElement("div");
    math.className = "math-output step-math";
    renderMath(math, step.latex);
    const text = document.createElement("p");
    text.textContent = step.text;
    body.append(heading, math, text);
    item.append(number, body);
    learningSteps.append(item);
  }
}

function renderLearningState(): void {
  if (!currentResult) return;
  renderSteps();
  if (studyMode === "solve") {
    answerBlock.hidden = false;
    resultDetails.hidden = currentResult.details.length === 0;
    learningControls.hidden = true;
    return;
  }
  answerBlock.hidden = true;
  resultDetails.hidden = true;
  learningControls.hidden = false;
  nextHintButton.hidden = visibleStepCount >= currentResult.steps.length;
  revealAnswerButton.hidden = false;
}

function renderGraphLegend(result: CalculationResult): void {
  graphLegend.replaceChildren();
  const labels = result.graph_js ? ["Função original"] : [];
  labels.push(...result.graph_overlays.map((overlay) => overlay.label));
  labels.push(...(result.graph_points ?? []).map((point) => point.label));
  if (result.integral_region) labels.push("Intervalo da integral");
  for (const text of labels) {
    const item = document.createElement("span");
    item.className = "legend-item";
    item.textContent = text;
    graphLegend.append(item);
  }
}

function setBusy(busy: boolean): void {
  for (const button of document.querySelectorAll<HTMLButtonElement>(".action, .example, #calculate-button, .study-mode")) button.disabled = busy;
  calculateButton.classList.toggle("loading", busy);
  if (busy) calculateButton.setAttribute("aria-busy", "true"); else calculateButton.removeAttribute("aria-busy");
}
function showError(error: unknown): void {
  errorEl.textContent = error instanceof Error ? error.message : String(error);
  errorEl.hidden = false;
}
function clearError(): void { errorEl.hidden = true; errorEl.textContent = ""; }
