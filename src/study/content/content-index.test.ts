import { describe, expect, it } from 'vitest';
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

  it('registers all nine source PDFs', () => {
    expect(STUDY_MATERIALS).toHaveLength(9);
  });
});
