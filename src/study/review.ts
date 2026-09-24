import type { HistoryEntry } from '../history/storage';
import type { StudyExercise, StudyMaterial } from './content/types';

export type ReviewStatusFilter = 'all' | 'incorrect' | 'unanswered';

export interface TopicProgress {
  topicId: string;
  totalExercises: number;
  attempted: number;
  correct: number;
  incorrect: number;
  lastReviewedAt: number | null;
}

export function getExercisesForTopic(exercises: StudyExercise[], topicId: string): StudyExercise[] {
  return exercises.filter((exercise) => exercise.topicIds.includes(topicId));
}

export function getMaterialsForTopic(materials: StudyMaterial[], topicId: string): StudyMaterial[] {
  return materials.filter((material) => material.topics.includes(topicId));
}

function latestAttemptByExercise(history: HistoryEntry[]): Map<string, HistoryEntry> {
  const latest = new Map<string, HistoryEntry>();
  for (const entry of history) {
    if (!entry.exerciseId) continue;
    const previous = latest.get(entry.exerciseId);
    if (!previous || entry.createdAt > previous.createdAt) latest.set(entry.exerciseId, entry);
  }
  return latest;
}

export function filterExercisesByStatus(
  exercises: StudyExercise[],
  history: HistoryEntry[],
  filter: ReviewStatusFilter,
): StudyExercise[] {
  if (filter === 'all') return [...exercises];
  const latest = latestAttemptByExercise(history);
  if (filter === 'unanswered') return exercises.filter((exercise) => !latest.has(exercise.id));
  return exercises.filter((exercise) => latest.get(exercise.id)?.outcome === 'incorrect');
}

export function buildTopicProgress(
  topicId: string,
  exercises: StudyExercise[],
  history: HistoryEntry[],
): TopicProgress {
  const topicExercises = getExercisesForTopic(exercises, topicId);
  const ids = new Set(topicExercises.map((exercise) => exercise.id));
  const latest = latestAttemptByExercise(history);
  const attemptedEntries = [...latest.entries()].filter(([id]) => ids.has(id)).map(([, entry]) => entry);
  const relevantHistory = history.filter((entry) => entry.primaryTopicId === topicId || entry.topicIds?.includes(topicId));

  return {
    topicId,
    totalExercises: topicExercises.length,
    attempted: attemptedEntries.length,
    correct: attemptedEntries.filter((entry) => entry.outcome === 'correct').length,
    incorrect: attemptedEntries.filter((entry) => entry.outcome === 'incorrect').length,
    lastReviewedAt: relevantHistory.length ? Math.max(...relevantHistory.map((entry) => entry.createdAt)) : null,
  };
}
