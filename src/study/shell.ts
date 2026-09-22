export interface ActionSpec {
  operation: string;
  label: string;
}

export function mountStudyShell(actions: ActionSpec[]): void {
  const app = document.querySelector<HTMLDivElement>("#app");
  if (!app) throw new Error("Elemento #app não encontrado.");

  app.innerHTML = `
    <main class="shell">
      <header class="hero ux-hero">
        <div>
          <p class="eyebrow">Engenharia Civil · Cálculo 1</p>
          <h1>Motor de Cálculo</h1>
          <p class="subtitle">Resolva, entenda e revise Cálculo 1 com processamento local no navegador.</p>
        </div>
        <div id="engine-status" class="status" role="status" aria-live="polite">Carregando motor matemático…</div>
      </header>

      <nav class="view-switch" aria-label="Modo principal">
        <button type="button" class="view-tab active" data-view="study" aria-pressed="true">Estudar</button>
        <button type="button" class="view-tab" data-view="exam" aria-pressed="false">Modo Prova</button>
      </nav>

      <section id="study-view">
        <section class="card input-card universal-card" aria-labelledby="expression-title">
          <div class="section-heading universal-heading">
            <div>
              <p class="step">Questão</p>
              <h2 id="expression-title">O que você quer resolver?</h2>
              <p class="section-copy">Cole um enunciado ou escreva a expressão. O tipo de cálculo é detectado automaticamente.</p>
            </div>
            <label class="variable-field">Variável
              <input id="variable" value="x" maxlength="1" inputmode="text" aria-label="Variável principal" />
            </label>
          </div>

          <label class="sr-only" for="expression">Questão ou expressão matemática</label>
          <textarea id="expression" rows="4" spellcheck="false" autocomplete="off" placeholder="Ex.: Analise f(x)=x³-3x e encontre máximos e mínimos">x² - 4x + 3</textarea>

          <div class="input-meta">
            <span id="detected-operation" class="detected-operation">Detectado: Análise</span>
            <span class="keyboard-hint">Ctrl/⌘ + Enter para resolver</span>
          </div>

          <div class="examples" aria-label="Exemplos rápidos">
            <button type="button" class="example" data-question="Calcule o limite de (x² - 4)/(x - 2) quando x tende a 2">Limite clássico</button>
            <button type="button" class="example" data-question="Encontre a derivada de f(x)=x³-6x²+9x">Derivada</button>
            <button type="button" class="example" data-question="Analise f(x)=x³-3x e encontre máximos e mínimos">Análise completa</button>
            <button type="button" class="example" data-question="Calcule a integral de sen(x) de 0 até π">Integral</button>
          </div>

          <div class="study-toolbar">
            <div>
              <span class="mode-label">Como você quer estudar?</span>
              <div class="segmented" aria-label="Modo de estudo">
                <button type="button" class="study-mode active" data-study-mode="learn" aria-pressed="true">Aprender</button>
                <button type="button" class="study-mode" data-study-mode="solve" aria-pressed="false">Resolver</button>
              </div>
            </div>
            <button id="calculate-button" type="button" class="calculate-button">Analisar questão</button>
          </div>

          <details class="advanced-options">
            <summary>Ajustar operação e parâmetros</summary>
            <div class="advanced-content">
              <p class="mode-label">Operação</p>
              <div class="actions" aria-label="Operações matemáticas">
                ${actions.map(({ operation, label }, index) =>
                  `<button type="button" class="action${index === 0 ? " active" : ""}" data-operation="${operation}" aria-pressed="${index === 0}">${label}</button>`,
                ).join("")}
              </div>

              <div id="parameter-panel" class="parameter-panel" hidden>
                <div id="limit-parameters" class="parameter-group" hidden>
                  <label>Tende a <input id="limit-target" value="0" placeholder="0, 2, π, ∞, -∞" /></label>
                  <label>Direção
                    <select id="limit-direction">
                      <option value="+-">Dos dois lados</option><option value="-">Pela esquerda</option><option value="+">Pela direita</option>
                    </select>
                  </label>
                </div>
                <div id="derivative-parameters" class="parameter-group" hidden>
                  <label>Ordem
                    <select id="derivative-order">
                      <option value="1">1ª derivada</option><option value="2">2ª derivada</option><option value="3">3ª derivada</option><option value="4">4ª derivada</option><option value="5">5ª derivada</option>
                    </select>
                  </label>
                  <label>Ponto para reta tangente <input id="tangent-point" placeholder="opcional: 0, 2, π..." /></label>
                </div>
                <div id="integral-parameters" class="parameter-group" hidden>
                  <label>Limite inferior <input id="lower-bound" placeholder="vazio = indefinida" /></label>
                  <label>Limite superior <input id="upper-bound" placeholder="vazio = indefinida" /></label>
                </div>
              </div>
            </div>
          </details>
        </section>

        <div class="workspace solution-workspace">
          <section class="card result-card" aria-labelledby="result-title">
            <div class="section-heading compact"><div><p class="step">Resolução</p><h2 id="result-title">Entenda o caminho</h2></div></div>
            <div id="result-empty" class="empty-state">Digite uma questão acima para começar.</div>
            <div id="result-content" hidden>
              <div class="solved-question"><span class="result-label">Interpretação</span><div id="input-math" class="math-output"></div></div>
              <section id="learning-steps" class="learning-steps" aria-label="Passos da resolução"></section>
              <div id="learning-controls" class="learning-controls" hidden>
                <button id="next-hint" type="button" class="secondary-button">Mostrar próxima pista</button>
                <button id="reveal-answer" type="button" class="secondary-button">Ver resposta completa</button>
              </div>
              <div id="answer-block" class="answer-block">
                <span class="result-label">Resposta</span><div id="result-math" class="math-output result-primary"></div><pre id="result-text" class="result-text"></pre>
              </div>
              <div id="result-details" class="result-details analysis-grid" hidden></div>
              <div id="warnings" class="warnings" hidden></div>
            </div>
            <div id="error" class="error" role="alert" hidden></div>
          </section>

          <section class="card graph-card" aria-labelledby="graph-title">
            <div class="section-heading compact"><div><p class="step">Visualização</p><h2 id="graph-title">Gráfico ligado à solução</h2></div><span class="touch-hint">arraste · pinça para zoom</span></div>
            <div id="graph" class="jxgbox" aria-label="Gráfico cartesiano interativo"></div>
            <div id="graph-legend" class="graph-legend" aria-live="polite"></div>
          </section>
        </div>
      </section>

      <section id="exam-view" class="card exam-card" hidden>
        <div class="exam-topline">
          <div><p class="step">Modo Prova</p><h2>Uma questão por vez</h2><p class="section-copy">Responda sem ver a solução. Use a pista apenas se precisar.</p></div>
          <span id="exam-progress" class="exam-progress"></span>
        </div>
        <div id="exam-question-wrap">
          <p id="exam-topic" class="exam-topic"></p><h3 id="exam-question" class="exam-question"></h3><div id="exam-hint" class="exam-hint" hidden></div>
          <label class="exam-answer-label" for="exam-answer">Sua resposta</label><input id="exam-answer" class="exam-answer" autocomplete="off" placeholder="Digite a resposta matemática" />
          <div class="exam-actions"><button id="exam-hint-button" type="button" class="secondary-button">Preciso de uma pista</button><button id="exam-check" type="button" class="calculate-button">Corrigir</button></div>
          <div id="exam-feedback" class="exam-feedback" role="status" aria-live="polite"></div><button id="exam-next" type="button" class="secondary-button" hidden>Próxima questão</button>
        </div>
        <div id="exam-summary" class="exam-summary" hidden></div>
      </section>
    </main>
  `;
}
