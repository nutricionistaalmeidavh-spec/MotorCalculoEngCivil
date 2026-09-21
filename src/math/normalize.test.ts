import { describe, expect, it } from "vitest";
import { normalizeMathInput } from "./normalize";

describe("normalizeMathInput", () => {
  it("converts common handwritten notation", () => {
    expect(normalizeMathInput("x² − 4x + 3")).toBe("x^2 - 4x + 3");
  });

  it("accepts Portuguese trig names and pi", () => {
    expect(normalizeMathInput("sen(π*x) + tg(x)")).toBe("sin(pi*x) + tan(x)");
  });

  it("converts multiplication, division and infinity symbols", () => {
    expect(normalizeMathInput("2·x ÷ 4 + ∞")).toBe("2*x / 4 + oo");
  });

  it("converts multi-digit superscripts", () => {
    expect(normalizeMathInput("x¹² + x³")).toBe("x^12 + x^3");
  });
});
