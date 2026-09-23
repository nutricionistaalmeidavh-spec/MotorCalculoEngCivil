# P2/P3 — Mapa mental, progresso e polimento visual

## Objetivo

Evoluir o Motor de Cálculo de uma experiência centrada em resolver questões para uma experiência de estudo contínuo. P2 deve ajudar o aluno a enxergar como os tópicos de Cálculo 1 se conectam, identificar o que precisa de revisão e escolher a próxima ação de estudo. P3 deve tornar essa experiência mais clara, responsiva e agradável sem introduzir distrações, dependências pagas ou estado remoto.

O core continua local no navegador. O histórico em IndexedDB permanece a fonte de verdade para progresso, acertos, erros e sequência de estudo. Não será criada conta, backend, serviço de analytics ou dependência de runtime paga.

## Escopo

### P2

- terceira visão principal: `Estudar · Mapa Mental · Modo Prova`;
- mapa mental interativo de Cálculo 1;
- estados por tópico derivados do histórico local;
- painel de detalhe de tópico;
- ações `Praticar agora` e `Revisar meus erros`;
- painel geral de progresso;
- sequência de dias estudados;
- taxa de acerto em questões avaliadas;
- tópicos dominados;
- tópico prioritário para revisão;
- missão de estudo calculada localmente.

### P3

- transições entre visões;
- entrada progressiva de resultados e passos;
- feedback visual após correção;
- animação de barras e estados do mapa;
- microinterações em botões e cards;
- melhorias de hierarquia, foco, estados vazios, responsividade e leitura;
- suporte explícito a `prefers-reduced-motion: reduce`.

### Fora de escopo

- ranking entre usuários;
- moedas virtuais, loja, XP arbitrário ou badges competitivos;
- login ou sincronização em nuvem;
- notificações push;
- compartilhamento público de progresso;
- edição livre da estrutura do mapa;
- geração de mapa por IA;
- biblioteca externa de grafos;
- mudança no motor SymPy ou na semântica matemática de P0/P1.

## Princípios de produto

1. **Progresso deve representar estudo real.** Métricas são derivadas do histórico existente, não de pontos artificiais.
2. **Revisão deve ser acionável.** Um tópico marcado como `Revisar` sempre oferece caminho direto para questões relacionadas ou erros anteriores.
3. **O mapa explica relações, não só organiza cards.** As conexões entre tópicos devem mostrar dependências conceituais.
4. **Animação nunca bloqueia a tarefa.** Motion reforça mudança de estado, mas não atrasa a interação.
5. **Tudo funciona offline após os assets necessários estarem disponíveis pelo fluxo PWA atual.**
6. **Mobile é primeira classe.** O mapa precisa continuar útil sem exigir arrastar um canvas infinito.

## Arquitetura

P2/P3 será adicionado como camadas independentes sobre os módulos de P0/P1.

```text
src/
  mindmap/
    data.ts
    model.ts
    ui.ts
    model.test.ts

  progress/
    model.ts
    ui.ts
    model.test.ts

  study/
    shell.ts
    app.ts

  history/
    storage.ts
    ui.ts

  ux.css
```

### `mindmap/data.ts`

Define a topologia estática do mapa e o conteúdo editorial mínimo de cada tópico. Não acessa DOM ou IndexedDB.

Cada tópico contém:

- `id` estável;
- título;
- resumo curto;
- conceitos essenciais;
- fórmulas/ideias centrais em texto ou LaTeX;
- operações relacionadas;
- dependências conceituais;
- exemplos de pergunta para iniciar prática.

Tópicos iniciais:

- Funções;
- Limites;
- Derivadas;
- Aplicações de derivadas;
- Integrais;
- Análise completa de funções;
- Álgebra de apoio.

A estrutura deve permitir adicionar tópicos depois sem alterar o algoritmo de progresso.

### `mindmap/model.ts`

Transforma dados estáticos do mapa + resumo de progresso em um modelo pronto para renderização.

Responsabilidades:

- mapear operações/tópicos históricos para nós do mapa;
- anexar estado de domínio a cada nó;
- calcular contadores de erros e tentativas;
- expor conexões entre nós em formato simples e testável;
- não acessar DOM.

### `mindmap/ui.ts`

Renderiza o mapa e o painel de detalhe.

Desktop/tablet:

- layout em nós conectados por SVG;
- nós são botões HTML reais posicionados sobre a área do mapa;
- SVG serve apenas para as conexões visuais;
- foco via teclado segue ordem lógica de aprendizado, não coordenadas visuais.

