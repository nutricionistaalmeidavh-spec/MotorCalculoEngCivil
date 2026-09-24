import { describe, expect, it } from 'vitest';
import type { HistoryEntry } from '../history/storage';
import { STUDY_EXERCISES } from './content/exercises';
import { STUDY_MATERIALS } from './content/materials';
import { buildTopicProgress, filterExercisesByStatus, getExercisesForTopic, getMaterialsForTopic } from './review';

const history: HistoryEntry[] = [
  { id: '1', createdAt: 100, expression: '', operation: 'analyze', variable: 'x', resultText: '', exerciseId: 'limite-computadores-x9', primaryTopicId: 'limites.fatoracao-cancelamento', topicIds: ['limites.fatoracao-cancelamento'], outcome: 'incorrect', mode: 'exam' },
  { id: '2', createdAt: 200, expression: '', operation: 'analyze', variable: 'x', resultText: '', exerciseId: 'limite-computadores-x9', primaryTopicId: 'limites.fatoracao-cancelamento', topicIds: ['limites.fatoracao-cancelamento'], outcome: 'correct', mode: 'exam' },
];

describe('review helpers', () => {
  it('filters exercises and materials by related topic', () => {
    expect(getExercisesForTopic(STUDY_EXERCISES, 'derivadas.implicita').map((item) => item.id)).toContain('derivacao-implicita-circulo-tangente');
    expect(getMaterialsForTopic(STUDY_MATERIALS, 'derivadas.implicita').map((item) => item.id)).toContain('aula3-mod3');
  });

  it('selects exercises by latest answer status', () => {
    const topicExercises = getExercisesForTopic(STUDY_EXERCISES, 'limites.fatoracao-cancelamento');
    expect(filterExercisesByStatus(topicExercises, history, 'incorrect')).toHaveLength(0);
    expect(filterExercisesByStatus(topicExercises, history, 'unanswered').every((item) => item.id !== 'limite-computadores-x9')).toBe(true);
  });

  it('derives topic progress from local history', () => {
    const progress = buildTopicProgress('limites.fatoracao-cancelamento', STUDY_EXERCISES, history);
    expect(progress.attempted).toBe(1);
    expect(progress.correct).toBe(1);
    expect(progress.incorrect).toBe(0);
    expect(progress.lastReviewedAt).toBe(200);
    expect(progress.totalExercises).toBeGreaterThanOrEqual(1);
  });
});
