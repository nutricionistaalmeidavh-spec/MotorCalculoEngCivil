import { listHistory, type HistoryEntry } from '../history/storage';
import { STUDY_EXERCISES } from './content/exercises';
import { STUDY_MATERIALS } from './content/materials';
import { STUDY_TOPICS, getTopicById } from './content/topics';
import type { StudyMaterial, StudyTopic } from './content/types';
import { loadStudyMaterialText } from './material-loader';
import {
  buildTopicProgress,
  filterExercisesByStatus,
  getExercisesForTopic,
  getMaterialsForTopic,
  type ReviewStatusFilter,
} from './review';

function get<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Elemento #${id} não encontrado.`);
  return element as T;
}

export interface ReviewController {
  selectTopic(topicId: string): void;
  refresh(): Promise<void>;
}

export function mountReviewController(): ReviewController {
  const topicList = get<HTMLElement>('review-topic-list');
  const detailGroup = get<HTMLParagraphElement>('review-detail-group');
  const detailTitle = get<HTMLHeadingElement>('review-detail-title');
  const detailSummary = get<HTMLParagraphElement>('review-detail-summary');
  const essentials = get<HTMLUListElement>('review-essentials');
  const progressBox = get<HTMLDivElement>('review-progress');
  const practiceButton = get<HTMLButtonElement>('review-practice');
  const exerciseList = get<HTMLDivElement>('review-exercises');
  const materialList = get<HTMLDivElement>('review-materials');
  const materialState = get<HTMLDivElement>('review-material-state');
  const materialViewer = get<HTMLElement>('review-material-viewer');
  const materialTitle = get<HTMLHeadingElement>('review-material-title');
  const materialText = get<HTMLPreElement>('review-material-text');

  let groupFilter: 'all' | StudyTopic['group'] = 'all';
  let statusFilter: ReviewStatusFilter = 'all';
  let selectedTopicId = STUDY_TOPICS[0]?.id ?? '';
  let history: HistoryEntry[] = [];
  let materialRequest = 0;

  function currentTopic(): StudyTopic | undefined {
    return getTopicById(selectedTopicId);
  }

  function setPressed(selector: string, active: HTMLElement): void {
    for (const button of document.querySelectorAll<HTMLButtonElement>(selector)) {
      const pressed = button === active;
      button.classList.toggle('active', pressed);
      button.setAttribute('aria-pressed', String(pressed));
    }
  }

  function renderTopicList(): void {
    const visibleTopics = groupFilter === 'all' ? STUDY_TOPICS : STUDY_TOPICS.filter((topic) => topic.group === groupFilter);
    topicList.replaceChildren();

    if (!visibleTopics.some((topic) => topic.id === selectedTopicId) && visibleTopics[0]) {
      selectedTopicId = visibleTopics[0].id;
    }

    for (const topic of visibleTopics) {
      const progress = buildTopicProgress(topic.id, STUDY_EXERCISES, history);
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `review-topic-button${topic.id === selectedTopicId ? ' active' : ''}`;
      button.setAttribute('aria-pressed', String(topic.id === selectedTopicId));
      const title = document.createElement('strong');
      title.textContent = topic.title;
      const meta = document.createElement('span');
      meta.textContent = `${topic.group} · ${progress.totalExercises} questão(ões) · ${progress.correct} acerto(s)`;
      button.append(title, meta);
      button.addEventListener('click', () => selectTopic(topic.id));
      topicList.append(button);
    }
  }

  function renderEssentials(topic: StudyTopic): void {
    essentials.replaceChildren();
    for (const item of topic.essentials) {
      const li = document.createElement('li');
      li.textContent = item;
      essentials.append(li);
    }
  }

  function latestAttemptFor(exerciseId: string): HistoryEntry | undefined {
    return history
      .filter((entry) => entry.exerciseId === exerciseId)
      .sort((a, b) => b.createdAt - a.createdAt)[0];
  }

  function renderExercises(topic: StudyTopic): void {
    const related = getExercisesForTopic(STUDY_EXERCISES, topic.id);
    const filtered = filterExercisesByStatus(related, history, statusFilter);
    exerciseList.replaceChildren();

    if (!filtered.length) {
      const empty = document.createElement('p');
      empty.className = 'empty-state';
      empty.textContent = statusFilter === 'all' ? 'Nenhuma questão cadastrada neste tópico.' : 'Nenhuma questão corresponde a este filtro.';
      exerciseList.append(empty);
      return;
    }

    for (const exercise of filtered) {
      const card = document.createElement('article');
      card.className = 'review-exercise-card';
      const heading = document.createElement('h5');
      heading.textContent = exercise.prompt;
      const meta = document.createElement('p');
      meta.className = 'section-copy';
      const latest = latestAttemptFor(exercise.id);
      const status = latest?.outcome === 'correct' ? 'Última resposta: correta' : latest?.outcome === 'incorrect' ? 'Última resposta: incorreta' : 'Ainda não respondida';
      meta.textContent = `${exercise.difficulty} · ${status}`;
      const relation = document.createElement('p');
      relation.textContent = exercise.relatedContentReason;
      const details = document.createElement('details');
      const summary = document.createElement('summary');
      summary.textContent = 'Ver resolução cadastrada';
      const explanation = document.createElement('p');
      explanation.textContent = exercise.explanation;
      details.append(summary, explanation);
      if (exercise.warning) {
        const warning = document.createElement('p');
        warning.className = 'warnings';
        warning.textContent = exercise.warning;
        details.append(warning);
      }
      card.append(heading, meta, relation, details);
      exerciseList.append(card);
    }
  }

  async function openMaterial(material: StudyMaterial): Promise<void> {
    const requestId = ++materialRequest;
    materialState.textContent = `Carregando ${material.originalFileName}…`;
    materialViewer.hidden = true;
    try {
      const text = await loadStudyMaterialText(material);
      if (requestId !== materialRequest) return;
      materialTitle.textContent = material.title;
      materialText.textContent = text;
      materialViewer.hidden = false;
      materialState.textContent = `${material.originalFileName} · ${material.pages ?? '?'} página(s) · texto extraído da fonte`;
      materialText.focus();
    } catch (error) {
      if (requestId !== materialRequest) return;
      materialState.textContent = error instanceof Error ? error.message : 'Não foi possível carregar o material.';
    }
  }

  function renderMaterials(topic: StudyTopic): void {
    const materials = getMaterialsForTopic(STUDY_MATERIALS, topic.id);
    materialList.replaceChildren();
    materialViewer.hidden = true;
    materialState.textContent = materials.length ? 'Abra um material para ler o texto integral extraído.' : 'Nenhum material relacionado foi cadastrado.';

    for (const material of materials) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'review-material-button';
      const title = document.createElement('strong');
      title.textContent = material.title;
      const meta = document.createElement('span');
      meta.textContent = `${material.originalFileName} · ${material.pages ?? '?'} página(s)`;
      button.append(title, meta);
      button.addEventListener('click', () => void openMaterial(material));
      materialList.append(button);
    }
  }

  function renderDetail(): void {
    const topic = currentTopic();
    if (!topic) return;
    detailGroup.textContent = topic.group;
    detailTitle.textContent = topic.title;
    detailSummary.textContent = topic.summary;
    renderEssentials(topic);

    const progress = buildTopicProgress(topic.id, STUDY_EXERCISES, history);
    const lastReview = progress.lastReviewedAt ? new Date(progress.lastReviewedAt).toLocaleDateString('pt-BR') : 'ainda não revisado';
    progressBox.textContent = `${progress.attempted}/${progress.totalExercises} questão(ões) respondidas · ${progress.correct} correta(s) · ${progress.incorrect} incorreta(s) · ${lastReview}`;

    renderExercises(topic);
    renderMaterials(topic);
  }

  function selectTopic(topicId: string): void {
    if (!getTopicById(topicId)) return;
    selectedTopicId = topicId;
    renderTopicList();
    renderDetail();
  }

  async function refresh(): Promise<void> {
    try {
      history = await listHistory();
    } catch {
      history = [];
    }
    renderTopicList();
    renderDetail();
  }

  for (const button of document.querySelectorAll<HTMLButtonElement>('[data-review-group]')) {
    button.addEventListener('click', () => {
      const value = button.dataset.reviewGroup;
      groupFilter = value === 'Limites' || value === 'Continuidade' || value === 'Derivadas' ? value : 'all';
      setPressed('[data-review-group]', button);
      renderTopicList();
      renderDetail();
    });
  }

  for (const button of document.querySelectorAll<HTMLButtonElement>('[data-review-status]')) {
    button.addEventListener('click', () => {
      const value = button.dataset.reviewStatus;
      statusFilter = value === 'incorrect' || value === 'unanswered' ? value : 'all';
      setPressed('[data-review-status]', button);
      const topic = currentTopic();
      if (topic) renderExercises(topic);
    });
  }

  practiceButton.addEventListener('click', () => {
    if (!selectedTopicId) return;
    window.dispatchEvent(new CustomEvent('motor-start-topic-exam', { detail: { topicId: selectedTopicId } }));
  });
  window.addEventListener('motor-history-updated', () => void refresh());

  void refresh();
  return { selectTopic, refresh };
}
