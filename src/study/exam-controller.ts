import { addHistoryEntry, buildHistoryEntry } from "../history/storage";
import { checkStudyExerciseAnswer, type StudyAnswer } from "./answer-checker";
import { getTopicById } from "./content/topics";
import { buildExamSummary, EXAM_QUESTIONS, type ExamAttempt, type ExamQuestion } from "./exam";

function get<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Elemento #${id} não encontrado.`);
  return element as T;
}

function topicLabel(question: ExamQuestion): string {
  return getTopicById(question.primaryTopicId)?.title ?? question.primaryTopicId;
}

function expectedDisplay(question: ExamQuestion): string {
  if (question.answerKind === "single-choice" || question.answerKind === "multi-choice") {
    const correct = new Set(question.correctOptionIds ?? []);
    return (question.options ?? []).filter((option) => correct.has(option.id)).map((option) => option.label).join("; ");
  }
  return question.expected ?? "";
}

export interface ExamController {
  startTopicExam(topicId?: string): void;
}

export function mountExamController(variableInput: HTMLInputElement): ExamController {
  const progress = get<HTMLSpanElement>("exam-progress");
  const topic = get<HTMLParagraphElement>("exam-topic");
  const questionText = get<HTMLHeadingElement>("exam-question");
  const hint = get<HTMLDivElement>("exam-hint");
  const answer = get<HTMLInputElement>("exam-answer");
  const answerLabel = document.querySelector<HTMLLabelElement>(".exam-answer-label");
  const options = get<HTMLFieldSetElement>("exam-options");
  const hintButton = get<HTMLButtonElement>("exam-hint-button");
  const checkButton = get<HTMLButtonElement>("exam-check");
  const feedback = get<HTMLDivElement>("exam-feedback");
  const postAnswer = get<HTMLElement>("exam-post-answer");
  const explanation = get<HTMLParagraphElement>("exam-explanation");
  const relatedContent = get<HTMLParagraphElement>("exam-related-content");
  const warning = get<HTMLDivElement>("exam-warning");
  const reviewTopicButton = get<HTMLButtonElement>("exam-review-topic");
  const next = get<HTMLButtonElement>("exam-next");
  const questionWrap = get<HTMLDivElement>("exam-question-wrap");
  const summaryBox = get<HTMLDivElement>("exam-summary");

  let questions: ExamQuestion[] = [...EXAM_QUESTIONS];
  let index = 0;
  let attempts: ExamAttempt[] = [];
  let answered = false;

  function current(): ExamQuestion {
    const question = questions[index % questions.length];
    if (!question) throw new Error("Banco de questões indisponível.");
    return question;
  }

  function hintFor(question: ExamQuestion): string {
    if (question.primaryTopicId === "continuidade.funcoes-por-partes") return "Compare os limites laterais no ponto em que a lei da função muda e depois compare com o valor da função.";
    if (question.primaryTopicId === "derivadas.implicita") return "Derive os dois membros em relação a x, lembrando que y depende de x, e então isole y′.";
    if (question.operation === "limit") return "Verifique se a substituição direta funciona. Se surgir uma indeterminação, identifique uma transformação algébrica adequada.";
    if (question.operation === "differentiate") return "Identifique as regras de derivação necessárias antes de simplificar.";
    return "Identifique primeiro a definição ou propriedade central pedida no enunciado.";
  }

  function renderOptions(question: ExamQuestion): void {
    options.replaceChildren();
    const isChoice = question.answerKind === "single-choice" || question.answerKind === "multi-choice";
    options.hidden = !isChoice;
    answer.hidden = isChoice;
    if (answerLabel) answerLabel.hidden = isChoice;
    if (!isChoice) return;

    const inputType = question.answerKind === "single-choice" ? "radio" : "checkbox";
    for (const option of question.options ?? []) {
      const label = document.createElement("label");
      label.className = "exam-option";
      const input = document.createElement("input");
      input.type = inputType;
      input.name = "exam-option";
      input.value = option.id;
      const text = document.createElement("span");
      text.textContent = option.label;
      label.append(input, text);
      options.append(label);
    }
  }

  function readAnswer(question: ExamQuestion): StudyAnswer {
    if (question.answerKind === "single-choice") {
      return options.querySelector<HTMLInputElement>('input[type="radio"]:checked')?.value ?? "";
    }
    if (question.answerKind === "multi-choice") {
      return [...options.querySelectorAll<HTMLInputElement>('input[type="checkbox"]:checked')].map((input) => input.value);
    }
    return answer.value;
  }

  function disableAnswerInputs(disabled: boolean): void {
    answer.disabled = disabled;
    for (const input of options.querySelectorAll<HTMLInputElement>("input")) input.disabled = disabled;
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
    if (index >= questions.length) return renderSummary();
    const question = current();
    questionWrap.hidden = false;
    summaryBox.hidden = true;
    progress.textContent = `${index + 1} / ${questions.length}`;
    topic.textContent = topicLabel(question);
    questionText.textContent = question.prompt;
    answer.value = "";
    answer.placeholder = question.answerKind === "expression" ? "Digite a expressão matemática" : "Digite sua resposta";
    renderOptions(question);
    disableAnswerInputs(false);
    hint.hidden = true;
    hint.textContent = "";
    feedback.textContent = "";
    feedback.className = "exam-feedback";
    postAnswer.hidden = true;
    explanation.textContent = "";
    relatedContent.textContent = "";
    warning.hidden = true;
    warning.textContent = "";
    next.hidden = true;
    checkButton.disabled = false;
    answered = false;
  }

  async function check(): Promise<void> {
    if (answered) return;
    const question = current();
    const userAnswer = readAnswer(question);
    const blank = Array.isArray(userAnswer) ? userAnswer.length === 0 : userAnswer.trim().length === 0;
    if (blank) {
      feedback.textContent = "Informe uma resposta antes de corrigir.";
      feedback.className = "exam-feedback feedback-warning";
      return;
    }

    checkButton.disabled = true;
    const correct = await checkStudyExerciseAnswer(question, userAnswer, variableInput.value.trim() || "x");
    answered = true;
    attempts.push({ questionId: question.id, correct });
    disableAnswerInputs(true);
    next.hidden = false;
    feedback.textContent = correct
      ? "Correto. Confira a resolução e avance quando quiser."
      : `Ainda não. Resposta esperada: ${expectedDisplay(question)}. Este conteúdo foi marcado para revisão.`;
    feedback.className = `exam-feedback ${correct ? "feedback-correct" : "feedback-incorrect"}`;

    explanation.textContent = question.explanation;
    const topicNames = question.topicIds.map((topicId) => getTopicById(topicId)?.title ?? topicId);
    relatedContent.textContent = `${topicNames.join(" · ")}. ${question.relatedContentReason}`;
    warning.hidden = !question.warning;
    warning.textContent = question.warning ?? "";
    postAnswer.hidden = false;

    const printableAnswer = Array.isArray(userAnswer) ? userAnswer.join(", ") : userAnswer;
    try {
      await addHistoryEntry(buildHistoryEntry({
        expression: question.expression ?? question.prompt,
        operation: question.operation,
        variable: variableInput.value.trim() || "x",
        resultText: correct ? `Resposta correta: ${printableAnswer}` : `Sua resposta: ${printableAnswer} · Esperado: ${expectedDisplay(question)}`,
        topic: topicLabel(question),
        outcome: correct ? "correct" : "incorrect",
        mode: "exam",
        target: question.target,
        direction: question.direction,
        lower: question.lower,
        upper: question.upper,
        exerciseId: question.id,
        topicIds: question.topicIds,
        primaryTopicId: question.primaryTopicId,
        sourceMaterialId: question.sourceRefs.find((ref) => ref.materialId)?.materialId,
      }));
      window.dispatchEvent(new Event("motor-history-updated"));
    } catch {
      // A prova continua funcional mesmo sem IndexedDB.
    }
  }

  function startTopicExam(topicId?: string): void {
    const filtered = topicId ? EXAM_QUESTIONS.filter((question) => question.topicIds.includes(topicId)) : EXAM_QUESTIONS;
    questions = filtered.length ? [...filtered] : [...EXAM_QUESTIONS];
    index = 0;
    attempts = [];
    render();
  }

  hintButton.addEventListener("click", () => { hint.textContent = hintFor(current()); hint.hidden = false; });
  checkButton.addEventListener("click", () => void check());
  answer.addEventListener("keydown", (event) => { if (event.key === "Enter" && !answer.hidden) void check(); });
  next.addEventListener("click", () => { index += 1; answered = false; render(); });
  reviewTopicButton.addEventListener("click", () => {
    window.dispatchEvent(new CustomEvent("motor-review-topic", { detail: { topicId: current().primaryTopicId } }));
  });

  render();
  return { startTopicExam };
}
