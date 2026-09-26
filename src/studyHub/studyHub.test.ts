import { describe, expect, it } from "vitest";
import { createStudyDashboardLayout } from "./adapters/dashboard";
import { createStudyStorage, loadStudyState, saveStudyState } from "./adapters/storage";
import { createInitialStudyHubState } from "./state";

describe("study storage", () => {
  it("persists selected topic, annotation and progress", async () => {
    const storage = await createStudyStorage({ indexedDB: undefined });
    const state = createInitialStudyHubState();
    state.selectedTopicId = "limites";
    state.progress.limites = true;
    state.annotations.push({ id: "note-1", targetId: "calculo1-demo", page: 1, text: "rever limite lateral" });
    await saveStudyState(storage, state);
    expect(await loadStudyState(storage)).toMatchObject({
      selectedTopicId: "limites",
      progress: { limites: true },
      annotations: [{ id: "note-1" }],
    });
  });

  it("falls back to memory when IndexedDB is unavailable", async () => {
    const storage = await createStudyStorage({ indexedDB: undefined });
    expect((await storage.health()).driver).toBe("memory-browser");
  });
});

describe("study dashboard", () => {
  it("validates the seven visible study cards", () => {
    const layout = createStudyDashboardLayout();
    expect(layout.map((item) => item.id)).toEqual([
      "dashboard",
      "pdf",
      "annotations",
      "workflow",
      "search",
      "storage",
      "pwa",
    ]);
  });
});
