import { topologicalOrder, validateWorkflow, type Workflow } from "../../../vendor/artisys/workflows/index.mjs";
import { STUDY_TOPICS } from "../fixtures";
import type { StudyTopic } from "../types";

export function validateStudyWorkflow<T extends Workflow>(workflow: T): T {
  const valid = validateWorkflow(workflow);
  topologicalOrder(valid);
  return valid;
}

export function getStudyTopic(id: string): StudyTopic | undefined {
  return STUDY_TOPICS.find((topic) => topic.id === id);
}
