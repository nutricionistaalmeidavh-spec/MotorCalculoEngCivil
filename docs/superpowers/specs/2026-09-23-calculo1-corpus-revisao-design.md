# Corpus completo e revisão por conteúdo — Design

**Data:** 2026-09-23

## Objetivo

Transformar o MotorCalculoEngCivil em um sistema de revisão de Cálculo 1 baseado no material real enviado pelo usuário, incorporando:

1. o texto integral extraído dos materiais didáticos disponíveis;
2. todos os exercícios enviados no corpus atual;
3. a relação explícita entre cada exercício e o conteúdo necessário para resolvê-lo;
4. uma área de revisão por assunto;
5. um Modo Prova alimentado pelo mesmo banco de exercícios e capaz de indicar, após a resposta, exatamente o que revisar.

O sistema deve continuar **R$ 0 no núcleo, self-hosted e open source**, sem API matemática paga nem serviço externo obrigatório.

## Decisão de conteúdo

O usuário escolheu a opção **B**: armazenar também o **texto integral extraído dos materiais**, e não apenas resumos.

A extração deve preservar a fonte o máximo possível. Quando o PDF não fornecer texto suficiente para uma fórmula, figura, tabela ou elemento visual, o sistema deve registrar uma marcação explícita de lacuna, por exemplo:

`[conteúdo visual/fórmula não recuperado integralmente da fonte]`

Não reconstruir silenciosamente conteúdo ausente usando conhecimento geral.

## Corpus inicial disponível

### Materiais didáticos

O corpus atual contém nove PDFs:

- `SlidAula5unid4calc1.pdf`
- `Aula5mod2calc1.pdf`
- `Aula3slidmod3calc1.pdf`
- `SlidesAula4Mod2Calc1.pdf`
- `Aula3unid3slidcalc1.pdf`
- `SlidesUnidade2Calc1.pdf`
- `Mod3slidaula3calc1.pdf`
- `SlidesAula3Mod2.pdf`
- `Unidade2calc2.pdf`

Eles cobrem, entre outros, os núcleos já identificados no material: limites, limites laterais, limites infinitos e no infinito, continuidade e descontinuidades, derivadas, regras de derivação, regra do produto, regra do quociente, regra da cadeia, funções exponenciais/logarítmicas, funções trigonométricas, derivação implícita e reta tangente.

### Exercícios enviados

O corpus atual contém dez exercícios distintos, distribuídos em dezesseis capturas de tela. Eles devem entrar no banco de revisão como questões de origem `usuario`:

1. continuidade de função definida por partes no ponto de junção, com classificação da descontinuidade;
2. limite de `(x² - 81)/(x - 9)` quando `x → 9`;
3. limite infinito aplicado à Lei de Ohm quando `R → 0+`;
4. continuidade em `x = 0` de função definida por partes;
5. propriedades de limites para função racional `(x² - 4x + 4)/(x² + 3x - 6)`;
6. taxa de variação de `P(t)=10e^(0,6t)`, derivada exponencial e regra da cadeia;
7. derivada de `H(t)=tg(t)+3t²-t+1`;
8. derivação implícita de `x²+y²=5` e reta tangente em `(1,2)`;
9. análise de quatro afirmações sobre regras de derivação (produto, logaritmo, quociente/potência e produto com exponencial), preservando a observação de inconsistência do enunciado quando aplicável;
10. derivada de `f(x)=cos(x)+e^x+3`.

## Taxonomia de conteúdos

A navegação e o diagnóstico de revisão usarão uma taxonomia hierárquica, com IDs estáveis.

### 1. Limites

- `limites.introducao`
- `limites.laterais`
- `limites.propriedades`
- `limites.fatoracao-cancelamento`
- `limites.infinitos`
- `limites.no-infinito`
- `limites.assintotas`
- `limites.aplicacoes`

### 2. Continuidade

- `continuidade.definicao`
- `continuidade.funcoes-por-partes`
- `continuidade.limites-laterais`
- `continuidade.removivel`
- `continuidade.salto`
- `continuidade.infinita`

### 3. Derivadas

- `derivadas.definicao-taxa-variacao`
- `derivadas.linearidade`
- `derivadas.potencia`
- `derivadas.produto`
- `derivadas.quociente`
- `derivadas.cadeia`
- `derivadas.exponenciais-logaritmicas`
- `derivadas.trigonometricas`
- `derivadas.implicita`
- `derivadas.reta-tangente`

A taxonomia deve aceitar expansão posterior sem quebrar IDs já armazenados no histórico.

## Modelo de dados

### `StudyMaterial`

Cada PDF será representado por metadados estruturados:

```ts
interface StudyMaterial {
  id: string;
  title: string;
  originalFileName: string;
  topics: string[];
  textPath: string;
  pages?: number;
  notes?: string[];
}
```

O texto completo não deve ser empacotado dentro do JavaScript principal. Ele ficará em arquivos Markdown ou texto estático carregados sob demanda.

