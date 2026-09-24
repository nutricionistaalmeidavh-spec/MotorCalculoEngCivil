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
];