Mobile:

- o mesmo conteúdo vira uma trilha vertical/ramificada;
- conexões são representadas por linhas simples e grupos;
- não haverá canvas infinito nem pan obrigatório.

Ao selecionar um nó, o painel de tópico mostra conceito, fórmulas, estado, acertos/erros e ações de estudo.

### `progress/model.ts`

É um módulo puro que recebe `HistoryEntry[]` e produz `ProgressSummary` e `TopicProgress[]`.

Não lê IndexedDB diretamente. Isso permite testar toda a lógica com fixtures pequenas.

### `progress/ui.ts`

Lê o histórico por meio da API existente de `history/storage.ts`, chama `progress/model.ts` e renderiza:

- progresso geral;
- sequência atual;
- questões avaliadas;
- taxa de acerto;
- tópicos dominados;
- prioridade de revisão;
- missão atual.

Também escuta `motor-history-updated` para se manter sincronizado com Modo Prova e histórico.

### `study/shell.ts`

Recebe as novas áreas de UI:

- aba `Mapa Mental` no seletor principal;
- container da visão de mapa;
- resumo de progresso no topo da visão;
- painel de detalhe do tópico.

### `study/app.ts`

Continua sendo o controlador da navegação principal e ganha integração mínima com o mapa:

- alternar `study`, `mindmap`, `exam`;
- receber ação `Praticar agora` e preencher a entrada universal com um exemplo relacionado;
- receber ação `Revisar meus erros` e direcionar o histórico para o filtro de erros daquele tópico;
- não incorporar a lógica de cálculo de progresso.

## Fonte de dados e retenção

O IndexedDB `motor-calculo-eng-civil` continua sendo a única fonte persistente.

O histórico atual é limitado a 60 registros. Para que sequência, precisão e estado de domínio não oscilem cedo demais por descarte, P2 elevará `MAX_HISTORY` para **240** registros. Não haverá migração de schema porque o formato de `HistoryEntry` já comporta os campos necessários e o object store não muda.

`practice` conta como atividade de estudo, mas não entra na taxa de acerto. Somente `correct` e `incorrect` são tentativas avaliadas.

## Mapeamento de histórico para tópicos

O progresso não dependerá de strings localizadas salvas em `topic`. O agrupamento preferencial usa `operation`; `topic` fica como fallback para entradas antigas ou casos específicos.

Mapeamento inicial:

| Operação | Nó do mapa |
| --- | --- |
| `limit` | limites |
| `differentiate` | derivadas |
| `integrate` | integrais |
| `analyze` | analise-funcoes |
| `graph` | funcoes |
| `roots` | funcoes |
| `simplify` | algebra |
| `factor` | algebra |
| `expand` | algebra |
| `solve` | algebra |

`Aplicações de derivadas` recebe atividade de questões de derivada classificadas pelo banco local como aplicação e de análises de função quando houver informação de tópico específica. Até existir metadado mais granular em todas as entradas, o nó pode compartilhar parte da evidência de `analyze`, mas isso deve ser explícito no modelo e testado.

## Estados de domínio

Cada tópico possui exatamente um destes estados:

- `not_started` — nenhum registro associado;
- `studying` — existe atividade, mas ainda não há evidência suficiente para revisão crítica ou domínio;
- `review` — o desempenho avaliado indica necessidade de revisão;
- `mastered` — há evidência mínima consistente de domínio.

### Regras

Considere apenas tentativas avaliadas (`correct`/`incorrect`) para precisão.

`accuracy = correct / assessedAttempts`.

Ordem de decisão:

1. sem registros → `not_started`;
2. `assessedAttempts >= 3`, `correct >= 3`, `accuracy >= 0.80` e a tentativa avaliada mais recente não é `incorrect` → `mastered`;
3. há pelo menos uma tentativa avaliada e (`accuracy < 0.70` ou a tentativa avaliada mais recente é `incorrect`) → `review`;
4. caso contrário → `studying`.

Essa ordem evita que um erro antigo mantenha para sempre um tópico em revisão quando o desempenho recente já demonstra recuperação.

## Progresso geral

O progresso geral é uma média ponderada dos estados dos tópicos:

- `not_started = 0`;
- `studying = 0.40`;
- `review = 0.55`;
- `mastered = 1.00`.

O valor exibido é arredondado para porcentagem inteira.

