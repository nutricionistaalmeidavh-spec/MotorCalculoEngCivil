import type { StudyMaterial } from './types';

export const STUDY_MATERIALS: StudyMaterial[] = [
  { id: 'slid-aula5-unid4', title: 'Derivadas — encerramento', originalFileName: 'SlidAula5unid4calc1.pdf', pages: 10, topics: ['derivadas.definicao-taxa-variacao','derivadas.produto','derivadas.quociente','derivadas.cadeia','derivadas.implicita','derivadas.reta-tangente'], textPath: '/content/calculo1/materials/slid-aula5-unid4.md' },
  { id: 'aula5-mod2', title: 'Limites — encerramento', originalFileName: 'Aula5mod2calc1.pdf', pages: 9, topics: ['limites.introducao','limites.laterais','limites.propriedades','limites.infinitos','limites.no-infinito','limites.assintotas','continuidade.definicao','continuidade.removivel','continuidade.salto','continuidade.infinita'], textPath: '/content/calculo1/materials/aula5-mod2.md' },
  { id: 'aula3-mod3', title: 'Derivação implícita', originalFileName: 'Aula3slidmod3calc1.pdf', pages: 9, topics: ['derivadas.implicita','derivadas.cadeia','derivadas.reta-tangente'], textPath: '/content/calculo1/materials/aula3-mod3.md' },
  { id: 'slides-aula4-mod2', title: 'Continuidade de funções', originalFileName: 'SlidesAula4Mod2Calc1.pdf', pages: 9, topics: ['continuidade.definicao','continuidade.removivel','continuidade.salto','continuidade.infinita'], textPath: '/content/calculo1/materials/slides-aula4-mod2.md' },
  { id: 'aula3-unid3', title: 'Produto, quociente e cadeia', originalFileName: 'Aula3unid3slidcalc1.pdf', pages: 10, topics: ['derivadas.produto','derivadas.quociente','derivadas.cadeia'], textPath: '/content/calculo1/materials/aula3-unid3.md' },
  { id: 'slides-unidade2', title: 'Limites infinitos e no infinito', originalFileName: 'SlidesUnidade2Calc1.pdf', pages: 10, topics: ['limites.infinitos','limites.no-infinito','limites.assintotas'], textPath: '/content/calculo1/materials/slides-unidade2.md' },
  { id: 'mod3-aula3', title: 'Regras básicas de derivação', originalFileName: 'Mod3slidaula3calc1.pdf', pages: 9, topics: ['derivadas.linearidade','derivadas.potencia','derivadas.exponenciais-logaritmicas','derivadas.trigonometricas'], textPath: '/content/calculo1/materials/mod3-aula3.md' },
  { id: 'slides-aula3-mod2', title: 'Estratégias para cálculo de limites', originalFileName: 'SlidesAula3Mod2.pdf', pages: 10, topics: ['limites.propriedades','limites.fatoracao-cancelamento','limites.no-infinito'], textPath: '/content/calculo1/materials/slides-aula3-mod2.md' },
  {
    id: 'unidade2calc2', title: 'Unidade 2 — Limites de Funções', originalFileName: 'Unidade2calc2.pdf', pages: 78,
    topics: ['limites.introducao','limites.laterais','limites.propriedades','limites.fatoracao-cancelamento','limites.infinitos','limites.no-infinito','limites.assintotas','limites.aplicacoes','continuidade.definicao','continuidade.funcoes-por-partes','continuidade.limites-laterais','continuidade.removivel','continuidade.salto','continuidade.infinita'],
    textPath: '/content/calculo1/materials/unidade2calc2.md',
    textParts: [
      '/content/calculo1/materials/unidade2calc2-p01-20.md',
      '/content/calculo1/materials/unidade2calc2-p21-40.md',
      '/content/calculo1/materials/unidade2calc2-p41-60.md',
      '/content/calculo1/materials/unidade2calc2-p61-78.md',
    ],
  },
  {
    id: 'mod4-aula1-taxas-relacionadas', title: 'Módulo 4 — Taxas relacionadas', originalFileName: 'Slidaula1mod4cal1.pdf', pages: 7,
    topics: ['derivadas.taxas-relacionadas','derivadas.definicao-taxa-variacao','derivadas.cadeia'],
    textPath: '/content/calculo1/materials/mod4-aula1-taxas-relacionadas.md',
    pdfPath: '/content/calculo1/pdfs/mod4/Slidaula1mod4cal1.pdf',
    notes: ['Aula1mod4slidunid4.pdf é uma cópia binariamente idêntica desta fonte e foi preservada na pasta de PDFs sem duplicar o item pedagógico.'],
  },
  {
    id: 'mod4-aula2-pontos-criticos', title: 'Módulo 4 — Pontos críticos, máximos e mínimos', originalFileName: 'Aula2calc1mod4slid.pdf', pages: 9,
    topics: ['derivadas.pontos-criticos-extremos','derivadas.rolle-valor-medio'],
    textPath: '/content/calculo1/materials/mod4-aula2-pontos-criticos.md',
    pdfPath: '/content/calculo1/pdfs/mod4/Aula2calc1mod4slid.pdf',
  },
  {
    id: 'mod4-aula3-otimizacao-testes', title: 'Módulo 4 — Otimização e testes das derivadas', originalFileName: 'Aula3slidcalc1mod4.pdf', pages: 9,
    topics: ['derivadas.crescimento-decrescimento','derivadas.teste-primeira-derivada','derivadas.teste-segunda-derivada','derivadas.concavidade-inflexao','derivadas.otimizacao'],
    textPath: '/content/calculo1/materials/mod4-aula3-otimizacao-testes.md',
    pdfPath: '/content/calculo1/pdfs/mod4/Aula3slidcalc1mod4.pdf',
  },
  {
    id: 'mod4-aula4-lhospital', title: 'Módulo 4 — Regra de L’Hospital', originalFileName: 'Slideaula4mod4cal1.pdf', pages: 8,
    topics: ['limites.lhospital','limites.laterais','limites.no-infinito'],
    textPath: '/content/calculo1/materials/mod4-aula4-lhospital.md',
    pdfPath: '/content/calculo1/pdfs/mod4/Slideaula4mod4cal1.pdf',
  },
  {
    id: 'mod4-aula5-encerramento', title: 'Módulo 4 — Encerramento e revisão', originalFileName: 'Aula5mod4calc1slides.pdf', pages: 9,
    topics: ['derivadas.taxas-relacionadas','derivadas.pontos-criticos-extremos','derivadas.otimizacao','derivadas.teste-primeira-derivada','derivadas.teste-segunda-derivada','limites.lhospital'],
    textPath: '/content/calculo1/materials/mod4-aula5-encerramento.md',
    pdfPath: '/content/calculo1/pdfs/mod4/Aula5mod4calc1slides.pdf',
  },
  {
    id: 'mod4-unidade-completa', title: 'Unidade 4 — Aplicações das Derivadas', originalFileName: 'Mod4cal1.pdf', pages: 64,
    topics: ['derivadas.taxas-relacionadas','derivadas.pontos-criticos-extremos','derivadas.rolle-valor-medio','derivadas.crescimento-decrescimento','derivadas.teste-primeira-derivada','derivadas.teste-segunda-derivada','derivadas.concavidade-inflexao','derivadas.otimizacao','limites.lhospital'],
    textPath: '/content/calculo1/materials/mod4-unidade-completa.md',
    textParts: [
      '/content/calculo1/materials/mod4-unidade-completa-p01-13.md',
      '/content/calculo1/materials/mod4-unidade-completa-p14-29.md',
      '/content/calculo1/materials/mod4-unidade-completa-p30-46.md',
      '/content/calculo1/materials/mod4-unidade-completa-p47-64.md',
    ],
    pdfPath: '/content/calculo1/pdfs/mod4/Mod4cal1.pdf',
  },
];
