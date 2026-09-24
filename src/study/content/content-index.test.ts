import { describe, expect, it } from 'vitest';
import manifest from '../../../public/content/calculo1/manifest.json';
import { STUDY_EXERCISES } from './exercises';
import { STUDY_MATERIALS } from './materials';
import { STUDY_TOPICS } from './topics';

function unique(values: string[]): boolean {
  return new Set(values).size === values.length;
}

describe('study content catalog', () => {
  it('uses unique topic ids', () => {
    expect(unique(STUDY_TOPICS.map((topic) => topic.id))).toBe(true);
  });

  it('uses unique material ids and valid topic references', () => {
    expect(unique(STUDY_MATERIALS.map((material) => material.id))).toBe(true);
    const topicIds = new Set(STUDY_TOPICS.map((topic) => topic.id));
    for (const material of STUDY_MATERIALS) {
      for (const topicId of material.topics) expect(topicIds.has(topicId)).toBe(true);
    }
  });

  it('registers all nine source PDFs in the static manifest', () => {
    expect(STUDY_MATERIALS).toHaveLength(9);
    expect(manifest).toHaveLength(9);
    expect(unique(manifest.map((entry) => entry.id))).toBe(true);
    for (const material of STUDY_MATERIALS) {
      const entry = manifest.find((item) => item.id === material.id);
      expect(entry?.path).toBe(material.textPath);
      expect(entry?.originalFileName).toBe(material.originalFileName);
      expect(entry?.pages).toBe(material.pages);
    }
  });

  it('registers the ten submitted exercises with valid content links', () => {
    expect(STUDY_EXERCISES).toHaveLength(10);
    expect(unique(STUDY_EXERCISES.map((exercise) => exercise.id))).toBe(true);
    const topicIds = new Set(STUDY_TOPICS.map((topic) => topic.id));
    const materialIds = new Set(STUDY_MATERIALS.map((material) => material.id));
    for (const exercise of STUDY_EXERCISES) {
      expect(topicIds.has(exercise.primaryTopicId)).toBe(true);
      expect(exercise.topicIds).toContain(exercise.primaryTopicId);
      expect(exercise.explanation.length).toBeGreaterThan(20);
      expect(exercise.relatedContentReason.length).toBeGreaterThan(10);
      for (const topicId of exercise.topicIds) expect(topicIds.has(topicId)).toBe(true);
      for (const ref of exercise.sourceRefs) if (ref.materialId) expect(materialIds.has(ref.materialId)).toBe(true);
      if (exercise.answerKind === 'single-choice' || exercise.answerKind === 'multi-choice') {
        expect(exercise.options?.length).toBeGreaterThan(1);
        const optionIds = new Set(exercise.options?.map((option) => option.id));
        for (const correctId of exercise.correctOptionIds ?? []) expect(optionIds.has(correctId)).toBe(true);
      } else {
        expect(exercise.expected?.length).toBeGreaterThan(0);
      }
    }
  });
});
