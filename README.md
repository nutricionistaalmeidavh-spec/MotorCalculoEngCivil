# MotorCalculoEngCivil

MVP mobile-first para estudo de Cálculo 1 em Engenharia Civil.

## Entregas implementadas

1. **MVP matemático:** raízes, derivada, integral, limite, simplificação, fatoração, expansão e resolução de equações com SymPy.
2. **Gráfico interativo:** JSXGraph com pan, zoom/pinch e marcação de raízes reais finitas.
3. **Interface mobile:** layout responsivo pensado primeiro para celular, com entrada amigável (`x²`, `sen(x)`, `π`, `∞`) e resultados em KaTeX.

## Stack

- Vite + TypeScript
- SymPy 1.14.0 executando em Pyodide 314.0.7
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
python -m pip install "sympy==1.14.0" "mpmath==1.4.1"
python -m unittest discover -s tests -p "test_*.py"
npm run typecheck
npm run build
```

## Escopo atual

Ainda não inclui PWA, histórico, D1/R2, autenticação ou deploy Cloudflare. Esses itens pertencem às próximas entregas do roadmap.
