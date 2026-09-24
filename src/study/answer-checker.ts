import { checkEquivalent } from '../math/engine';
import { normalizeMathInput } from '../math/normalize';
import type { StudyExercise } from './content/types';

export type SymbolicChecker = (expected: string, answer: string, variable?: string) => Promise<boolean>;
export type StudyAnswer = string | string[];

function normalizedText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
    .replace(/[^a-z0-9+∞]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function sameOptionSet(expected: string[], answer: string[]): boolean {
  const expectedSet = new Set(expected);
  const answerSet = new Set(answer);
  if (answerSet.size !== answer.length || expectedSet.size !== answerSet.size) return false;
  return [...expectedSet].every((id) => answerSet.has(id));
}

export async function checkStudyExerciseAnswer(
  exercise: StudyExercise,
  answer: StudyAnswer,
  variable = 'x',
  symbolicChecker: SymbolicChecker = checkEquivalent,
): Promise<boolean> {
  if (Array.isArray(answer)) {
    const clean = answer.map((item) => item.trim()).filter(Boolean);
    if (clean.length === 0) return false;
    if (exercise.answerKind !== 'multi-choice') return false;
    return sameOptionSet(exercise.correctOptionIds ?? [], clean);
  }

  const clean = answer.trim();
  if (!clean) return false;

  if (exercise.answerKind === 'expression') {
    if (!exercise.expected) return false;
    return symbolicChecker(exercise.expected, normalizeMathInput(clean), variable);
  }

  if (exercise.answerKind === 'single-choice') {
    const expected = exercise.correctOptionIds ?? [];
    return expected.length === 1 && expected[0] === clean;
  }

  if (exercise.answerKind === 'multi-choice') {
    return sameOptionSet(exercise.correctOptionIds ?? [], [clean]);
  }

  if (!exercise.expected) return false;
  const candidates = [exercise.expected, ...(exercise.acceptedAnswers ?? [])].map(normalizedText);
  return candidates.includes(normalizedText(clean));
}
