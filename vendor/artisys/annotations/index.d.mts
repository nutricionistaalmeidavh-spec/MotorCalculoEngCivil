export interface AnnotationInput { id: string; targetType: "image" | "pdf"; targetId: string; page?: number; geometry: { type: "rect"; x: number; y: number; width: number; height: number; coordinateSpace?: "pixel" | "normalized" }; text?: string; tags?: string[]; }
export interface NormalizedAnnotation extends AnnotationInput { text: string; tags: string[]; }
export function normalizeAnnotation(input: AnnotationInput): NormalizedAnnotation;
