import { buildSearchIndex, searchIndex, type SearchResult } from "../../../vendor/artisys/search/index.mjs";
import type { StudySearchDocument } from "../types";

export interface StudySearch {
  query(query: string): SearchResult<StudySearchDocument>[];
  replaceDocuments(documents: StudySearchDocument[]): void;
}

export function createStudySearch(initialDocuments: StudySearchDocument[]): StudySearch {
  let documents = [...initialDocuments];
  let index = buildSearchIndex(documents, { fields: ["title", "description"], weights: { title: 3, description: 1 } });
  return {
    query(query: string) {
      return searchIndex(index, query);
    },
    replaceDocuments(next: StudySearchDocument[]) {
      documents = [...next];
      index = buildSearchIndex(documents, { fields: ["title", "description"], weights: { title: 3, description: 1 } });
    },
  };
}

export function annotationSearchDocuments(annotations: Array<{ id: string; text: string }>): StudySearchDocument[] {
  return annotations.map((annotation) => ({
    id: `annotation:${annotation.id}`,
    title: "Anotação",
    description: annotation.text,
    kind: "annotation",
  }));
}
