import {
  addHistoryEntry,
  buildHistoryEntry,
  clearHistory,
  deleteHistoryEntry,
  listHistory,
  type HistoryEntry,
} from "./storage";
import { topicForOperation, type SupportedOperation } from "../study/intent";

const OPERATION_LABELS: Record<string, string> = {
  analyze: "Análise",
  graph: "Gráfico",
  roots: "Raízes",
  differentiate: "Derivada",
  integrate: "Integral",
  limit: "Limite",
  simplify: "Simplificar",
  factor: "Fatorar",
  expand: "Expandir",
  solve: "Resolver",
};

let lastSignature = "";
let renderScheduled = false;
let onlyErrors = false;

function getInputValue(id: string): string {
  return document.getElementById(id) instanceof HTMLInputElement
    ? (document.getElementById(id) as HTMLInputElement).value
    : "";
}

function getSelectValue(id: string): string {
  return document.getElementById(id) instanceof HTMLSelectElement
    ? (document.getElementById(id) as HTMLSelectElement).value
    : "";
}

function currentSnapshot(): Omit<HistoryEntry, "id" | "createdAt"> | null {
  const resultContent = document.getElementById("result-content");
  const resultText = document.getElementById("result-text")?.textContent?.trim() ?? "";
  const solvedExpression = (document.getElementById("expression") as HTMLTextAreaElement | null)?.dataset.solvedExpression?.trim() ?? "";
  const expression = solvedExpression || (document.getElementById("expression") as HTMLTextAreaElement | null)?.value.trim() || "";
  const variable = getInputValue("variable") || "x";
  const activeOperation = document.querySelector<HTMLButtonElement>(".action.active")?.dataset.operation ?? "";

  if (!resultContent || resultContent.hidden || !expression || !activeOperation || !resultText) return null;

  const entry: Omit<HistoryEntry, "id" | "createdAt"> = {
    expression,
    operation: activeOperation,
    variable,
    resultText,
    topic: topicForOperation(activeOperation as SupportedOperation),
    outcome: "practice",
    mode: "study",
  };

  if (activeOperation === "limit") {
    entry.target = getInputValue("limit-target");
    entry.direction = getSelectValue("limit-direction");
  }

  if (activeOperation === "differentiate") {
    entry.derivativeOrder = Number.parseInt(getSelectValue("derivative-order") || "1", 10);
    entry.tangentPoint = getInputValue("tangent-point");
  }

  if (activeOperation === "integrate") {
    entry.lower = getInputValue("lower-bound");
    entry.upper = getInputValue("upper-bound");
  }

  return entry;
}

async function captureResult(): Promise<void> {
  const snapshot = currentSnapshot();
  if (!snapshot) return;

  const signature = JSON.stringify(snapshot);
  if (signature === lastSignature) return;
  lastSignature = signature;

  try {
    await addHistoryEntry(buildHistoryEntry(snapshot));
    scheduleRender();
  } catch {
    setHistoryStatus("Histórico local indisponível neste navegador.");
  }
}

function scheduleRender(): void {
  if (renderScheduled) return;
  renderScheduled = true;
  queueMicrotask(() => {
    renderScheduled = false;
    void renderHistory();
  });
}

function setHistoryStatus(message: string): void {
  const status = document.getElementById("history-status");
  if (status) status.textContent = message;
}

function restoreEntry(entry: HistoryEntry): void {
  const expression = document.getElementById("expression") as HTMLTextAreaElement | null;
  const variable = document.getElementById("variable") as HTMLInputElement | null;
  if (expression) expression.value = entry.expression;
  if (variable) variable.value = entry.variable;

  document.querySelector<HTMLButtonElement>(`.action[data-operation="${entry.operation}"]`)?.click();

  if (entry.target !== undefined) {
    const input = document.getElementById("limit-target") as HTMLInputElement | null;
    if (input) input.value = entry.target;
  }
  if (entry.direction !== undefined) {
    const select = document.getElementById("limit-direction") as HTMLSelectElement | null;
    if (select) select.value = entry.direction;
  }
  if (entry.derivativeOrder !== undefined) {
    const select = document.getElementById("derivative-order") as HTMLSelectElement | null;
    if (select) select.value = String(entry.derivativeOrder);
  }
  if (entry.tangentPoint !== undefined) {
    const input = document.getElementById("tangent-point") as HTMLInputElement | null;
    if (input) input.value = entry.tangentPoint;
  }
  if (entry.lower !== undefined) {
    const input = document.getElementById("lower-bound") as HTMLInputElement | null;
    if (input) input.value = entry.lower;
  }
  if (entry.upper !== undefined) {
    const input = document.getElementById("upper-bound") as HTMLInputElement | null;
    if (input) input.value = entry.upper;
  }

  document.querySelector(".input-card")?.scrollIntoView({ behavior: "smooth", block: "start" });
  expression?.focus();
}