Esse número é orientativo e nunca substitui os estados por tópico.

## Sequência de estudo

Um dia conta como estudado quando existe ao menos um `HistoryEntry` naquele dia local do navegador.

A sequência atual:

- agrupa registros por data local `YYYY-MM-DD`;
- começa no dia atual se houver atividade hoje;
- caso não haja atividade hoje, pode começar ontem;
- percorre para trás por dias consecutivos até a primeira lacuna;
- nunca usa timezone remoto.

A sequência representa atividade, não acerto.

## Taxa de acerto

`correct / (correct + incorrect)` considerando o histórico retido.

Quando não houver tentativas avaliadas, a UI mostra `Sem questões avaliadas ainda`, não `0%`.

## Prioridade de revisão

A missão não usará score opaco. A seleção segue regras determinísticas:

1. tópicos em `review` primeiro;
2. entre eles, menor `accuracy`;
3. empate: maior número de erros;
4. empate: erro mais recente;
5. se não houver `review`, escolher `studying` com menor número de acertos avaliados;
6. se todos os tópicos iniciados estiverem dominados, escolher o primeiro `not_started` na ordem pedagógica;
7. se todos estiverem dominados, missão de manutenção no tópico com atividade avaliada mais antiga.

A UI explica o motivo com uma frase curta, por exemplo: `Prioridade porque seu último resultado em Limites foi incorreto.`

## Missão de estudo

A missão é uma recomendação operacional dentro do app, não uma pontuação.

Formatos iniciais:

- `Revise 2 questões de Limites`;
- `Pratique uma derivada e confira o passo a passo`;
- `Explore Integrais para avançar no mapa`;
- `Faça uma questão de manutenção em Funções`.

A missão deve ter um único CTA que leva diretamente para `Estudar` ou `Modo Prova` com contexto pré-carregado quando possível.

## Mapa mental e relações

Relações pedagógicas iniciais:

```text
Álgebra de apoio -> Funções
Funções -> Limites
Funções -> Derivadas
Limites -> Derivadas
Derivadas -> Aplicações de derivadas
Derivadas -> Análise completa de funções
Aplicações de derivadas -> Análise completa de funções
Limites -> Integrais
Derivadas -> Integrais
```

As conexões não significam pré-requisito rígido de bloqueio. Nenhum tópico será bloqueado. Elas apenas explicam dependências conceituais.

## Painel de tópico

Ao selecionar um nó, mostrar:

- título e estado;
- resumo em até 3 frases;
- 2–5 conceitos/fórmulas centrais;
- `X acertos · Y erros · Z práticas`;
- conexões `vem de` e `leva a`;
- lista curta de erros recentes daquele tópico quando existirem;
- botão `Praticar agora`;
- botão `Revisar meus erros` quando houver erros.

`Praticar agora` usa exemplos definidos em `mindmap/data.ts` e volta para a visão Estudar com a entrada universal preenchida. Não executa a questão automaticamente.

`Revisar meus erros` abre a área de histórico já filtrada pelo tópico e por `incorrect`.

## Atualização reativa

Fluxo após uma questão de prova:

```text
ExamController
  -> addHistoryEntry()
  -> dispatch motor-history-updated
  -> history/ui atualiza
  -> progress/ui relê histórico
  -> mindmap/ui recebe novo summary/model
  -> nó e missão mudam sem reload
```

Fluxo de prática comum:

```text
Resultado calculado
  -> history/ui captura prática
  -> addHistoryEntry()
  -> motor-history-updated
  -> progresso e mapa atualizam
```

O evento existente continua sendo o mecanismo de sincronização; não será criado um store global novo.

## P3 — sistema de motion

Movimento deve comunicar três coisas: entrada, mudança de estado e relação causa/efeito.

### Transições permitidas

- fade/slide curto ao trocar de visão;
- entrada escalonada dos passos da resolução;
- realce breve do nó que mudou de estado;
- crescimento da barra de progresso;
- feedback de correção no Modo Prova;
- abertura/fechamento do painel de tópico;
- hover/focus/pressed em controles.

Durações alvo:

- microinterações: `120–180ms`;
- transições de cards/painéis: `180–260ms`;
- realce de atualização: até `500ms` sem loop.

Não usar animação contínua, parallax ou movimento decorativo permanente.

### Movimento reduzido

Sob `@media (prefers-reduced-motion: reduce)`:

