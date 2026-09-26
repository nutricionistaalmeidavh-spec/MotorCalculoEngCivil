import { loadPdfDocument, type PdfRuntime } from "../../../vendor/artisys/pdf/index.mjs";

export async function loadStudyPdf(url: string, injectedRuntime?: PdfRuntime): Promise<{ pages: number; url: string }> {
  let runtime: PdfRuntime;
  if (injectedRuntime) {
    runtime = injectedRuntime;
  } else {
    const pdfjs = await import("pdfjs-dist");
    const worker = await import("pdfjs-dist/build/pdf.worker.min.mjs?url");
    pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
    runtime = pdfjs as unknown as PdfRuntime;
  }
  const document = await loadPdfDocument(url, { pdfjs: runtime });
  return { pages: document.numPages, url };
}
