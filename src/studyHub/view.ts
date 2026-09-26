import type { PwaUiStatus } from "./adapters/pwa";
import type { StudyHubAnnotation, StudyHubState, StudySearchDocument, StudyTopic } from "./types";

export interface StudyHubView {
  annotationInput: HTMLInputElement;
  annotationAdd: HTMLButtonElement;
  annotationList: HTMLUListElement;
  searchInput: HTMLInputElement;
  searchResults: HTMLDivElement;
  progressToggle: HTMLInputElement;
  storageStatus: HTMLParagraphElement;
  pwaStatus: HTMLParagraphElement;
  pdfOpen: HTMLButtonElement;
  pdfStatus: HTMLParagraphElement;
  pdfFrame: HTMLIFrameElement;
  topicDetail: HTMLDivElement;
  topicButtons: HTMLButtonElement[];
  renderTopic(topic: StudyTopic, state: StudyHubState): void;
  renderAnnotations(annotations: StudyHubAnnotation[]): void;
  renderSearch(results: Array<{ document: StudySearchDocument }>): void;
  renderPwa(status: PwaUiStatus): void;
}

function mustFind<T extends Element>(root: ParentNode, selector: string): T {
  const element = root.querySelector<T>(selector);
  if (!element) throw new Error(`Elemento da Central de Estudos não encontrado: ${selector}`);
  return element;
}

export function createStudyHubView(options: {
  root: HTMLElement;
  topics: StudyTopic[];
  state: StudyHubState;
  storageDriver: string;
  layoutCount: number;
}): StudyHubView {
  const section = document.createElement("section");
  section.id = "study-hub";
  section.className = "study-hub";
  section.setAttribute("aria-labelledby", "study-hub-title");
  section.innerHTML = `
    <div class="study-hub-heading">
      <p class="eyebrow">Apple Utils · estudo local</p>
      <h2 id="study-hub-title">Central de Estudos</h2>
      <p>Material, mapa, anotações, busca e progresso no mesmo ambiente do motor matemático.</p>
    </div>
    <div class="study-grid">
      <article class="study-card" data-study-module="dashboard"><h3>Painel de Estudos</h3><p><strong>${options.layoutCount}</strong> módulos validados e ativos no workspace.</p></article>
      <article class="study-card" data-study-module="pdf">
        <h3>Material PDF</h3><p>Leitor local pelo contrato ArtiSys PDF.</p>
        <button id="study-pdf-open" type="button">Abrir material PDF</button>
        <p id="study-pdf-status" data-testid="study-pdf-status" role="status">Pronto para abrir.</p>
        <iframe id="study-pdf-frame" title="Material de Cálculo 1" hidden></iframe>
      </article>
      <article class="study-card" data-study-module="annotations">
        <h3>Anotações</h3>
        <label for="study-annotation-input">Nova anotação</label>
        <input id="study-annotation-input" autocomplete="off" placeholder="Ex.: rever limite lateral" />
        <button id="study-annotation-add" type="button">Adicionar anotação</button>
        <ul id="study-annotation-list" data-testid="study-annotation-list"></ul>
      </article>
      <article class="study-card study-map-card" data-study-module="workflow">
        <h3>Mapa de Estudos</h3>
        <div class="study-topic-buttons" aria-label="Tópicos de Cálculo 1">
          ${options.topics.map((topic) => `<button type="button" data-study-topic="${topic.id}">${topic.title}</button>`).join("")}
        </div>
        <div id="study-topic-detail" data-testid="study-topic-detail" class="study-topic-detail"></div>
      </article>
      <article class="study-card" data-study-module="search">
        <h3>Busca Local</h3>
        <label for="study-search-input">Buscar no material</label>
        <input id="study-search-input" type="search" autocomplete="off" placeholder="limite, derivada..." />
        <div id="study-search-results" data-testid="study-search-results" aria-live="polite"></div>
      </article>
      <article class="study-card" data-study-module="storage">
        <h3>Progresso e Armazenamento</h3>
        <label class="study-check"><input id="study-progress-toggle" type="checkbox" /> Tópico concluído</label>
        <p id="study-storage-status" data-testid="study-storage-status">Armazenamento: ${options.storageDriver}</p>
      </article>
      <article class="study-card" data-study-module="pwa">
        <h3>Offline / PWA</h3>
        <p>Cache local versionado para estudar com conexão instável.</p>
        <p id="study-pwa-status" data-testid="study-pwa-status" role="status">Registrando…</p>
      </article>
    </div>
  `;
  options.root.append(section);

  const view: StudyHubView = {
    annotationInput: mustFind(section, "#study-annotation-input"),
    annotationAdd: mustFind(section, "#study-annotation-add"),
    annotationList: mustFind(section, "#study-annotation-list"),
    searchInput: mustFind(section, "#study-search-input"),
    searchResults: mustFind(section, "#study-search-results"),
    progressToggle: mustFind(section, "#study-progress-toggle"),
    storageStatus: mustFind(section, "#study-storage-status"),
    pwaStatus: mustFind(section, "#study-pwa-status"),
    pdfOpen: mustFind(section, "#study-pdf-open"),
    pdfStatus: mustFind(section, "#study-pdf-status"),
    pdfFrame: mustFind(section, "#study-pdf-frame"),
    topicDetail: mustFind(section, "#study-topic-detail"),
    topicButtons: [...section.querySelectorAll<HTMLButtonElement>("[data-study-topic]")],
    renderTopic(topic, state) {
      view.topicDetail.replaceChildren();
      const title = document.createElement("strong");
      title.textContent = topic.title;
      const description = document.createElement("p");
      description.textContent = topic.description;
      const example = document.createElement("p");
      example.className = "study-example";
      example.textContent = `Exemplo: ${topic.example}`;
      view.topicDetail.append(title, description, example);
      view.progressToggle.checked = Boolean(state.progress[topic.id]);
      for (const button of view.topicButtons) button.classList.toggle("active", button.dataset.studyTopic === topic.id);
    },
    renderAnnotations(annotations) {
      view.annotationList.replaceChildren();
      for (const annotation of annotations) {
        const item = document.createElement("li");
        const text = document.createElement("span");
        text.textContent = annotation.text;
        const remove = document.createElement("button");
        remove.type = "button";
        remove.textContent = "Remover";
        remove.dataset.removeAnnotation = annotation.id;
        item.append(text, remove);
        view.annotationList.append(item);
      }
      if (!annotations.length) {
        const empty = document.createElement("li");
        empty.className = "study-muted";
        empty.textContent = "Nenhuma anotação salva.";
        view.annotationList.append(empty);
      }
    },
    renderSearch(results) {
      view.searchResults.replaceChildren();
      if (!view.searchInput.value.trim()) {
        view.searchResults.textContent = "Digite um termo para pesquisar tópicos e anotações.";
        return;
      }
      if (!results.length) {
        view.searchResults.textContent = "Nenhum resultado local.";
        return;
      }
      const list = document.createElement("ul");
      for (const result of results) {
        const item = document.createElement("li");
        const title = document.createElement("strong");
        title.textContent = result.document.title;
        const description = document.createTextNode(` — ${result.document.description}`);
        item.append(title, description);
        list.append(item);
      }
      view.searchResults.append(list);
    },
    renderPwa(status) {
      const labels: Record<PwaUiStatus, string> = { registrando: "Registrando…", ativo: "Ativo", indisponível: "Indisponível", falhou: "Falhou" };
      view.pwaStatus.textContent = labels[status];
    },
  };

  return view;
}
