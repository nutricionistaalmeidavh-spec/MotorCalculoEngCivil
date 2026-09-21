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
    });

    expect(entry.createdAt).toBe(123456789);
    expect(entry.id).toBeTruthy();
    expect(entry.expression).toBe("x² - 4x + 3");
    expect(entry.resultText).toBe("[1, 3]");
  });
});
