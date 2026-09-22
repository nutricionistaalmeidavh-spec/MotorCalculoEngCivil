# Loaded after kernel.py in the same Pyodide global namespace.
_base_calculate_json = calculate_json


def _study_step(label, latex, text):
    return {"label": label, "latex": latex, "text": text}


def _study_real_set(relation, symbol):
    try:
        return sp.solve_univariate_inequality(relation, symbol, relational=False)
    except Exception:
        return sp.EmptySet


def _study_analysis(expression, variable):
    parsed = _parse_expression(expression, variable)
    expr = _as_expression(parsed)
    symbol = sp.Symbol(variable, real=True)
    roots = _finite_real_roots(expr, symbol)
    derivative = sp.simplify(sp.diff(expr, symbol))
    second = sp.simplify(sp.diff(expr, symbol, 2))

    try:
        domain = sp.calculus.util.continuous_domain(expr, symbol, sp.S.Reals)
    except Exception:
        domain = sp.S.Reals

    try:
        critical = [
            value for value in sp.solve(sp.Eq(derivative, 0), symbol)
            if value.is_real is True and value.is_finite is True
        ]
    except Exception:
        critical = []

    increasing = _study_real_set(derivative > 0, symbol)
    decreasing = _study_real_set(derivative < 0, symbol)
    concave_up = _study_real_set(second > 0, symbol)
    concave_down = _study_real_set(second < 0, symbol)

    try:
        inflections = [
            value for value in sp.solve(sp.Eq(second, 0), symbol)
            if value.is_real is True and value.is_finite is True
        ]
    except Exception:
        inflections = []

    extrema = []
    graph_points = []
    for point in critical:
        y_value = sp.simplify(expr.subs(symbol, point))
        second_value = sp.simplify(second.subs(symbol, point))
        kind = "Ponto crítico"
        if second_value.is_positive is True:
            kind = "Mínimo local"
        elif second_value.is_negative is True:
            kind = "Máximo local"
        extrema.append((kind, point, y_value))
        x_number = _finite_float(point)
        y_number = _finite_float(y_value)
        if x_number is not None and y_number is not None:
            graph_points.append({
                "kind": "critical",
                "label": f"{kind}: x = {point}",
                "x": x_number,
                "y": y_number,
            })

    for point in inflections:
        y_value = sp.simplify(expr.subs(symbol, point))
        x_number = _finite_float(point)
        y_number = _finite_float(y_value)
        if x_number is not None and y_number is not None:
            graph_points.append({
                "kind": "inflection",
                "label": f"Inflexão: x = {point}",
                "x": x_number,
                "y": y_number,
            })

    root_values = []
    for root in roots:
        try:
            root_values.append(sp.sympify(root["exact"]))
        except Exception:
            pass

    if extrema:
        extrema_text = "; ".join(
            f"{kind} em x={point}, f(x)={value}"
            for kind, point, value in extrema
        )
        extrema_latex = r"\begin{aligned}" + r"\\".join(
            rf"\text{{{kind}}}:\ x={sp.latex(point)},\ f(x)={sp.latex(value)}"
            for kind, point, value in extrema
        ) + r"\end{aligned}"
    else:
        extrema_text = "Nenhum extremo local classificado pelo teste da segunda derivada."
        extrema_latex = r"\text{Nenhum extremo local classificado}"

    details = [
        _detail("Domínio", domain),
        _detail("Raízes", sp.FiniteSet(*root_values) if root_values else sp.EmptySet),
        _detail("Primeira derivada", derivative),
        {"label": "Pontos críticos", "latex": _latex_list(critical), "text": str(critical)},
        _detail("Cresce em", increasing),
        _detail("Decresce em", decreasing),
        {"label": "Extremos locais", "latex": extrema_latex, "text": extrema_text},
        _detail("Segunda derivada", second),
        _detail("Côncava para cima em", concave_up),
        _detail("Côncava para baixo em", concave_down),
        {"label": "Possíveis pontos de inflexão", "latex": _latex_list(inflections), "text": str(inflections)},
    ]
    steps = [
        _study_step("Identificar a operação", sp.latex(parsed), "Vamos analisar a função completa."),
        _study_step("Derivar a função", sp.latex(derivative), "Calcule f′(x) para localizar pontos críticos e estudar crescimento."),
        _study_step("Resolver f′(x) = 0", _latex_list(critical), "Os zeros reais de f′(x) são candidatos a extremos."),
        _study_step("Estudar o sinal de f′(x)", sp.latex(increasing), "Onde f′(x)>0 a função cresce; onde f′(x)<0 ela decresce."),
        _study_step("Calcular a segunda derivada", sp.latex(second), "Use f″(x) para estudar concavidade e classificar extremos."),
    ]
    return parsed, expr, roots, details, steps, graph_points


