export interface PdfRuntime { getDocument(source: unknown): { promise: Promise<{ numPages: number }> }; }
export interface PortableHighlight { id: string; pageNumber: number; rect: { x1: number; y1: number; x2: number; y2: number }; text?: string; comment?: string; meta?: Record<string, unknown>; }
export function normalizeHighlight(highlight: PortableHighlight): Required<Omit<PortableHighlight, "meta">> & { meta: Record<string, unknown> };
export function loadPdfDocument(source: unknown, options?: { pdfjs?: PdfRuntime }): Promise<{ numPages: number }>;
