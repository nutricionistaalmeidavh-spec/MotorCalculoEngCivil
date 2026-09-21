const SUPERSCRIPTS: Record<string, string> = {
  "⁰": "0",
  "¹": "1",
  "²": "2",
  "³": "3",
  "⁴": "4",
  "⁵": "5",
  "⁶": "6",
  "⁷": "7",
  "⁸": "8",
  "⁹": "9",
};

const UNICODE_FRACTIONS: Record<string, string> = {
  "½": "(1/2)",
  "⅓": "(1/3)",
  "⅔": "(2/3)",
  "¼": "(1/4)",
  "¾": "(3/4)",
  "⅕": "(1/5)",
  "⅖": "(2/5)",
  "⅗": "(3/5)",
  "⅘": "(4/5)",
  "⅙": "(1/6)",
  "⅚": "(5/6)",
  "⅛": "(1/8)",
  "⅜": "(3/8)",
  "⅝": "(5/8)",
  "⅞": "(7/8)",
};

function replaceSuperscripts(input: string): string {
  let output = "";
  let exponent = "";

  const flushExponent = () => {
    if (exponent) {
      output += `^${exponent}`;
      exponent = "";
    }
  };

  for (const char of input) {
    const digit = SUPERSCRIPTS[char];
    if (digit !== undefined) {
      exponent += digit;
      continue;
    }
    flushExponent();
    output += char;
  }

  flushExponent();
  return output;
}

function replaceUnicodeFractions(input: string): string {
  return Array.from(input, (char) => UNICODE_FRACTIONS[char] ?? char).join("");
}

function replaceSimpleSquareRoots(input: string): string {
  return input
    .replace(/√\s*\(([^()]*)\)/g, "sqrt($1)")
    .replace(/√\s*([A-Za-z]+|[0-9]+(?:\.[0-9]+)?)/g, "sqrt($1)");
}

function replaceSimpleAbsoluteValues(input: string): string {
  return input.replace(/\|([^|]+)\|/g, "Abs($1)");
}

export function normalizeMathInput(input: string): string {
  const normalized = replaceSimpleAbsoluteValues(
    replaceSimpleSquareRoots(replaceUnicodeFractions(replaceSuperscripts(input))),
  );

  return normalized
    .trim()
    .replace(/[−–—]/g, "-")
    .replace(/[×·⋅]/g, "*")
    .replace(/÷/g, "/")
    .replace(/[{}[\]]/g, (token) => (token === "{" || token === "[" ? "(" : ")"))
    .replace(/π/g, "pi")
    .replace(/∞/g, "oo")
    .replace(/\bsen\s*\(/gi, "sin(")
    .replace(/\btg\s*\(/gi, "tan(")
    .replace(/\barctg\s*\(/gi, "atan(")
    .replace(/\barcsen\s*\(/gi, "asin(")
    .replace(/\be(?=\s*\^)/g, "E");
}
