import { describe, expect, it, vi } from 'vitest';
import { STUDY_MATERIALS } from './content/materials';
import { loadStudyMaterialText } from './material-loader';

describe('loadStudyMaterialText', () => {
  it('loads every segment in order for a segmented source', async () => {
    const material = STUDY_MATERIALS.find((item) => item.id === 'unidade2calc2');
    expect(material).toBeTruthy();
    const fetcher = vi.fn(async (path: string) => ({ ok: true, text: async () => `TEXT:${path}` }));
    const text = await loadStudyMaterialText(material!, fetcher);
    expect(fetcher.mock.calls.map(([path]) => path)).toEqual(material!.textParts);
    expect(text.indexOf('p01-20')).toBeLessThan(text.indexOf('p61-78'));
  });

  it('loads the single text path for regular sources', async () => {
    const material = STUDY_MATERIALS.find((item) => item.id === 'aula3-mod3');
    expect(material).toBeTruthy();
    const fetcher = vi.fn(async (path: string) => ({ ok: true, text: async () => `TEXT:${path}` }));
    await loadStudyMaterialText(material!, fetcher);
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(fetcher).toHaveBeenCalledWith(material!.textPath);
  });

  it('fails explicitly when a source text cannot be loaded', async () => {
    const material = STUDY_MATERIALS[0]!;
    const fetcher = vi.fn(async () => ({ ok: false, text: async () => '' }));
    await expect(loadStudyMaterialText(material, fetcher)).rejects.toThrow('Não foi possível carregar');
  });
});
