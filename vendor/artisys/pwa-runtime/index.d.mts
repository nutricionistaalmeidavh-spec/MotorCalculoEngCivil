export interface CachePlan { readonly cacheName: string; readonly version: string; readonly shell: readonly string[]; readonly offlineFallback: string | null; }
export function createCachePlan(options?: { prefix?: string; version?: string | number; shell?: string[]; offlineFallback?: string | null }): CachePlan;
export function shouldActivateUpdate(currentVersion: string | number, nextVersion: string | number): boolean;
export function buildServiceWorkerConfig(plan: CachePlan): { cacheName: string; precache: string[]; offlineFallback: string | null };
