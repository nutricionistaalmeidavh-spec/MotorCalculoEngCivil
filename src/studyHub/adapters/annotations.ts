import { normalizeAnnotation, type NormalizedAnnotation } from "../../../vendor/artisys/annotations/index.mjs";

export interface StudyAnnotationInput {
  id: string;
  targetId: string;
  page: number;
  text: string;
}

export function createStudyAnnotation(input: StudyAnnotationInput): NormalizedAnnotation {
  return normalizeAnnotation({
    id: input.id,
    targetType: "pdf",
    targetId: input.targetId,
    page: input.page,
    geometry: { type: "rect", x: 0.05, y: 0.05, width: 0.9, height: 0.08, coordinateSpace: "normalized" },
    text: input.text,
    tags: ["estudo"],
  });
}
