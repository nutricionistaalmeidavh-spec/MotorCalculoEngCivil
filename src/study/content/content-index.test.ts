import { describe, expect, it } from 'vitest';
import manifest from '../../../public/content/calculo1/manifest.json';
import { STUDY_EXERCISES } from './exercises';
import { STUDY_MATERIALS } from './materials';
import { STUDY_TOPICS } from './topics';

function unique(values: string[]): boolean {
  return new Set(values).size === values.length;
}

const MODULE4_TOPIC_IDS = [
  'derivadas.taxas-relacionadas',
  'derivadas.pontos-criticos-extremos',
  'derivadas.rolle-valor-medio',
  'derivadas.crescimento-decrescimento',
  'derivadas.teste-primeira-derivada',
  'derivadas.teste-segunda-derivada',
  'derivadas.concavidade-inflexao',
  'derivadas.otimizacao',
  'limites.lhospital',
];

const MODULE4_MATERIAL_IDS = [
  'mod4-aula1-taxas-relacionadas',
  'mod4-aula2-pontos-criticos',
  'mod4-aula3-otimizacao-testes',
  'mod4-aula4-lhospital',
  'mod4-aula5-encerramento',
  'mod4-unidade-completa',
];

const MODULE4_EXERCISE_IDS = [
  'taxa-bola-raio',
  'taxa-escada-base',
  'taxa-calha-nivel',
  'taxa-tanque-conico',
  'otimizacao-caixa-papelao',
  'otimizacao-lucro-maximo',
  'maximo-minimo-x-dois-tercos',
  'lhospital-cubica-menos-dois',
  'lhospital-infinito-linear',
  'lhospital-corrente-circuito',
];

describe('study content catalog', () => {
  it('uses unique topic ids', () => {
    expect(unique(STUDY_TOPICS.map((topic) => topic.id))).toBe(true);
  });

  it('registers the module 4 topics', () => {
    const topicIds = new Set(STUDY_TOPICS.map((topic) => topic.id));
    for (const topicId of MODULE4_TOPIC_IDS) expect(topicIds.has(topicId)).toBe(true);
  });

  it('uses unique material ids and valid topic references', () => {
    expect(unique(STUDY_MATERIALS.map((material) => material.id))).toBe(true);
    const topicIds = new Set(STUDY_TOPICS.map((topic) => topic.id));
    for (const material of STUDY_MATERIALS) {
      for (const topicId of material.topics) expect(topicIds.has(topicId)).toBe(true);
    }
  });

  it('registers the fifteen canonical source materials in the static manifest', () => {
    expect(STUDY_MATERIALS).toHaveLength(15);
    expect(manifest).toHaveLength(15);
    expect(unique(manifest.map((entry) => entry.id))).toBe(true);
    for (const material of STUDY_MATERIALS) {
      const entry = manifest.find((item) => item.id === material.id);
      expect(entry?.path).toBe(material.textPath);
      expect(entry?.originalFileName).toBe(material.originalFileName);
      expect(entry?.pages).toBe(material.pages);
    }
  });

  it('registers all six canonical module 4 materials', () => {
    const materialIds = new Set(STUDY_MATERIALS.map((material) => material.id));
    for (const materialId of MODULE4_MATERIAL_IDS) expect(materialIds.has(materialId)).toBe(true);
  });

  it('registers the twenty study exercises with valid content links', () => {
    expect(STUDY_EXERCISES).toHaveLength(20);
    expect(unique(STUDY_EXERCISES.map((exercise) => exercise.id))).toBe(true);
    const exerciseIds = new Set(STUDY_EXERCISES.map((exercise) => exercise.id));
    for (const exerciseId of MODULE4_EXERCISE_IDS) expect(exerciseIds.has(exerciseId)).toBe(true);

    const topicIds = new Set(STUDY_TOPICS.map((topic) => topic.id));
    const materialIds = new Set(STUDY_MATERIALS.map((material) => material.id));
    for (const exercise of STUDY_EXERCISES) {
      expect(topicIds.has(exercise.primaryTopicId)).toBe(true);
      expect(exercise.topicIds).toContain(exercise.primaryTopicId);
      expect(exercise.explanation.length).toBeGreaterThan(20);
      expect(exercise.relatedContentReason.length).toBeGreaterThan(10);
      for (const topicId of exercise.topicIds) expect(topicIds.has(topicId)).toBe(true);
      for (const ref of exercise.sourceRefs) if (ref.materialId) expect(materialIds.has(ref.materialId)).toBe(true);
      if (exercise.answerKind === 'single-choice' || exercise.answerKind === 'multi-choice') {
        expect(exercise.options?.length).toBeGreaterThan(1);
        const optionIds = new Set(exercise.options?.map((option) => option.id));
        for (const correctId of exercise.correctOptionIds ?? []) expect(optionIds.has(correctId)).toBe(true);
      } else {
        expect(exercise.expected?.length).toBeGreaterThan(0);
      }
    }
  });
});