### `StudyExercise`

```ts
type AnswerKind = 'expression' | 'single-choice' | 'multi-choice' | 'text';

interface StudyExercise {
  id: string;
  origin: 'usuario' | 'material';
  prompt: string;
  answerKind: AnswerKind;
  options?: Array<{ id: string; label: string }>;
  correctOptionIds?: string[];
  expected?: string;
  explanation: string;
  topicIds: string[];
  primaryTopicId: string;
  difficulty: 'basico' | 'intermediario' | 'avancado';
  sourceRefs: Array<{
    materialId?: string;
    page?: number;
    imageName?: string;
  }>;
  tags: string[];
  warning?: string;
}
```

### Relação questão → conteúdo

Toda questão deve ter:

- um `primaryTopicId`;
- zero ou mais tópicos complementares em `topicIds`;
- uma explicação curta de **por que** aquele conteúdo é necessário;
- referência à origem;
- solução/resolução preservada no banco.

Exemplo:

- exercício da função por partes em `t=4`;
- tópico principal: `continuidade.funcoes-por-partes`;
- complementares: `limites.laterais`, `continuidade.salto`;
- motivo: comparar os limites laterais no ponto de troca da expressão e verificar se coincidem com o valor da função.

## Organização dos arquivos

Proposta de estrutura:

```text
src/study/content/
  types.ts
  topics.ts
  materials.ts
  exercises.ts
  content-index.test.ts

public/content/calculo1/
  materials/
    slid-aula5-unid4.md
    aula5-mod2.md
    aula3-mod3.md
    slides-aula4-mod2.md
    aula3-unid3.md
    slides-unidade2.md
    mod3-aula3.md
    slides-aula3-mod2.md
    unidade2calc2.md
  manifest.json
```

O Markdown integral deve conter, no mínimo:

- nome do arquivo de origem;
- separadores de página;
- texto extraído;
- marcações explícitas de trechos visuais/fórmulas não recuperados integralmente.

## Interface de revisão

Adicionar uma terceira visão principal: **Revisar**, ao lado de `Estudar` e `Modo Prova`.

### Tela Revisar

Deve permitir:

- filtrar por macrotema: Limites, Continuidade, Derivadas;
- abrir subtópicos;
- ver resumo do tópico;
- ver regras/fórmulas essenciais suportadas pelas fontes;
- listar materiais relacionados;
- abrir o texto integral do material sem sair do app;
- listar exercícios relacionados;
- filtrar por `todos`, `errei`, `ainda não respondi`;
- iniciar uma rodada de prova apenas daquele tópico.

### Cartão de tópico

Cada tópico exibe:

- nome;
- número de exercícios relacionados;
- acertos/erros históricos;
- última revisão;
- ação `Revisar conteúdo`;
- ação `Praticar questões`.

## Modo Prova

O Modo Prova atual usa somente respostas matemáticas digitadas. Ele deve ser generalizado para suportar os formatos reais do corpus.

### Tipos de resposta

1. `expression`: resposta matemática validável com o motor atual;
2. `single-choice`: uma alternativa correta;
3. `multi-choice`: conjunto de afirmações/alternativas corretas;
4. `text`: comparação textual normalizada quando equivalência simbólica não se aplica.

### Feedback pós-resposta

Antes da correção, o conteúdo relacionado não deve revelar a resposta.

Depois de responder, mostrar:

- correto/incorreto;
- resposta esperada;
- resolução;
- `Conteúdo relacionado`;
- botão `Revisar este conteúdo`.

### Resumo final

O resumo final deve trocar rótulos genéricos por diagnóstico específico.

Em vez de:

`Revise: Derivadas`

usar, por exemplo:

`Revise: regra do produto; derivadas trigonométricas; reta tangente por derivação implícita.`

## Histórico e progresso

Reutilizar IndexedDB e o histórico local existente.

Acrescentar aos registros de prova/revisão:

- `exerciseId`;
- `topicIds`;
- `primaryTopicId`;
- `sourceMaterialId` quando houver.

O progresso deve ser derivado localmente do histórico. Não criar backend, conta, autenticação ou sincronização em nuvem para esta entrega.

## Ingestão do texto integral

A ingestão será uma etapa versionada, não um serviço em runtime.

Regras:

1. extrair o conteúdo disponível de cada PDF;
2. preservar ordem por página;
3. não reescrever explicações como se fossem texto da fonte;
4. não corrigir silenciosamente erros ou lacunas da fonte;
5. marcar elementos não recuperáveis;
6. usar os resumos estruturados apenas como camada de navegação, nunca como substituto do texto integral;
7. guardar o resultado no repositório para que o app continue funcionando offline e sem API externa.

## Tratamento dos exercícios enviados por imagem

As capturas de tela não precisam ser publicadas como dependência do app. O conteúdo relevante será transcrito para `StudyExercise`, preservando:

