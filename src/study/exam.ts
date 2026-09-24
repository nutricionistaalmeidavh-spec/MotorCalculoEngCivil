import { STUDY_EXERCISES } from './content/exercises';
import { getTopicById } from './content/topics';
import type { StudyExercise } from './content/types';

export type ExamQuestion = StudyExercise;

export interface ExamAttempt {
  questionId: string;
  correct: boolean;
}

export const EXAM_QUESTIONS: ExamQuestion[] = STUDY_EXERCISES;

export function buildExamSummary(attempts: ExamAttempt[]): {
  total: number;
  correct: number;
  incorrect: number;
  reviewTopicIds: string[];
  reviewTopics: string[];
} {
  const correct = attempts.filter((attempt) => attempt.correct).length;
  const reviewTopicIds = [...new Set(
    attempts
      .filter((attempt) => !attempt.correct)
      .map((attempt) => EXAM_QUESTIONS.find((question) => question.id === attempt.questionId)?.primaryTopicId)
      .filter((topicId): topicId is string => Boolean(topicId)),
  )].sort((a, b) => a.localeCompare(b, 'pt-BR'));

  return {
    total: attempts.length,
    correct,
    incorrect: attempts.length - correct,
    reviewTopicIds,
    reviewTopics: reviewTopicIds.map((topicId) => getTopicById(topicId)?.title ?? topicId),
  };
}
