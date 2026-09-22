import { createStudyAnnotation } from "./adapters/annotations";
import { createStudyDashboardLayout } from "./adapters/dashboard";
import { loadStudyPdf } from "./adapters/pdf";
import type { PwaUiStatus } from "./adapters/pwa";
import { annotationSearchDocuments, createStudySearch } from "./adapters/search";
import { createStudyStorage, loadStudyState, saveStudyState } from "./adapters/storage";
import { getStudyTopic, validateStudyWorkflow } from "./adapters/workflows";
import { DEMO_PDF_ID, DEMO_PDF_URL, INITIAL_SEARCH_DOCUMENTS, STUDY_TOPICS, STUDY_WORKFLOW } from "./fixtures";
import { createInitialStudyHubState } from "./state";
import type { StudyHubAnnotation, StudyHubState } from "./types";
import { createStudyHubView } from "./view";

export async function mountStudyHub(options: { pwaStatus?: Promise<PwaUiStatus>; root?: HTMLElement } = {}): Promise<void> {
  const root = options.root ?? document.querySelector<HTMLElement>(".shell");
  if (!root || document.getElementById("study-hub")) return;

  validateStudyWorkflow(STUDY_WORKFLOW);
  const layout = createStudyDashboardLayout();
  const storage = await createStudyStorage();
  let state: StudyHubState;
  try {
    state = await loadStudyState(storage);
  } catch {
    state = createInitialStudyHubState();
  }
  if (!getStudyTopic(state.selectedTopicId)) state.selectedTopicId = "calculo-1";

  const search = createStudySearch([]);
  const rebuildSearch = () => {
    search.replaceDocuments([...INITIAL_SEARCH_DOCUMENTS, ...annotationSearchDocuments(state.annotations)]);
  };
  rebuildSearch();

  const health = await storage.health();
  const view = createStudyHubView({
    root,
    topics: STUDY_TOPICS,
    state,
    storageDriver: health.driver,
    layoutCount: layout.length,
  });

  const persist = async () => {
    try {
      await saveStudyState(storage, state);
      view.storageStatus.textContent = `Armazenamento: ${health.driver} · salvo`;
    } catch {
      view.storageStatus.textContent = `Armazenamento: ${health.driver} · falha ao salvar`;
    }
  };

  const renderCurrentTopic = () => {
    const topic = getStudyTopic(state.selectedTopicId) ?? STUDY_TOPICS[0];
    if (topic) view.renderTopic(topic, state);
  };
  const renderSearch = () => view.renderSearch(search.query(view.searchInput.value));

  renderCurrentTopic();
  view.renderAnnotations(state.annotations);
  renderSearch();

  for (const button of view.topicButtons) {
    button.addEventListener("click", () => {
      const id = button.dataset.studyTopic;
      if (!id || !getStudyTopic(id)) return;
      state.selectedTopicId = id;
      renderCurrentTopic();
      void persist();
    });
  }

  view.progressToggle.addEventListener("change", () => {
    state.progress[state.selectedTopicId] = view.progressToggle.checked;
    void persist();
  });

  view.annotationAdd.addEventListener("click", () => {
    const text = view.annotationInput.value.trim();
    if (!text) return;
    const id = globalThis.crypto?.randomUUID?.() ?? `note-${Date.now()}`;
    const normalized = createStudyAnnotation({ id, targetId: DEMO_PDF_ID, page: 1, text });
    const annotation: StudyHubAnnotation = { id: normalized.id, targetId: normalized.targetId, page: normalized.page ?? 1, text: normalized.text };
    state.annotations.push(annotation);
    view.annotationInput.value = "";
    view.renderAnnotations(state.annotations);
    rebuildSearch();
    renderSearch();
    void persist();
  });

  view.annotationList.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target.closest<HTMLButtonElement>("[data-remove-annotation]") : null;
    if (!target?.dataset.removeAnnotation) return;
    state.annotations = state.annotations.filter((item) => item.id !== target.dataset.removeAnnotation);
    view.renderAnnotations(state.annotations);
    rebuildSearch();
    renderSearch();
    void persist();
  });

  view.searchInput.addEventListener("input", renderSearch);

  view.pdfOpen.addEventListener("click", () => {
    view.pdfOpen.disabled = true;
    view.pdfStatus.textContent = "Carregando…";
    void loadStudyPdf(DEMO_PDF_URL)
      .then(({ pages, url }) => {
        view.pdfStatus.textContent = `Carregado · ${pages} página${pages === 1 ? "" : "s"}`;
        view.pdfFrame.src = url;
        view.pdfFrame.hidden = false;
      })
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : String(error);
        view.pdfStatus.textContent = `Falha ao carregar PDF: ${message}`;
      })
      .finally(() => {
        view.pdfOpen.disabled = false;
      });
  });

  view.renderPwa("registrando");
  void (options.pwaStatus ?? Promise.resolve<PwaUiStatus>("indisponível")).then((status) => view.renderPwa(status));
}
