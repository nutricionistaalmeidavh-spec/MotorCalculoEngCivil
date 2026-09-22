import { describe, expect, it } from "vitest";
import { validateDashboardLayout } from "../../vendor/artisys/dashboard/index.mjs";
import { normalizeHighlight } from "../../vendor/artisys/pdf/index.mjs";
import { normalizeAnnotation } from "../../vendor/artisys/annotations/index.mjs";
import { validateWorkflow } from "../../vendor/artisys/workflows/index.mjs";
import { buildSearchIndex, searchIndex } from "../../vendor/artisys/search/index.mjs";
import { MemoryStorage } from "../../vendor/artisys/storage/browser.mjs";
import { createCachePlan } from "../../vendor/artisys/pwa-runtime/index.mjs";
import { createStudyAnnotation } from "./adapters/annotations";
import { loadStudyPdf } from "./adapters/pdf";
import { createMotorCachePlan, resolvePwaRegistration } from "./adapters/pwa";
import { createStudySearch } from "./adapters/search";
import { validateStudyWorkflow } from "./adapters/workflows";

describe("Apple Utils vendored contracts", () => {
  it("loads and executes all seven module contracts", async () => {
    expect(validateDashboardLayout([{ id: "a", x: 0, y: 0, w: 1, h: 1 }])).toHaveLength(1);
    expect(normalizeHighlight({ id: "h", pageNumber: 1, rect: { x1: 0, y1: 0, x2: 1, y2: 1 } }).id).toBe("h");
    expect(normalizeAnnotation({ id: "n", targetType: "pdf", targetId: "demo", page: 1, geometry: { type: "rect", x: 0, y: 0, width: 1, height: 1 }, text: "ok" }).id).toBe("n");
    expect(validateWorkflow({ nodes: [{ id: "root", type: "topic" }], edges: [] }).nodes).toHaveLength(1);
    const index = buildSearchIndex([{ id: "limites", title: "Limites" }]);
    expect(searchIndex(index, "limite")[0]?.id).toBe("limites");
    const storage = new MemoryStorage();
    await storage.put("state", { ok: true });
    expect((await storage.get("state"))?.value).toEqual({ ok: true });
    expect(createCachePlan({ prefix: "motor-calculo", version: "2" }).cacheName).toBe("motor-calculo-2");
  });

  it("rejects a cyclic study workflow", () => {
    expect(() => validateStudyWorkflow({
      nodes: [{ id: "a", type: "topic" }, { id: "b", type: "topic" }],
      edges: [{ source: "a", target: "b" }, { source: "b", target: "a" }],
    })).toThrow("workflow contains a cycle");
  });

  it("finds topics and newly-added annotations", () => {
    const search = createStudySearch([{ id: "limites", title: "Limites", description: "Limites laterais" }]);
    expect(search.query("limite")[0]?.document.id).toBe("limites");
    search.replaceDocuments([
      { id: "limites", title: "Limites", description: "Limites laterais" },
      { id: "annotation:abc", title: "Anotação", description: "termo-unico-e2e" },
    ]);
    expect(search.query("termo-unico-e2e")[0]?.document.id).toBe("annotation:abc");
  });

  it("normalizes study annotations through artisys-annotations", () => {
    expect(createStudyAnnotation({ id: "a1", targetId: "calculo1-demo", page: 1, text: "limite" })).toMatchObject({
      id: "a1",
      targetType: "pdf",
      page: 1,
    });
  });

  it("reports page count from the Artisys PDF boundary", async () => {
    const pdfjs = { getDocument: () => ({ promise: Promise.resolve({ numPages: 3 }) }) };
    await expect(loadStudyPdf("/study/demo.pdf", pdfjs)).resolves.toEqual({ pages: 3, url: "/study/demo.pdf" });
  });

  it("propagates a readable PDF load failure", async () => {
    const pdfjs = { getDocument: () => ({ promise: Promise.reject(new Error("arquivo corrompido")) }) };
    await expect(loadStudyPdf("/study/bad.pdf", pdfjs)).rejects.toThrow("arquivo corrompido");
  });

  it("builds the Motor cache through artisys-pwa-runtime", () => {
    expect(createMotorCachePlan()).toMatchObject({ cacheName: "motor-calculo-2", offlineFallback: "/" });
    expect(createMotorCachePlan().shell).toContain("/study/calculo1-demo.pdf");
  });

  it("returns indisponível when service workers are unsupported", async () => {
    await expect(resolvePwaRegistration({ navigator: {} as Navigator })).resolves.toBe("indisponível");
  });
});
