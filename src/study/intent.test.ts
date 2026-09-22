import { describe, expect, it } from "vitest";
import { parseQuestionInput, topicForOperation } from "./intent";

describe("parseQuestionInput", () => {
  it("detecta limite e extrai o ponto", () => {
    const parsed = parseQuestionInput("Calcule o limite de (x² - 4)/(x - 2) quando x tende a 2");
    expect(parsed.operation).toBe("limit");
    expect(parsed.target).toBe("2");
    expect(parsed.expression).toContain("x² - 4");
  });

  it("detecta derivada em pergunta textual", () => {
    const parsed = parseQuestionInput("Encontre a derivada de f(x)=x³-3x");
    expect(parsed.operation).toBe("differentiate");
    expect(parsed.expression).toBe("x³-3x");
  });

  it("detecta análise completa por máximos e mínimos", () => {
    const parsed = parseQuestionInput("Analise f(x)=x³-3x e encontre máximos e mínimos");
    expect(parsed.operation).toBe("analyze");
    expect(topicForOperation(parsed.operation)).toBe("Análise de funções");
  });

  it("usa análise como padrão para expressão pura", () => {
    const parsed = parseQuestionInput("x² - 4x + 3");
    expect(parsed.operation).toBe("analyze");
    expect(parsed.expression).toBe("x² - 4x + 3");
  });
});