- `animation-duration` e `transition-duration` tornam-se praticamente instantâneos;
- `scroll-behavior` deixa de ser suave;
- nenhum dado ou feedback depende da animação para ser percebido.

## P3 — hierarquia e acessibilidade

- `:focus-visible` consistente e claramente contrastante;
- nós do mapa são elementos interativos semânticos;
- conexões SVG são decorativas (`aria-hidden="true"`);
- estados não dependem apenas de cor: cada nó exibe rótulo/ícone textual do estado;
- barras incluem valor textual e `aria-valuenow` quando aplicável;
- áreas atualizadas usam `aria-live` somente onde há feedback relevante, evitando anúncios excessivos;
- navegação de teclado alcança abas, nós e CTAs em ordem previsível;
- layout mobile não exige precisão de ponteiro;
- nenhuma animação impede clique durante a transição.

## Estados vazios e falhas

### Sem histórico

O mapa aparece completo em `Não iniciado`, com mensagem `Comece por Funções ou resolva qualquer questão para registrar progresso.`

### Histórico indisponível

Se IndexedDB falhar:

- mapa estrutural continua visível;
- progresso mostra `Progresso local indisponível neste navegador`;
- ações `Praticar agora` continuam funcionando;
- a falha não bloqueia cálculo nem Modo Prova.

### Entrada antiga/incompleta

Entradas sem `outcome` são tratadas como `practice`.
Entradas sem `mode` continuam válidas.
Entradas com operação desconhecida não entram em métricas por tópico, mas ainda contam como dia ativo para sequência.

### Conteúdo matemático do painel

Falha de renderização KaTeX usa texto de fallback e não remove o conceito.

## Integração com histórico

`history/ui.ts` ganhará filtro opcional por tópico sem mudar o comportamento padrão.

O filtro final será a combinação:

```text
outcomeFilter: all | incorrect
topicFilter: all | <topic-id>
```

O botão global `Revisar erros` continua funcionando como hoje. O mapa apenas define também o tópico alvo.

## Testes

### `progress/model.test.ts`

Cobrir:

- histórico vazio;
- `practice` não afeta precisão;
- transição `studying -> review`;
- transição `review -> mastered` após recuperação;
- domínio exige no mínimo 3 corretas;
- erro mais recente remove `mastered`;
- taxa de acerto;
- sequência incluindo hoje;
- sequência começando ontem;
- sequência quebrada por lacuna;
- seleção determinística da missão;
- fallback quando todos os tópicos estão dominados.

### `mindmap/model.test.ts`

Cobrir:

- todos os nós estáticos presentes;
- IDs únicos;
- conexões apontam para IDs válidos;
- estado de progresso anexado corretamente;
- contagem de erros por tópico;
- mapeamento de operações;
- ordem pedagógica estável.

### Regressão

Executar toda a suíte existente:

- testes Vitest de P0/P1;
- testes Python/SymPy;
- TypeScript `tsc -b`;
- build Vite de produção;
- validação PowerShell existente;
- job Windows PowerShell 5.1 existente.

## Critérios de aceite

P2/P3 está concluído quando:

1. a navegação possui Estudar, Mapa Mental e Modo Prova;
2. o mapa funciona em desktop e mobile sem biblioteca adicional;
3. cada nó mostra um dos quatro estados definidos;
4. os estados mudam após novas entradas de histórico sem reload;
5. o painel de progresso mostra sequência, acerto, domínio e missão;
6. a missão segue as regras determinísticas deste documento;
7. `Praticar agora` pré-carrega uma questão adequada na visão Estudar;
8. `Revisar meus erros` filtra erros do tópico;
9. o app continua funcional com IndexedDB indisponível, exceto métricas persistentes;
10. motion respeita `prefers-reduced-motion`;
11. navegação de teclado cobre abas, mapa e CTAs;
12. nenhuma nova dependência paga ou serviço remoto é introduzido;
13. testes, typecheck e build passam no CI.

## Decisões técnicas finais

- usar HTML + SVG + CSS para o mapa, sem biblioteca de grafos;
- derivar progresso exclusivamente do histórico local;
- aumentar retenção do histórico para 240 entradas;
- não alterar schema IndexedDB;
- não criar store global; continuar com eventos locais;
- não bloquear tópicos por pré-requisitos;
- não usar XP, ranking ou moedas;
- manter SymPy/Pyodide intocados em P2/P3;
- manter toda a lógica de progresso em funções puras testáveis.
