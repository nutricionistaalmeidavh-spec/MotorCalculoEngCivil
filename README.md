# MotorCalculoEngCivil

Aplicação mobile-first para estudo de Cálculo 1 em Engenharia Civil.

## Entregas implementadas

1. **MVP matemático:** raízes, derivada, integral, limite, simplificação, fatoração, expansão e resolução de equações com SymPy.
2. **Gráfico interativo:** JSXGraph com pan, zoom/pinch e marcação segura de raízes reais finitas.
3. **Interface mobile:** layout responsivo pensado primeiro para celular e resultados matemáticos em KaTeX.
4. **Entrada matemática amigável:** aceita notação como `x²`, `√x`, `|x|`, `½x`, `sen(x)`, `π`, `∞`, `e^x`, colchetes/chaves e atribuições como `f(x)=...`.
5. **Limites:** bilateral, esquerda, direita e infinito; no limite bilateral o sistema compara os dois lados e informa quando o limite não existe.
6. **Derivadas:** ordens de 1 a 5, gráfico da derivada e reta tangente opcional em um ponto.
7. **Integrais:** indefinidas e definidas; integrais definidas mostram aproximação quando útil e sombreiam o intervalo no gráfico quando os limites são reais e finitos.

## Stack

- Vite + TypeScript
- SymPy 1.14.0 executando em Pyodide 314.0.7
- mpmath 1.3.0
- JSXGraph 1.13.3
- KaTeX 0.18.7
- Vitest + `unittest`

O runtime de produção é **self-hosted**. O build copia o núcleo do Pyodide para `public/pyodide` e baixa wheels fixos de SymPy/mpmath para `public/python-packages`. O navegador publicado não depende de API matemática paga nem de CDN para executar cálculos.

## Desenvolvimento

Requisitos: Node.js 22+ e Python 3.14 para os testes do kernel.

```bash
npm install
npm run dev
```

O `postinstall` prepara os assets locais do runtime matemático.

## Verificação

```bash
npm test
python -m pip install "sympy==1.14.0" "mpmath==1.3.0"
python -m unittest discover -s tests -p "test_*.py"
npm run typecheck
npm run build
```

## Escopo atual

Ainda não inclui PWA, histórico, D1/R2, autenticação ou deploy Cloudflare. Esses itens pertencem às próximas entregas do roadmap.
