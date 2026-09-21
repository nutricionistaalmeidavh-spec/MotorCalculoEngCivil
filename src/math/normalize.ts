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

export function normalizeMathInput(input: string): string {
  return replaceSuperscripts(input)
    .trim()
    .replace(/[−–—]/g, "-")
    .replace(/[×·]/g, "*")
    .replace(/÷/g, "/")
    .replace(/π/g, "pi")
    .replace(/∞/g, "oo")
    .replace(/√\s*\(/g, "sqrt(")
    .replace(/\bsen\s*\(/gi, "sin(")
    .replace(/\btg\s*\(/gi, "tan(");
}
