import { describe, expect, it } from "vitest";
import { buildExamSummary, EXAM_QUESTIONS } from "./exam";

describe("exam helpers", () => {
  it("cobre os tópicos principais de Cálculo 1", () => {
    const topics = new Set(EXAM_QUESTIONS.map((question) => question.topic));
    expect(topics.has("Limites")).toBe(true);
    expect(topics.has("Derivadas")).toBe(true);
    expect(topics.has("Análise de funções")).toBe(true);
  });

  it("resume acertos e tópicos que precisam de revisão", () => {
    const summary = buildExamSummary([
      { questionId: "limit-classic", correct: true },
      { questionId: "derivative-poly", correct: false },
      { questionId: "critical-points", correct: false },
    ]);

    expect(summary.correct).toBe(1);
    expect(summary.incorrect).toBe(2);
    expect(summary.reviewTopics).toEqual(["Análise de funções", "Derivadas"]);
  });
});
