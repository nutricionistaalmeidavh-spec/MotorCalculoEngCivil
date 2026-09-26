import type { StudyMaterial } from './content/types';

export interface MaterialTextResponse {
  ok: boolean;
  text(): Promise<string>;
}

export type MaterialTextFetcher = (path: string) => Promise<MaterialTextResponse>;

const defaultFetcher: MaterialTextFetcher = async (path) => fetch(path);

export async function loadStudyMaterialText(
  material: StudyMaterial,
  fetcher: MaterialTextFetcher = defaultFetcher,
): Promise<string> {
  const paths = material.textParts?.length ? material.textParts : [material.textPath];
  const parts: string[] = [];

  for (const path of paths) {
    const response = await fetcher(path);
    if (!response.ok) throw new Error(`Não foi possível carregar o material ${material.originalFileName}.`);
    parts.push(await response.text());
  }

  return parts.join('\n\n');
}
