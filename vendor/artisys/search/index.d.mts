export interface SearchDocument { id: string; name?: string; title?: string; description?: string; [key: string]: unknown; }
export interface SearchResult<T extends SearchDocument = SearchDocument> { id: string; score: number; document: T; }
export interface SearchIndex<T extends SearchDocument = SearchDocument> { readonly documents: readonly unknown[]; }
export function buildSearchIndex<T extends SearchDocument>(documents?: T[], options?: { fields?: string[]; weights?: Record<string, number> }): SearchIndex<T>;
export function searchIndex<T extends SearchDocument>(index: SearchIndex<T>, query: string, options?: { limit?: number; filter?: ((doc: T) => boolean) | null }): SearchResult<T>[];
