import { describe, expect, it } from 'vitest';
import { buildExamSummary, EXAM_QUESTIONS } from './exam';

describe('exam helpers', () => {
  it('uses the ten submitted exercises as the exam corpus', () => {
    expect(EXAM_QUESTIONS).toHaveLength(10);
    const ids = new Set(EXAM_QUESTIONS.map((question) => question.id));
    expect(ids.has('limite-computadores-x9')).toBe(true);
    expect(ids.has('derivacao-implicita-circulo-tangente')).toBe(true);
    expect(ids.has('derivada-cosseno-exponencial')).toBe(true);
  });

  it('summarizes incorrect attempts by specific subtopic', () => {
    const summary = buildExamSummary([
      { questionId: 'limite-computadores-x9', correct: true },
      { questionId: 'derivada-tangente-polinomio', correct: false },
      { questionId: 'derivacao-implicita-circulo-tangente', correct: false },
    ]);

    expect(summary.correct).toBe(1);
    expect(summary.incorrect).toBe(2);
    expect(summary.reviewTopicIds).toEqual(['derivadas.implicita', 'derivadas.trigonometricas']);
    expect(summary.reviewTopics).toEqual(['Derivação implícita', 'Derivadas trigonométricas']);
  });
});
