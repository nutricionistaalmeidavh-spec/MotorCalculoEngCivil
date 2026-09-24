import { describe, expect, it, vi } from 'vitest';
import type { StudyExercise } from './content/types';
import { checkStudyExerciseAnswer } from './answer-checker';

const base: StudyExercise = {
  id: 'q', origin: 'usuario', prompt: 'q', operation: 'analyze', answerKind: 'text', expected: 'II e III',
  explanation: 'explicação suficientemente detalhada para o teste', relatedContentReason: 'conteúdo relacionado',
  topicIds: ['continuidade.definicao'], primaryTopicId: 'continuidade.definicao', difficulty: 'basico', sourceRefs: [], tags: [],
};

describe('checkStudyExerciseAnswer', () => {
  it('delegates symbolic expressions to the equivalence checker', async () => {
    const symbolic = vi.fn(async () => true);
    const exercise = { ...base, answerKind: 'expression' as const, expected: '2*x' };
    expect(await checkStudyExerciseAnswer(exercise, 'x+x', 'x', symbolic)).toBe(true);
    expect(symbolic).toHaveBeenCalledWith('2*x', 'x+x', 'x');
  });

  it('checks a single selected option id', async () => {
    const exercise = { ...base, answerKind: 'single-choice' as const, options: [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }], correctOptionIds: ['b'] };
    expect(await checkStudyExerciseAnswer(exercise, 'b')).toBe(true);
    expect(await checkStudyExerciseAnswer(exercise, 'a')).toBe(false);
  });

  it('checks multiple options independent of selection order', async () => {
    const exercise = { ...base, answerKind: 'multi-choice' as const, options: [{ id: 'i', label: 'I' }, { id: 'ii', label: 'II' }, { id: 'iii', label: 'III' }], correctOptionIds: ['i', 'iii'] };
    expect(await checkStudyExerciseAnswer(exercise, ['iii', 'i'])).toBe(true);
    expect(await checkStudyExerciseAnswer(exercise, ['i'])).toBe(false);
  });

  it('normalizes case, accents, punctuation and accepted text variants', async () => {
    const exercise = { ...base, expected: 'A corrente tende a +infinito', acceptedAnswers: ['A corrente tende ao infinito positivo'] };
    expect(await checkStudyExerciseAnswer(exercise, 'a corrente tende ao INFINITO positivo.')).toBe(true);
  });

  it('rejects blank answers', async () => {
    expect(await checkStudyExerciseAnswer(base, '   ')).toBe(false);
  });
});
