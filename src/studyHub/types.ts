export interface StudyHubAnnotation {
  id: string;
  targetId: string;
  page: number;
  text: string;
}

export interface StudyHubState {
  selectedTopicId: string;
  progress: Record<string, boolean>;
  annotations: StudyHubAnnotation[];
}

export interface StudyTopic {
  id: string;
  title: string;
  description: string;
  example: string;
}

export interface StudySearchDocument {
  id: string;
  title: string;
  description: string;
  kind?: "topic" | "annotation";
}
