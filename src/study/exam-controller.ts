import { checkEquivalent } from "../math/engine";
import { normalizeMathInput } from "../math/normalize";
import { addHistoryEntry, buildHistoryEntry } from "../history/storage";
import { buildExamSummary, EXAM_QUESTIONS, type ExamAttempt, type ExamQuestion } from "./exam";

function get<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Elemento #${id} não encontrado.`);
  return element as T;
}

export function mountExamController(variableInput: HTMLInputElement): void {
  const progress = get<HTMLSpanElement>("exam-progress");
  const topic = get<HTMLParagraphElement>("exam-topic");
  const questionText = get<HTMLHeadingElement>("exam-question");
  const hint = get<HTMLDivElement>("exam-hint");
  const answer = get<HTMLInputElement>("exam-answer");
  const hintButton = get<HTMLButtonElement>("exam-hint-button");
  const checkButton = get<HTMLButtonElement>("exam-check");
  const feedback = get<HTMLDivElement>("exam-feedback");
  const next = get<HTMLButtonElement>("exam-next");
  const questionWrap = get<HTMLDivElement>("exam-question-wrap");
  const summaryBox = get<HTMLDivElement>("exam-summary");

  let index = 0;
  let attempts: ExamAttempt[] = [];
  let answered = false;

  function current(): ExamQuestion {
    const question = EXAM_QUESTIONS[index % EXAM_QUESTIONS.length];
    if (!question) throw new Error("Banco de questões indisponível.");
    return question;
  }

  function hintFor(question: ExamQuestion): string {
    if (question.operation === "limit") return "Verifique o comportamento da expressão perto do ponto antes de substituir diretamente.";
    if (question.operation === "differentiate") return "Identifique qual regra de derivação se aplica e simplifique só no final.";
    if (question.operation === "integrate") return "Encontre uma primitiva e depois aplique os limites superior e inferior.";
    return "Comece por f′(x). Pontos críticos aparecem onde f′(x)=0 ou não existe.";
  }

  function renderSummary(): void {
    const summary = buildExamSummary(attempts);
    questionWrap.hidden = true;
    summaryBox.hidden = false;
    progress.textContent = "Concluído";
    summaryBox.replaceChildren();
    const title = document.createElement("h3");
    title.textContent = `${summary.correct} de ${summary.total} corretas`;
    const result = document.createElement("p");
    result.textContent = `${summary.incorrect} questão(ões) precisam de revisão.`;
    const topics = document.createElement("p");
    topics.textContent = summary.reviewTopics.length ? `Revise: ${summary.reviewTopics.join(", ")}.` : "Nenhum tópico pendente nesta rodada.";
    const restart = document.createElement("button");
    restart.type = "button";
    restart.className = "calculate-button";
    restart.textContent = "Refazer prova";
    restart.addEventListener("click", () => { index = 0; attempts = []; render(); });
    summaryBox.append(title, result, topics, restart);
  }

  function render(): void {
    if (index >= EXAM_QUESTIONS.length) return renderSummary();
    const question = current();
    questionWrap.hidden = false;
    summaryBox.hidden = true;
    progress.textContent = `${index + 1} / ${EXAM_QUESTIONS.length}`;
    topic.textContent = question.topic;
    questionText.textContent = question.prompt;
    answer.value = "";
    answer.disabled = false;
    hint.hidden = true;
    hint.textContent = "";
    feedback.textContent = "";
    feedback.className = "exam-feedback";
    next.hidden = true;
    checkButton.disabled = false;
    answered = false;
  }

  async function check(): Promise<void> {
    if (answered) return;
    const userAnswer = normalizeMathInput(answer.value);
    if (!userAnswer) {
      feedback.textContent = "Digite uma resposta antes de corrigir.";
      feedback.className = "exam-feedback feedback-warning";
      return;
    }
    checkButton.disabled = true;
    const question = current();
    const correct = await checkEquivalent(question.expected, userAnswer, variableInput.value.trim() || "x");
    answered = true;
    attempts.push({ questionId: question.id, correct });
    answer.disabled = true;
    next.hidden = false;
    feedback.textContent = correct
      ? "Correto. Avance para a próxima questão."
      : `Ainda não. Resposta esperada: ${question.expected}. Este tópico foi marcado para revisão.`;
    feedback.className = `exam-feedback ${correct ? "feedback-correct" : "feedback-incorrect"}`;

    try {
      await addHistoryEntry(buildHistoryEntry({
        expression: question.expression,
        operation: question.operation,
        variable: variableInput.value.trim() || "x",
        resultText: correct ? `Resposta correta: ${userAnswer}` : `Sua resposta: ${userAnswer} · Esperado: ${question.expected}`,
        topic: question.topic,
        outcome: correct ? "correct" : "incorrect",
        mode: "exam",
        target: question.target,
        lower: question.lower,
        upper: question.upper,
      }));
      window.dispatchEvent(new Event("motor-history-updated"));
    } catch {
      // A prova continua funcional mesmo sem IndexedDB.
    }
  }

  hintButton.addEventListener("click", () => { hint.textContent = hintFor(current()); hint.hidden = false; });
  checkButton.addEventListener("click", () => void check());
  answer.addEventListener("keydown", (event) => { if (event.key === "Enter") void check(); });
  next.addEventListener("click", () => { index += 1; answered = false; render(); });
  render();
}
