import type { StudyHubState } from "./types";

export function createInitialStudyHubState(): StudyHubState {
  return {
    selectedTopicId: "calculo-1",
    progress: {},
    annotations: [],
  };
}
