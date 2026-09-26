import { IndexedDbStorage, MemoryStorage, namespaceStorage, type StorageLike } from "../../../vendor/artisys/storage/browser.mjs";
import { createInitialStudyHubState } from "../state";
import type { StudyHubState } from "../types";

export async function createStudyStorage(options: { indexedDB?: IDBFactory } = {}): Promise<StorageLike> {
  const indexedDB = options.indexedDB ?? globalThis.indexedDB;
  if (indexedDB) {
    try {
      const persistent = new IndexedDbStorage({ indexedDB, dbName: "motor-calculo-study" });
      await persistent.health();
      return namespaceStorage(persistent, "study-hub");
    } catch {
      // Fallback abaixo mantém a Central de Estudos utilizável.
    }
  }
  return namespaceStorage(new MemoryStorage(), "study-hub");
}

export async function loadStudyState(storage: StorageLike): Promise<StudyHubState> {
  const entry = await storage.get("state.json");
  if (!entry || !entry.value || typeof entry.value !== "object") return createInitialStudyHubState();
  const candidate = entry.value as Partial<StudyHubState>;
  return {
    selectedTopicId: typeof candidate.selectedTopicId === "string" ? candidate.selectedTopicId : "calculo-1",
    progress: candidate.progress && typeof candidate.progress === "object" ? { ...candidate.progress } : {},
    annotations: Array.isArray(candidate.annotations)
      ? candidate.annotations.filter((item): item is StudyHubState["annotations"][number] =>
          Boolean(item && typeof item.id === "string" && typeof item.targetId === "string" && Number.isInteger(item.page) && typeof item.text === "string"),
        )
      : [],
  };
}

export async function saveStudyState(storage: StorageLike, state: StudyHubState): Promise<void> {
  await storage.put("state.json", {
    selectedTopicId: state.selectedTopicId,
    progress: { ...state.progress },
    annotations: state.annotations.map((annotation) => ({ ...annotation })),
  });
}