def _study_steps_for(operation, expression, variable, payload, target, lower, upper):
    parsed = _parse_expression(expression, variable)
    steps = [_study_step(
        "Identificar a operação",
        sp.latex(parsed),
        f"A expressão foi interpretada para a operação {operation}.",
    )]
    result_latex = payload.get("result_latex", "")

    if operation == "differentiate":
        steps.append(_study_step("Aplicar as regras de derivação", result_latex, "Derive em relação à variável principal."))
        steps.append(_study_step("Simplificar o resultado", result_latex, "Organize a expressão final da derivada."))
    elif operation == "limit":
        point = _parse_target(target, variable)
        steps.append(_study_step("Identificar o ponto de aproximação", sp.latex(point), f"Observe o comportamento quando {variable} se aproxima desse ponto."))
        for detail in payload.get("details", []):
            steps.append(_study_step(detail["label"], detail["latex"], "Compare os comportamentos laterais quando necessário."))
        steps.append(_study_step("Concluir o limite", result_latex, "Use os limites calculados para concluir."))
    elif operation == "integrate":
        steps.append(_study_step("Identificar o integrando", sp.latex(_as_expression(parsed)), "Integre em relação à variável principal."))
        if lower.strip() and upper.strip():
            steps.append(_study_step("Aplicar os limites de integração", result_latex, f"Avalie no intervalo de {lower} até {upper}."))
        else:
            steps.append(_study_step("Encontrar uma primitiva", result_latex, "Some a constante de integração C ao final."))
    elif operation == "roots":
        steps.append(_study_step("Igualar a função a zero", sp.latex(sp.Eq(_as_expression(parsed), 0)), "As raízes satisfazem f(x)=0."))
        steps.append(_study_step("Resolver a equação", result_latex, "Liste as soluções encontradas."))
    else:
        steps.append(_study_step("Calcular", result_latex, "Aplique a transformação matemática escolhida."))
    return steps


def answers_equivalent(expected: str, answer: str, variable: str = "x") -> bool:
    expected_expr = _as_expression(_parse_expression(expected, variable))
    answer_expr = _as_expression(_parse_expression(answer, variable))
    try:
        return sp.simplify(expected_expr - answer_expr) == 0
    except Exception:
        return False


def calculate_json(operation, expression, variable="x", target="0", direction="+-", lower="", upper="", derivative_order=1, tangent_point=""):
    variable = variable.strip() or "x"
    if operation == "analyze":
        parsed, expr, roots, details, steps, graph_points = _study_analysis(expression, variable)
        payload = {
            "operation": operation,
            "input_latex": sp.latex(parsed),
            "result_latex": sp.latex(expr),
            "result_text": "análise concluída",
            "graph_js": _to_js(expr),
            "roots": roots,
            "warnings": [],
            "details": details,
            "steps": steps,
            "graph_overlays": [],
            "graph_points": graph_points,
            "integral_region": None,
        }
        if not payload["graph_js"]:
            payload["warnings"].append("Esta expressão não pôde ser convertida para o gráfico interativo.")
        return json.dumps(payload, ensure_ascii=False)

    raw = _base_calculate_json(
        operation, expression, variable, target, direction, lower, upper,
        derivative_order, tangent_point,
    )
    payload = json.loads(raw)
    payload["steps"] = _study_steps_for(
        operation, expression, variable, payload, target, lower, upper,
    )
    payload["graph_points"] = []
    return json.dumps(payload, ensure_ascii=False)
