import type { StudyTopic } from './types';

export const STUDY_TOPICS: StudyTopic[] = [
  { id: 'limites.introducao', group: 'Limites', title: 'Introdução aos limites', summary: 'Comportamento de uma função quando a variável se aproxima de um valor.', essentials: [] },
  { id: 'limites.laterais', group: 'Limites', title: 'Limites laterais', summary: 'Comportamento pela esquerda e pela direita.', essentials: [] },
  { id: 'limites.propriedades', group: 'Limites', title: 'Propriedades de limites', summary: 'Regras algébricas aplicadas a limites existentes.', essentials: [] },
  { id: 'limites.fatoracao-cancelamento', group: 'Limites', title: 'Fatoração e cancelamento', summary: 'Remoção de indeterminações algébricas por fatoração.', essentials: [] },
  { id: 'limites.infinitos', group: 'Limites', title: 'Limites infinitos', summary: 'Casos em que a função cresce ou decresce sem limite.', essentials: [] },
  { id: 'limites.no-infinito', group: 'Limites', title: 'Limites no infinito', summary: 'Comportamento quando a variável tende a ±∞.', essentials: [] },
  { id: 'limites.assintotas', group: 'Limites', title: 'Assíntotas', summary: 'Relação entre limites e retas assintóticas.', essentials: [] },
  { id: 'limites.aplicacoes', group: 'Limites', title: 'Aplicações de limites', summary: 'Modelos e interpretações físicas ou contextuais.', essentials: [] },
  { id: 'continuidade.definicao', group: 'Continuidade', title: 'Definição de continuidade', summary: 'Condições para uma função ser contínua em um ponto.', essentials: [] },
  { id: 'continuidade.funcoes-por-partes', group: 'Continuidade', title: 'Funções por partes', summary: 'Continuidade nos pontos em que a lei da função muda.', essentials: [] },
  { id: 'continuidade.limites-laterais', group: 'Continuidade', title: 'Continuidade e limites laterais', summary: 'Comparação dos limites laterais com o valor da função.', essentials: [] },
  { id: 'continuidade.removivel', group: 'Continuidade', title: 'Descontinuidade removível', summary: 'Descontinuidade corrigível pela redefinição pontual da função.', essentials: [] },
  { id: 'continuidade.salto', group: 'Continuidade', title: 'Descontinuidade por salto', summary: 'Limites laterais finitos e diferentes.', essentials: [] },
  { id: 'continuidade.infinita', group: 'Continuidade', title: 'Descontinuidade infinita', summary: 'Comportamento não limitado próximo ao ponto.', essentials: [] },
  { id: 'derivadas.definicao-taxa-variacao', group: 'Derivadas', title: 'Derivada e taxa de variação', summary: 'Interpretação da derivada como taxa instantânea.', essentials: [] },
  { id: 'derivadas.linearidade', group: 'Derivadas', title: 'Linearidade da derivada', summary: 'Soma, diferença e multiplicação por constante.', essentials: [] },
  { id: 'derivadas.potencia', group: 'Derivadas', title: 'Regra da potência', summary: 'Derivação de potências da variável.', essentials: [] },
  { id: 'derivadas.produto', group: 'Derivadas', title: 'Regra do produto', summary: 'Derivação do produto de duas funções.', essentials: [] },
  { id: 'derivadas.quociente', group: 'Derivadas', title: 'Regra do quociente', summary: 'Derivação do quociente de duas funções.', essentials: [] },
  { id: 'derivadas.cadeia', group: 'Derivadas', title: 'Regra da cadeia', summary: 'Derivação de funções compostas.', essentials: [] },
  { id: 'derivadas.exponenciais-logaritmicas', group: 'Derivadas', title: 'Exponenciais e logarítmicas', summary: 'Regras de derivação para funções exponenciais e logarítmicas.', essentials: [] },
  { id: 'derivadas.trigonometricas', group: 'Derivadas', title: 'Derivadas trigonométricas', summary: 'Regras de derivação para seno, cosseno, tangente e relacionadas.', essentials: [] },
  { id: 'derivadas.implicita', group: 'Derivadas', title: 'Derivação implícita', summary: 'Derivação de relações em que y não está isolado.', essentials: [] },
  { id: 'derivadas.reta-tangente', group: 'Derivadas', title: 'Reta tangente', summary: 'Uso da derivada como inclinação da reta tangente.', essentials: [] },
];

export function getTopicById(id: string): StudyTopic | undefined {
  return STUDY_TOPICS.find((topic) => topic.id === id);
}
