import json
import re

import sympy as sp
from sympy.parsing.sympy_parser import (
    convert_xor,
    implicit_multiplication_application,
    parse_expr,
    standard_transformations,
)
from sympy.printing.jscode import jscode

MAX_EXPRESSION_LENGTH = 300
SAFE_CHARS = re.compile(r"^[0-9A-Za-z+\-*/^().,=\s]+$")
IDENTIFIER = re.compile(r"[A-Za-z]+")
TRANSFORMATIONS = standard_transformations + (
    implicit_multiplication_application,
    convert_xor,
)

SAFE_FUNCTIONS = {
    "sin": sp.sin,
    "cos": sp.cos,
    "tan": sp.tan,
    "asin": sp.asin,
    "acos": sp.acos,
    "atan": sp.atan,
    "sinh": sp.sinh,
    "cosh": sp.cosh,
    "tanh": sp.tanh,
    "sqrt": sp.sqrt,
    "exp": sp.exp,
    "log": sp.log,
    "ln": sp.log,
    "Abs": sp.Abs,
    "abs": sp.Abs,
    "pi": sp.pi,
    "E": sp.E,
    "oo": sp.oo,
}


def _strip_function_assignment(text: str, variable: str) -> str:
    match = re.match(rf"^\s*[A-Za-z]\s*\(\s*{re.escape(variable)}\s*\)\s*=\s*(.+)$", text)
    return match.group(1) if match else text


def _validate_text(text: str, variables: set[str]) -> None:
    if not text or len(text) > MAX_EXPRESSION_LENGTH:
        raise ValueError("A expressão deve ter entre 1 e 300 caracteres.")
    if not SAFE_CHARS.fullmatch(text):
        raise ValueError("A expressão contém caracteres não permitidos.")
    if "__" in text:
        raise ValueError("Identificador não permitido.")

    allowed = set(SAFE_FUNCTIONS) | variables
    unknown = {name for name in IDENTIFIER.findall(text) if name not in allowed}
    if unknown:
        names = ", ".join(sorted(unknown))
        raise ValueError(f"Identificador não reconhecido: {names}.")


def _locals(variables: set[str]) -> dict[str, object]:
    result = dict(SAFE_FUNCTIONS)
    for name in variables:
        result[name] = sp.Symbol(name, real=True)
    return result


def _parse_scalar(text: str, variables: set[str]):
    text = text.strip()
    _validate_text(text, variables)
    return parse_expr(
        text,
        local_dict=_locals(variables),
        transformations=TRANSFORMATIONS,
        evaluate=True,
    )


def _parse_expression(text: str, variable: str):
    variables = {variable, "x", "y", "t"}
    text = _strip_function_assignment(text.strip(), variable)
    if "=" in text:
        left, right = text.split("=", 1)
        return sp.Eq(_parse_scalar(left, variables), _parse_scalar(right, variables))
    return _parse_scalar(text, variables)


def _as_expression(parsed):
    if isinstance(parsed, sp.Equality):
        return sp.simplify(parsed.lhs - parsed.rhs)
    return parsed


def _finite_real_roots(expr, variable):
    if not expr.is_polynomial(variable):
        return []

    try:
        candidates = sp.solve(sp.Eq(expr, 0), variable)
    except Exception:
        return []

    roots = []
    for candidate in candidates:
        if candidate.is_real is True and candidate.is_finite is True:
            try:
                roots.append({
                    "exact": str(candidate),
                    "latex": sp.latex(candidate),
                    "numeric": float(sp.N(candidate, 12)),
                })
            except (TypeError, ValueError):
                continue
    return roots


def _latex_list(values):
    return r"\left\{" + ", ".join(sp.latex(value) for value in values) + r"\right\}"


def _parse_target(target: str, variable: str):
    normalized = target.strip().replace("∞", "oo")
    if normalized in {"+oo", "oo"}:
        return sp.oo
    if normalized == "-oo":
        return -sp.oo
    return _parse_scalar(normalized, {variable})


def calculate_json(
    operation: str,
    expression: str,
    variable: str = "x",
    target: str = "0",
    direction: str = "+-",
    lower: str = "",
    upper: str = "",
) -> str:
    variable = variable.strip() or "x"
    if not re.fullmatch(r"[A-Za-z]", variable):
        raise ValueError("Use uma única letra como variável.")

    parsed = _parse_expression(expression, variable)
    expr = _as_expression(parsed)
    symbol = sp.Symbol(variable, real=True)
    roots = _finite_real_roots(expr, symbol)

    payload = {
        "operation": operation,
        "input_latex": sp.latex(parsed),
        "result_latex": "",
        "result_text": "",
        "graph_js": "",
        "roots": roots,
        "warnings": [],
    }

    try:
        payload["graph_js"] = jscode(expr)
    except Exception:
        payload["warnings"].append("Esta expressão não pôde ser convertida para o gráfico interativo.")

    if operation == "graph":
        result = expr
        payload["result_latex"] = sp.latex(result)
        payload["result_text"] = str(result)
    elif operation == "roots":
        result = sp.solve(sp.Eq(expr, 0), symbol)
        payload["result_latex"] = _latex_list(result)
        payload["result_text"] = str(result)
    elif operation == "differentiate":
        result = sp.diff(expr, symbol)
        payload["result_latex"] = sp.latex(result)
        payload["result_text"] = str(result)
    elif operation == "integrate":
        if bool(lower.strip()) != bool(upper.strip()):
            raise ValueError("Informe os dois limites da integral definida ou deixe ambos vazios.")
        if lower.strip() and upper.strip():
            lo = _parse_scalar(lower, {variable})
            hi = _parse_scalar(upper, {variable})
            result = sp.integrate(expr, (symbol, lo, hi))
            payload["result_latex"] = sp.latex(result)
            payload["result_text"] = str(result)
        else:
            result = sp.integrate(expr, symbol)
            payload["result_latex"] = sp.latex(result) + r" + C"
            payload["result_text"] = f"{result} + C"
    elif operation == "limit":
        if direction not in {"+", "-", "+-"}:
            raise ValueError("Direção de limite inválida.")
        point = _parse_target(target, variable)
        result = sp.limit(expr, symbol, point, dir=direction)
        payload["result_latex"] = sp.latex(result)
        payload["result_text"] = str(result)
    elif operation == "simplify":
        result = sp.simplify(expr)
        payload["result_latex"] = sp.latex(result)
        payload["result_text"] = str(result)
    elif operation == "factor":
        result = sp.factor(expr)
        payload["result_latex"] = sp.latex(result)
        payload["result_text"] = str(result)
    elif operation == "expand":
        result = sp.expand(expr)
        payload["result_latex"] = sp.latex(result)
        payload["result_text"] = str(result)
    elif operation == "solve":
        if isinstance(parsed, sp.Equality):
            result = sp.solve(parsed, symbol)
        else:
            result = sp.solve(sp.Eq(expr, 0), symbol)
        payload["result_latex"] = _latex_list(result)
        payload["result_text"] = str(result)
    else:
        raise ValueError("Operação não suportada.")

    return json.dumps(payload, ensure_ascii=False)
