export type SupportedOperation =
  | 'analyze'
  | 'graph'
  | 'roots'
  | 'differentiate'
  | 'integrate'
  | 'limit'
  | 'simplify'
  | 'factor'
  | 'expand'
  | 'solve';

export interface ParsedQuestion {
  raw: string;
  expression: string;
  operation: SupportedOperation;
  target?: string;
  lower?: string;
  upper?: string;
}

const OPERATION_PATTERNS: Array<[SupportedOperation, RegExp]> = [
  ['limit', /\b(limite|lim\b|tende\s+a)\b/i],
  ['integrate', /\b(integral|integre|integrar|área\s+sob)\b/i],
  ['differentiate', /\b(derivada|derive|derivar|reta\s+tangente)\b/i],
  ['analyze', /\b(analise|análise|maxim|maxím|minim|mínim|cresce|decresce|concav|ponto[s]?\s+crític)\w*/i],
  ['roots', /\b(raiz|raízes|zeros?\s+da\s+função)\b/i],
  ['factor', /\b(fatore|fatorar|fatoração)\b/i],
  ['expand', /\b(expanda|expandir|expansão)\b/i],
  ['simplify', /\b(simplifique|simplificar|simplificação)\b/i],
  ['solve', /\b(resolva|resolver|solução\s+da\s+equação)\b/i],
  ['graph', /\b(gráfico|grafico|esboce|plote)\b/i],
];

function inferOperation(text: string): SupportedOperation {
  for (const [operation, pattern] of OPERATION_PATTERNS) {
    if (pattern.test(text)) return operation;
  }
  return 'analyze';
}

function extractAssignedExpression(text: string): string | undefined {
  const match = text.match(/[a-z]\s*\(\s*[a-z]\s*\)\s*=\s*(.+)$/i);
  const expression = match?.[1];
  if (!expression) return undefined;
  return expression
    .replace(/\s+(?:e\s+)?(?:encontre|calcule|determine|classifique|quando|para)\b.*$/i, '')
    .trim();
}

function extractLimitExpression(text: string): string | undefined {
  const match = text.match(/(?:limite|lim)\s+(?:de\s+)?(.+?)(?=\s+(?:quando\s+)?[a-z]\s+(?:tende\s+a|→)|$)/i);
  return match?.[1]?.trim();
}

function stripInstruction(text: string): string {
  return text
    .replace(/^(?:calcule|encontre|determine|resolva|derive|integre|analise|análise|esboce|plote)\s+/i, '')
    .replace(/^(?:a|o|as|os)\s+(?:derivada|integral|limite|gráfico|grafico|raízes|raizes)\s+(?:de|da|do)?\s*/i, '')
    .trim();
}

function extractExpression(text: string, operation: SupportedOperation): string {
  const assigned = extractAssignedExpression(text);
  if (assigned) return assigned;
  if (operation === 'limit') {
    const limitExpression = extractLimitExpression(text);
    if (limitExpression) return limitExpression;
  }
  return stripInstruction(text)
    .replace(/\s+(?:quando|onde)\s+[a-z]\s+(?:tende\s+a|→).*$/i, '')
    .trim();
}

export function parseQuestionInput(input: string): ParsedQuestion {
  const raw = input.trim().replace(/\s+/g, ' ');
  const operation = inferOperation(raw);
  const parsed: ParsedQuestion = {
    raw,
    operation,
    expression: extractExpression(raw, operation),
  };

  if (operation === 'limit') {
    const target = raw.match(/[a-z]\s*(?:tende\s+a|→)\s*([^\s,;.]+)/i)?.[1];
    if (target) parsed.target = target;
  }

  if (operation === 'integrate') {
    const bounds = raw.match(/(?:de|entre)\s+([^\s,]+)\s+(?:a|até|e)\s+([^\s,;.]+)/i);
    if (bounds) {
      parsed.lower = bounds[1];
      parsed.upper = bounds[2];
    }
  }

  return parsed;
}

export function topicForOperation(operation: SupportedOperation): string {
  const topics: Record<SupportedOperation, string> = {
    analyze: 'Análise de funções',
    graph: 'Gráficos',
    roots: 'Raízes e zeros',
    differentiate: 'Derivadas',
    integrate: 'Integrais',
    limit: 'Limites',
    simplify: 'Álgebra',
    factor: 'Fatoração',
    expand: 'Álgebra',
    solve: 'Equações',
  };
  return topics[operation];
}
