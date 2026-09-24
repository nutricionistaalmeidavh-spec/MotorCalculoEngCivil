import { readFileSync } from 'node:fs';
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

  it('versions a readable full-text file for every registered material', () => {
    const manifest = JSON.parse(readFileSync('public/content/calculo1/manifest.json', 'utf8')) as Array<{ id: string; path: string; originalFileName: string; pages: number }>;
    expect(manifest).toHaveLength(9);
    expect(unique(manifest.map((entry) => entry.id))).toBe(true);

    for (const material of STUDY_MATERIALS) {
      const entry = manifest.find((item) => item.id === material.id);
      expect(entry?.path).toBe(material.textPath);
      expect(entry?.originalFileName).toBe(material.originalFileName);
      expect(entry?.pages).toBeGreaterThan(0);
      const text = readFileSync(`public${material.textPath}`, 'utf8');
      expect(text).toContain(`# ${material.originalFileName}`);
      expect(text).toContain('## Página 1');
    }
  });
});