function outcomeLabel(entry: HistoryEntry): string {
  if (entry.outcome === "incorrect") return "Revisar";
  if (entry.outcome === "correct") return "Acertou";
  return entry.mode === "exam" ? "Prova" : "Prática";
}

async function renderHistory(): Promise<void> {
  const list = document.getElementById("history-list");
  if (!list) return;

  try {
    const entries = await listHistory(60);
    const errors = entries.filter((entry) => entry.outcome === "incorrect");
    const visibleEntries = onlyErrors ? errors : entries.slice(0, 30);
    list.replaceChildren();
    setHistoryStatus(
      entries.length
        ? `${entries.length} registro(s) · ${errors.length} para revisar neste aparelho.`
        : "Nenhum cálculo salvo ainda.",
    );

    const filterButton = document.getElementById("history-errors-only");
    if (filterButton) {
      filterButton.textContent = onlyErrors ? "Mostrar tudo" : `Revisar erros (${errors.length})`;
      filterButton.setAttribute("aria-pressed", String(onlyErrors));
    }

    for (const entry of visibleEntries) {
      const row = document.createElement("article");
      row.className = `history-item history-${entry.outcome ?? "practice"}`;

      const body = document.createElement("button");
      body.type = "button";
      body.className = "history-reuse";
      body.addEventListener("click", () => restoreEntry(entry));

      const heading = document.createElement("span");
      heading.className = "history-heading";
      heading.textContent = `${outcomeLabel(entry)} · ${entry.topic ?? OPERATION_LABELS[entry.operation] ?? entry.operation} · ${new Date(entry.createdAt).toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })}`;

      const expression = document.createElement("code");
      expression.className = "history-expression";
      expression.textContent = entry.expression;

      const result = document.createElement("span");
      result.className = "history-result";
      result.textContent = entry.resultText;

      body.append(heading, expression, result);

      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "history-delete";
      remove.textContent = "Excluir";
      remove.addEventListener("click", async () => {
        await deleteHistoryEntry(entry.id);
        await renderHistory();
      });

      row.append(body, remove);
      list.append(row);
    }
  } catch {
    setHistoryStatus("Histórico local indisponível neste navegador.");
  }
}

export function mountHistory(): void {
  const shell = document.querySelector<HTMLElement>(".shell");
  const resultContent = document.getElementById("result-content");
  if (!shell || !resultContent || document.getElementById("history-card")) return;

  const section = document.createElement("section");
  section.id = "history-card";
  section.className = "card history-card";
  section.innerHTML = `
    <div class="section-heading compact history-toolbar">
      <div><p class="step">Revisão</p><h2>Seu histórico de estudo</h2></div>
      <div class="history-actions">
        <button id="history-errors-only" type="button" class="history-filter" aria-pressed="false">Revisar erros</button>
        <button id="history-clear" type="button" class="history-clear">Limpar</button>
      </div>
    </div>
    <p id="history-status" class="history-status">Carregando histórico…</p>
    <div id="history-list" class="history-list"></div>
  `;
  shell.append(section);

  document.getElementById("history-clear")?.addEventListener("click", async () => {
    await clearHistory();
    lastSignature = "";
    await renderHistory();
  });

  document.getElementById("history-errors-only")?.addEventListener("click", () => {
    onlyErrors = !onlyErrors;
    void renderHistory();
  });

  const observer = new MutationObserver(() => {
    void captureResult();
  });
  observer.observe(resultContent, { subtree: true, childList: true, characterData: true, attributes: true });

  window.addEventListener("motor-history-updated", scheduleRender);
  void renderHistory();
}
