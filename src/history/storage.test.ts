import { describe, expect, it, vi } from "vitest";
import { buildHistoryEntry } from "./storage";

describe("buildHistoryEntry", () => {
  it("adds stable metadata around a calculation snapshot", () => {
    vi.spyOn(Date, "now").mockReturnValue(123456789);
    const entry = buildHistoryEntry({
      expression: "x² - 4x + 3",
      operation: "roots",
      variable: "x",
      resultText: "[1, 3]",
      exerciseId: "limite-computadores-x9",
      topicIds: ["limites.fatoracao-cancelamento", "limites.propriedades"],
      primaryTopicId: "limites.fatoracao-cancelamento",
      sourceMaterialId: "unidade2calc2",
    });

    expect(entry.createdAt).toBe(123456789);
    expect(entry.id).toBeTruthy();
    expect(entry.expression).toBe("x² - 4x + 3");
    expect(entry.resultText).toBe("[1, 3]");
    expect(entry.exerciseId).toBe("limite-computadores-x9");
    expect(entry.topicIds).toEqual(["limites.fatoracao-cancelamento", "limites.propriedades"]);
    expect(entry.primaryTopicId).toBe("limites.fatoracao-cancelamento");
    expect(entry.sourceMaterialId).toBe("unidade2calc2");
  });
});
