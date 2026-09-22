export interface ExamQuestion {
  id: string;
  prompt: string;
  expression: string;
  operation: 'limit' | 'differentiate' | 'integrate' | 'analyze';
  topic: 'Limites' | 'Derivadas' | 'Integrais' | 'Análise de funções';
  expected: string;
  target?: string;
  lower?: string;
  upper?: string;
}

export interface ExamAttempt {
  questionId: string;
  correct: boolean;
}

export const EXAM_QUESTIONS: ExamQuestion[] = [
  {
    id: 'limit-classic',
    prompt: 'Calcule o limite de (x² - 4)/(x - 2) quando x tende a 2.',
    expression: '(x^2 - 4)/(x - 2)',
    operation: 'limit',
    topic: 'Limites',
    expected: '4',
    target: '2',
  },
  {
    id: 'derivative-poly',
    prompt: 'Derive f(x) = x³ - 3x.',
    expression: 'x^3 - 3*x',
    operation: 'differentiate',
    topic: 'Derivadas',
    expected: '3*x^2 - 3',
  },
  {
    id: 'integral-basic',
    prompt: 'Calcule a integral definida de x entre 0 e 2.',
    expression: 'x',
    operation: 'integrate',
    topic: 'Integrais',
    expected: '2',
    lower: '0',
    upper: '2',
  },
  {
    id: 'critical-points',
    prompt: 'Para f(x)=x³-3x, encontre a derivada usada para localizar os pontos críticos.',
    expression: 'x^3 - 3*x',
    operation: 'analyze',
    topic: 'Análise de funções',
    expected: '3*x^2 - 3',
  },
  {
    id: 'derivative-chain',
    prompt: 'Derive f(x) = (x² + 1)³.',
    expression: '(x^2 + 1)^3',
    operation: 'differentiate',
    topic: 'Derivadas',
    expected: '6*x*(x^2 + 1)^2',
  },
  {
    id: 'limit-infinity',
    prompt: 'Calcule o limite de 1/x quando x tende a ∞.',
    expression: '1/x',
    operation: 'limit',
    topic: 'Limites',
    expected: '0',
    target: 'oo',
  },
];

export function buildExamSummary(attempts: ExamAttempt[]): {
  total: number;
  correct: number;
  incorrect: number;
  reviewTopics: string[];
} {
  const correct = attempts.filter((attempt) => attempt.correct).length;
  const reviewTopics = [...new Set(
    attempts
      .filter((attempt) => !attempt.correct)
      .map((attempt) => EXAM_QUESTIONS.find((question) => question.id === attempt.questionId)?.topic)
      .filter((topic): topic is ExamQuestion['topic'] => Boolean(topic)),
  )].sort((a, b) => a.localeCompare(b, 'pt-BR'));

  return {
    total: attempts.length,
    correct,
    incorrect: attempts.length - correct,
    reviewTopics,
  };
}