- enunciado;
- expressão;
- alternativas visíveis;
- resposta correta calculada/revisada;
- resolução;
- observações sobre inconsistências do enunciado quando identificadas.

Questões divididas em mais de uma captura devem resultar em **uma única questão** no banco.

## Conteúdo inicial relacionado a cada exercício

| Exercício | Conteúdo principal | Complementares |
|---|---|---|
| Função por partes em `t=4` | Continuidade em funções por partes | limites laterais; descontinuidade por salto |
| `(x²-81)/(x-9)`, `x→9` | Limites por fatoração | diferença de quadrados; cancelamento |
| Lei de Ohm, `R→0+` | Limites infinitos | limite lateral direito; aplicação física |
| Função por partes em `x=0` | Continuidade | limites laterais; valor da função |
| Função racional com alternativas de limite | Propriedades de limites | substituição direta; funções racionais |
| `P(t)=10e^(0,6t)` | Derivada exponencial | regra da cadeia; taxa de variação |
| `tg(t)+3t²-t+1` | Derivadas trigonométricas | linearidade; regra da potência |
| `x²+y²=5` em `(1,2)` | Derivação implícita | regra da cadeia; reta tangente |
| Quatro afirmações de derivação | Regras de derivação | produto; logaritmo; potências/quociente; exponencial |
| `cos(x)+e^x+3` | Derivadas de funções elementares | trigonométrica; exponencial; constante |

## Integridade e inconsistências

O sistema não deve transformar um enunciado inconsistente em uma questão aparentemente correta.

Exemplo já observado no corpus: uma questão de regras de derivação apresenta alternativas que não coincidem perfeitamente com o resultado matemático obtido para todas as afirmações. Essa questão deve carregar um `warning` visível após a resposta, diferenciando:

- **resultado matemático**;
- **alternativa provavelmente esperada pelo sistema de origem**, quando for possível inferi-la do conjunto de opções.

A interface deve evitar apresentar a inferência como verdade matemática.

## PWA e funcionamento offline

Os novos arquivos de conteúdo são assets locais do projeto.

Requisitos:

- nenhum fetch para API paga;
- nenhum CDN obrigatório;
- manifest de conteúdo versionado;
- textos de materiais disponíveis offline depois de carregados;
- banco de questões incluído no build;
- manter o motor SymPy/Pyodide existente como núcleo matemático.

## Testes

### Integridade do corpus

Criar testes que garantam:

- IDs únicos de materiais, tópicos e exercícios;
- todo exercício possui tópico principal válido;
- toda referência de material aponta para um material existente;
- alternativas corretas existem no conjunto de opções;
- todo material cadastrado possui arquivo de texto correspondente;
- os dez exercícios iniciais estão presentes.

### Modo Prova

Cobrir:

- expressão simbólica;
- alternativa única;
- múltiplas alternativas;
- feedback com tópicos após resposta;
- resumo por subtópico;
- persistência do `exerciseId` e dos `topicIds`.

### Revisão

Cobrir funções puras de:

- filtro por tópico;
- cálculo de progresso;
- seleção de questões erradas;
- agrupamento de materiais por assunto.

## Critérios de aceite

A entrega será considerada completa quando:

1. os nove PDFs disponíveis estiverem representados no catálogo;
2. o texto integral extraído de cada PDF estiver versionado localmente;
3. os dez exercícios enviados no corpus atual estiverem cadastrados com solução e tópicos;
4. cada exercício mostrar o conteúdo relacionado após a resposta;
5. existir uma tela `Revisar` navegável por assunto;
6. o usuário conseguir abrir o texto integral dos materiais dentro do app;
7. o Modo Prova suportar respostas matemáticas e questões de alternativas;
8. o resumo final indicar subtópicos específicos para revisão;
9. o histórico local alimentar o progresso por tópico;
10. testes existentes e novos testes passarem;
11. `npm run typecheck` e `npm run build` passarem;
12. não houver nova dependência obrigatória paga ou serviço externo necessário para o núcleo.

## Fora de escopo desta entrega

- geração automática de novas questões por IA;
- login/conta do usuário;
- sincronização de progresso na nuvem;
- banco remoto obrigatório;
- OCR em runtime;
- alteração do motor matemático principal;
- publicação automática de conteúdo novo recebido no futuro sem revisão/versionamento.

## Compatibilidade com o sistema atual

A solução deve aproveitar o que já existe:

- `src/study/exam.ts` como ponto de partida do modelo de questões;
- `src/study/exam-controller.ts` para o fluxo da prova;
- `src/study/shell.ts` para as três visões principais;
- IndexedDB já usado pelo histórico;
- KaTeX para fórmulas;
- SymPy/Pyodide para equivalência matemática;
- PWA e assets self-hosted já existentes.

A implementação deve preferir módulos novos e pequenos para o corpus e a revisão, evitando transformar `app.ts` ou `exam-controller.ts` em arquivos ainda maiores.
