export type AnswerKind = 'expression' | 'single-choice' | 'multi-choice' | 'text';
export type StudyDifficulty = 'basico' | 'intermediario' | 'avancado';

export interface StudyTopic {
  id: string;
  group: 'Limites' | 'Continuidade' | 'Derivadas';
  title: string;
  summary: string;
  essentials: string[];
}

export interface StudyMaterial {
  id: string;
  title: string;
  originalFileName: string;
  topics: string[];
  textPath: string;
  textParts?: string[];
  pdfPath?: string;
  pages?: number;
  notes?: string[];
}

export interface StudyExerciseOption {
  id: string;
  label: string;
}

export interface StudyExercise {
  id: string;
  origin: 'usuario' | 'material';
  prompt: string;
  expression?: string;
  operation: 'limit' | 'differentiate' | 'integrate' | 'analyze';
  answerKind: AnswerKind;
  options?: StudyExerciseOption[];
  correctOptionIds?: string[];
  expected?: string;
  acceptedAnswers?: string[];
  explanation: string;
  relatedContentReason: string;
  topicIds: string[];
  primaryTopicId: string;
  difficulty: StudyDifficulty;
  sourceRefs: Array<{ materialId?: string; page?: number; imageName?: string }>;
  tags: string[];
  warning?: string;
  target?: string;
  direction?: '+' | '-' | '+-';
  lower?: string;
  upper?: string;
}
