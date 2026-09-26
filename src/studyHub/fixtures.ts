import type { Workflow } from "../../vendor/artisys/workflows/index.mjs";
import type { StudySearchDocument, StudyTopic } from "./types";

export const STUDY_TOPICS: StudyTopic[] = [
  { id: "calculo-1", title: "Cálculo 1", description: "Visão geral: funções, limites, continuidade, derivadas e integrais.", example: "Use o mapa para navegar pelos conteúdos da disciplina." },
  { id: "funcoes", title: "Funções", description: "Domínio, imagem, zeros, composição e comportamento gráfico.", example: "f(x)=x²-4x+3 possui zeros em x=1 e x=3." },
  { id: "limites", title: "Limites", description: "Limites laterais, bilateral, no infinito e formas indeterminadas.", example: "lim x→2 (x²-4)/(x-2) = 4." },
  { id: "continuidade", title: "Continuidade", description: "Uma função é contínua quando limite e valor da função coincidem no ponto.", example: "Polinômios são contínuos em todo número real." },
  { id: "derivadas", title: "Derivadas", description: "Taxa de variação, reta tangente e regras de derivação.", example: "Se f(x)=x², então f'(x)=2x." },
  { id: "integrais", title: "Integrais", description: "Primitivas, integral definida e área orientada sob a curva.", example: "∫₀¹ x dx = 1/2." },
];

const topic = (id: string) => STUDY_TOPICS.find((item) => item.id === id)!;

export const STUDY_WORKFLOW: Workflow = {
  id: "calculo-1-study-map",
  nodes: STUDY_TOPICS.map((item) => ({
    id: item.id,
    type: "topic",
    data: { label: item.title, description: item.description, example: item.example },
  })),
  edges: [
    { id: "root-funcoes", source: "calculo-1", target: "funcoes" },
    { id: "root-limites", source: "calculo-1", target: "limites" },
    { id: "root-continuidade", source: "calculo-1", target: "continuidade" },
    { id: "root-derivadas", source: "calculo-1", target: "derivadas" },
    { id: "root-integrais", source: "calculo-1", target: "integrais" },
  ],
};

export const INITIAL_SEARCH_DOCUMENTS: StudySearchDocument[] = STUDY_TOPICS.map((item) => ({
  id: item.id,
  title: item.title,
  description: `${item.description} ${item.example}`,
  kind: "topic",
}));

export const DEMO_PDF_URL = "/study/calculo1-demo.pdf";
export const DEMO_PDF_ID = "calculo1-demo";

void topic;
