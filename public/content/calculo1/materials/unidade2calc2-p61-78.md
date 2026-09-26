# Unidade2calc2.pdf — páginas 61–78

> Transcrição do texto extraído do arquivo original, preservada por página. O aviso ao fim de cada página sinaliza que elementos visuais e fórmulas podem não ter sido recuperados integralmente pelo extrator.

## Página 61

, quando 
 for contínua no intervalo 
, contínua à direita em 
 e contínua à esquerda em 
.
Seja a função 
 cujo domínio é descrito pelo intervalo fechado 
. O gráfico dessa função é apresentado na Figura 4. Para analisar a continuidade de 
 em seu domínio, devemos analisar a continuidade de 
 no intervalo aberto 
, além das continuidades nos dois extremos.
f
(a, b)
a
b
[a, b]
a, b ∈ R
f
(a, b)
a
b
f(x) = √9 − x
2
D(f) = [−3,3]
f
f
(−3,3)
f(x) = √9 − x
2
D(f) = [−3,3]
f
f
Disciplina
CÁLCULO DIFERENCIAL E
INTEGRAL I

[conteúdo visual/fórmula não recuperado integralmente da fonte]

## Página 62

Figura 4 | Gráfico da função 
Em relação ao intervalo 
, note que se tomarmos qualquer número real 
(−3,3)
f(x) = √9 − x
2
(−3,3)
(−3,3)
Disciplina
CÁLCULO DIFERENCIAL E
INTEGRAL I

[conteúdo visual/fórmula não recuperado integralmente da fonte]

## Página 63

Logo, 
 é contínua em todos os pontos do intervalo aberto 
. Além disso, a continuidade nas extremidades 3 e -3 também é verificada, pois:
Portanto, 
 é contínua no intervalo fechado, o que implica 
 ser contínua em todo o seu domínio.
Quando estamos analisando a continuidade das funções, é essencial determinar os pontos ou
conjuntos nos quais esse comportamento será examinado. Normalmente, direcionamos nossa
análise para os domínios das funções mais comuns, como polinomiais, racionais, radicais,
exponenciais, logarítmicas, trigonométricas e inversas. No entanto, é crucial reconhecer que nem
todas as funções são contínuas em todos os valores reais. Desse modo, compreender o conceito
de função descontínua e os diferentes tipos de descontinuidades é fundamental, como
abordaremos a seguir.
Siga em Frente...
c ∈ (−3, 3)
lim
x→c
f(x) = lim
x→c
√9 − x2 = √lim
x→c
(9 − x2) = √9 − c
2 = f(c)
f
(−3,3)
f
(−3,3)
lim
x→−3+
f(x) = lim
x→−3+
√9 − x2 = √ lim
x→−3+
(9 − x2) = √9 − (−3)
2 = 0 = f(−3)
lim
x→3−
f(x) = lim
x→3−
√9 − x2 = √ lim
x→3−
(9 − x2) = √9 − 3
2 = 0 = f(3)
f
f
f
f
Disciplina
CÁLCULO DIFERENCIAL E
INTEGRAL I

[conteúdo visual/fórmula não recuperado integralmente da fonte]

## Página 64

Funções descontínuas e tipos de descontinuidades
Dada uma função real 
e um ponto fixado 
, pertencente ou não ao domínio de 
. Dizemos que 
 é descontínua em 
, ou tem descontinuidade em 
, quando 
 não for contínua em 
. Dentre as possíveis descontinuidades que podem ocorrer, temos as removíveis, as de salto e as
infinitas. Observe alguns exemplos de funções e suas descontinuidades, tomando como
referência os gráficos presentes na Figura 5.
(a)  Função  (b)   Função  (c)    Função 
f
a
f
f
a
a
f
a
f
a
f
f
a
a
f
a
f(x) = tg(x) g(x) =
x
2−4
x−2 h(x) =
|x|
x
Disciplina
CÁLCULO DIFERENCIAL E
INTEGRAL I

[conteúdo visual/fórmula não recuperado integralmente da fonte]

## Página 65

Figura 5 | Funções descontínuas.
Seja a função tangente 
, ilustrada na Figura 5(a). Note, por exemplo, que 
 não pertence ao domínio de 
, pois a tangente não está definida para esse valor. Logo, a função tangente não é contínua em 
. Assim, a função tangente apresenta uma descontinuidade em 
, a qual é caracterizada como uma descontinuidade infinita, porque ao calcular os limites laterais
nesse ponto temos 
 e 
, ou seja, limites infinitos.
f(x) = tg(x)
x =
π
2
f
x =
π
2
x =
π
2
lim
x→ π
2
−
tg(x) = +∞
lim
x→ π
2
+
tg(x) = −∞
f(x) = tg(x)
Disciplina
CÁLCULO DIFERENCIAL E
INTEGRAL I

[conteúdo visual/fórmula não recuperado integralmente da fonte]

## Página 66

Considere agora a função 
, com gráfico presente na Figura 5(b). Note que 
 é descontínua em 
 porque 
 não está definida. No entanto, avaliando o limite de 
 em 
, e sabendo que 
 obtemos:
x =
π
2
f
x =
π
2
x =
π
2
lim
x→ π
2
−
tg(x) = +∞
lim
x→ π
2
+
tg(x) = −∞
g(x) =
x
2−4
x−2
g
x = 2
g(2)
g
x = 2
x
2 − 4 = (x + 2)(x − 2)
g(x) =
x
2−4
x−2
g
x = 2
g(2)
g
x = 2
Disciplina
CÁLCULO DIFERENCIAL E
INTEGRAL I

[conteúdo visual/fórmula não recuperado integralmente da fonte]

## Página 67

Assim, apesar de 
 não estar definida em 
A terceira situação possível corresponde à descontinuidade do tipo salto. Nesse caso, podemos
destacar, por exemplo, a função 
, com 
, com gráfico presente na Figura 5(c). Temos que 
 é descontínua em 
, porque não está definida nesse ponto, porém podemos estudar os limites laterais em torno
dele: 
 e 
x
2 − 4 = (x + 2)(x − 2)
lim
x→2
g(x) = lim
x→2
(
x
2−4
x−2 ) = lim
x→2
[
(x+2)(x−2)
x−2 ] = lim
x→2
(x + 2) = 2 + 2 = 4
g
g
x = 2
g
p(x) = {
g(x), se x ≠ 2
4, se x = 2
p(x)
g
R
g
h(x) =
|x|
x
x ≠ 0
h
x = 0
lim
x→0−
h(x) = lim
x→0−
−x
x = −1
lim
x→0+
h(x) = lim
x→0+
x
x = 1
Disciplina
CÁLCULO DIFERENCIAL E
INTEGRAL I

[conteúdo visual/fórmula não recuperado integralmente da fonte]

## Página 68

. Assim, para 
, os limites laterais em torno de 
 existem, mas são diferentes. Nesse caso, a função não possui uma descontinuidade removível,
pois não é possível ajustar a definição de 
 para torná-la contínua, devido aos limites laterais serem diferentes. Portanto, uma
descontinuidade do tipo salto ocorre quando a função apresenta limites laterais distintos em um
ponto específico, o que impede a sua transformação em uma função contínua.
Relacionado ao estudo das funções contínuas, um dos principais resultados associados a essa
temática é o teorema do valor intermediário, cujo enunciado é apresentado a seguir.
Teorema do valor intermediário: Se 
 é uma função contínua em um intervalo fechado 
, com 
, e 
h
x = 0
h
h(x) =
|x|
x
x ≠ 0
h
x = 0
lim
x→0−
h(x) = lim
x→0−
−x
x = −1
lim
x→0+
h(x) = lim
x→0+
x
x = 1
h
x = 0
h
f
[a, b]
a, b ∈ R
k
Disciplina
CÁLCULO DIFERENCIAL E
INTEGRAL I

[conteúdo visual/fórmula não recuperado integralmente da fonte]

## Página 69

é um número real qualquer entre 
 e 
, então existe, no mínimo, um número 
 tal que 
.
Na Figura 6, é apresentado um gráfico que ilustra uma situação na qual o teorema do valor
intermediário é verificado, sendo necessariamente a função 
 contínua.
f(a)
f(b)
c ∈ [a, b]
f(c) = k
f
[a, b]
a, b ∈ R
k
f(a)
f(b)
c ∈ [a, b]
f(c) = k
f
f
Disciplina
CÁLCULO DIFERENCIAL E
INTEGRAL I

[conteúdo visual/fórmula não recuperado integralmente da fonte]

## Página 70

Figura 6 | Ilustração para o teorema do valor intermediário.
A continuidade é um conceito fundamental no estudo das funções, fornecendo informações
valiosas da função em todo o seu domínio. Isso possibilita, por exemplo, a representação de
fenômenos por meio de funções que se ajustam às suas características e podem ser analisadas
com uma variedade de ferramentas matemáticas. Dessa forma, a continuidade contribui
significativamente para a resolução de problemas reais. 
Vamos Exercitar?
Vamos analisar as funções apresentadas com base no conceito de continuidade e nas
classificações dos pontos de descontinuidade.
Disciplina
CÁLCULO DIFERENCIAL E
INTEGRAL I

[conteúdo visual/fórmula não recuperado integralmente da fonte]

## Página 71

Função   com lei de formação:   :
No estudo da função 
Analisemos agora o caso 
Como os limites laterais existem e são iguais entre si, além de coincidirem com a imagem de 
f f(x) = {
x
2−x−2
x−2
, se x ≠ 2
3, se x = 2
f
x ∈ R
x ≠ 2
x
2−x−2
x−2
x ≠ 2
f
(−∞, 2)
(2, +∞)
x = 2
f(2) = 3
x
2 − x − 2 = (x + 1)(x − 2)
lim
x→2−
f(x) = lim
x→2−
x
2−x−2
x−2 = lim
x→2−
(x+1)(x−2)
x−2 = lim
x→2−
(x + 1) = 3
lim
x→2+
f(x) = lim
x→2+
x
2−x−2
x−2 = lim
x→2+
(x+1)(x−2)
x−2 = lim
x→2+
(x + 1) = 3
f
x = 2
Disciplina
CÁLCULO DIFERENCIAL E
INTEGRAL I

[conteúdo visual/fórmula não recuperado integralmente da fonte]

## Página 72

Função   definida a partir de seu gráfico, ilustrado na Figura 1:
Conforme verificado no gráfico da função 
Em 
No caso de 
f
f
D(f) = R
g
g
g
R
x = −1
x = 3
x = 5
x = −1
g
lim
x→−1−
g(x) = lim
x→−1+
g(x) = 1
g
x = −1
g(−1) = 1
x = 3,
lim
x→3+
g(x) = −∞
Disciplina
CÁLCULO DIFERENCIAL E
INTEGRAL I

[conteúdo visual/fórmula não recuperado integralmente da fonte]

## Página 73

Por fim, em 
Portanto, a função 
Saiba mais
Para explorar o estudo da continuidade de funções, recomendamos consultar o livro Cálculo,
volume 1, de James Stewart, Daniel Clegg e Saleem Watson. Na seção 2.5, intitulada
"Continuidade", que abrange as páginas 103 a 111, você encontrará as principais definições e
diversos exemplos sobre funções contínuas e descontínuas. O livro destaca especialmente as
funções mais comuns, como polinomiais, racionais, exponenciais, entre outras.
Além disso, outra sugestão para aprofundar o estudo da continuidade de funções é explorar a
seção 2.4 "Limites e continuidade" do livro Cálculo, volume 1, de Rogawski e Colin Adams. Nessa
lim
x→3−
g(x) = 3
g(3) = 3
x = 3
x = 5
g
lim
x→5−
g(x) = lim
x→5+
g(x) = 4
g(5) = 2.
g
(−∞, −1)
(−1,3]
(3,5)
(5, +∞)
Disciplina
CÁLCULO DIFERENCIAL E
INTEGRAL I

[conteúdo visual/fórmula não recuperado integralmente da fonte]

## Página 74

seção, páginas 75 a 81, você encontrará exemplos importantes que ampliarão sua compreensão
sobre a continuidade de funções.
Outra valiosa fonte para aprofundar seus estudos da continuidade de funções é o livro Cálculo,
volume 1, de Howard Anton, Irl C. Bivens e Stephen L. Davis. Recomendamos explorar a seção
1.5 "Continuidade", páginas 110 a 117. Nessa seção, você encontrará uma discussão abrangente
sobre o tema, incluindo aplicações do teorema do valor intermediário e propriedades das
funções contínuas. Essas informações adicionais oferecerão uma perspectiva mais ampla e
aprofundada do conceito de continuidade de funções, fortalecendo ainda mais seu
conhecimento nessa área.
Referências
ANTON, H. et al. Cálculo. v. 1. 10. ed. Porto Alegre: Bookman, 2014. E-book. Disponível em:
https://integrada.minhabiblioteca.com.br/#/books/9788582602263/. Acesso em: 1 abr. 2024.
ÁVILA, G. S. de S.; ARAÚJO, L. C. L. de. Cálculo: ilustrado, prático e descomplicado. Rio de
Janeiro: LTC, 2012.
GUIDORIZZI, H. L. Um curso de cálculo. v. 1. 6. ed. Rio de Janeiro: LTC, 2018.
ROGAWSKI, Jon; ADAMS, Colin; DOERING, Claus I. Cálculo. V.1. 3 ed. Porto Alegre: Bookman,
2018. E-book. ISBN 9788582604601. Disponível em:
https://integrada.minhabiblioteca.com.br/#/books/9788582604601/. Acesso em: 01 abr. 2024.
STEWART, James; CLEGG, Daniel; WATSON, Saleem. Cálculo. v.1. São Paulo: Cengage Learning
Brasil, 2021. ISBN 9786555584097. Disponível em:
https://integrada.minhabiblioteca.com.br/#/books/9786555584097/. Acesso em: 01 abr. 2024.
Aula 5
Encerramento da Unidade
Videoaula de Encerramento
Este conteúdo é um vídeo!
Disciplina
CÁLCULO DIFERENCIAL E
INTEGRAL I

[conteúdo visual/fórmula não recuperado integralmente da fonte]

## Página 75

Para assistir este conteúdo é necessário que você acesse o AVA pelo
computador ou pelo aplicativo. Você pode baixar os vídeos direto no aplicativo
para assistir mesmo sem conexão à internet.
Dica para você
Aproveite o acesso para baixar os slides do vídeo, isso pode deixar sua
aprendizagem ainda mais completa.
Olá, estudante!
Nesta videoaula você revisitará os conceitos fundamentais relacionados aos limites de funções.
Esse conteúdo é essencial para sua prática profissional, pois permite uma análise mais
detalhada das funções. Isso inclui a capacidade de examinar seu comportamento mesmo em
pontos fora do domínio, para valores extremamente grandes ou pequenos. Tal estudo é aplicável
na investigação de modelos matemáticos associados a uma ampla gama de fenômenos,
provenientes das mais variadas áreas do conhecimento.
Prepare-se para essa jornada de conhecimento!
Ponto de Chegada
Para desenvolver a competência desta unidade, que é compreender o conceito de limite e
empregá-lo na resolução de problemas, utilizando-se de cálculos e ferramentas matemáticas
específicas, você deverá, primeiramente, conhecer os conceitos fundamentais, especialmente o
conceito de limite de função, com suas propriedades e abordagens possíveis.
Os limites de funções constituem um dos pilares fundamentais do cálculo e desempenham um
papel essencial em diversas áreas da Matemática e Ciências. Eles oferecem uma descrição
precisa do comportamento de uma função à medida que a variável independente se aproxima de
determinado valor, bem como quando consideramos valores extremamente grandes ou
pequenos, direcionando nossos estudos para os limites no infinito e limites infinitos. Essa noção
é de suma importância para compreender a continuidade das funções, identificar assíntotas e
explorar outros aspectos cruciais do comportamento das funções.
Além disso, os limites desempenham um papel essencial na definição de conceitos
fundamentais no campo do cálculo diferencial e integral, como as derivadas, por exemplo, que
possuem aplicações cruciais em diversas áreas da ciência e engenharias. Portanto, o estudo dos
limites é indispensável para a construção de uma base sólida no entendimento e aplicação do
cálculo e suas aplicações em diferentes contextos.
É Hora de Praticar!
Disciplina
CÁLCULO DIFERENCIAL E
INTEGRAL I

[conteúdo visual/fórmula não recuperado integralmente da fonte]

## Página 76

Este conteúdo é um vídeo!
Para assistir este conteúdo é necessário que você acesse o AVA pelo
computador ou pelo aplicativo. Você pode baixar os vídeos direto no aplicativo
para assistir mesmo sem conexão à internet.
Na modelagem e solução de problemas do mundo real, frequentemente nos deparamos com
funções que se diferenciam das convencionais, embora sejam construídas com base nelas. Um
exemplo notável é a função de Heaviside, também conhecida como função degrau unitário, cuja
definição é expressa por:
em que  representa um número real, ajustado conforme o contexto. Essa função desempenha
um papel significativo no campo das ciências exatas e engenharias, pois auxilia na descrição de
diversos fenômenos. Um exemplo comum é sua utilização na modelagem de passagens de
correntes elétricas em circuitos sujeitos a chaves que são ligadas e desligadas em condições
específicas.
Considere que, ao deparar-se com essa função durante o estudo de um problema, você precisa
obter conclusões a respeito do seu comportamento. Para isso, é útil construir o gráfico da função
de Heaviside e aplicar os conhecimentos de limites e continuidade para determinar onde a
função é contínua.
Para resolver esse desafio, o primeiro passo é plotar o gráfico da função de Heaviside. Com base
nessa construção e no estudo da função de Heaviside, diante dos conceitos envolvendo limites e
continuidade, faça um estudo a respeito da continuidade da função de Heaviside, justificando
sua resposta. Como você resolveria esse desafio? 
Quais estratégias podem ser empregadas no cálculo do limite de uma função?
Como podemos diferenciar funções contínuas e descontínuas?
Quais propriedades podem ser aplicadas no cálculo dos limites de funções? 
A função de Heaviside possui domínio descrito pelo conjunto   e lei de formação no formato:
Assim, essa função é definida por partes. Como  pode assumir valores positivos, negativos ou
nulos, o gráfico da função de Heaviside pode assumir uma das formas ilustradas na Figura 1.
Hc(x) = {
0, se x < c
1, se x ≥ c
c
R
Hc(x) = { , c ∈ R
0, se x < c
1, se x ≥ c
c
Disciplina
CÁLCULO DIFERENCIAL E
INTEGRAL I

[conteúdo visual/fórmula não recuperado integralmente da fonte]

## Página 77

Figura 1 | Possibilidades para o gráfico da função de Heaviside.
Apesar das diferentes possibilidades de  , podemos caracterizar   como um ponto de
descontinuidade do tipo salto. Sendo assim, vamos analisar os limites laterais dessa função em 
:
Como os limites laterais existem, mas são diferentes, então não existe o limite da função em 
. Além disso, temos que  , de onde segue que a função é contínua à direita de 
.
Dessa forma, a função de Heaviside está definida em  , mas como os limites laterais existem e
são diferentes, então a função é descontínua em   com uma descontinuidade do tipo salto.
Portanto, a continuidade da função se dá nos intervalos   e  , ou seja, em todos
os números reais diferentes de  , ou em  , mas com continuidade à direita em  , o
que conclui o desafio proposto.
Com base no conceito de limite de função, podemos desenvolver outros conceitos fundamentais
voltados para a investigação de uma função, com destaque especial para a continuidade. Nesse
contexto, ao calcular o limite de uma função em um ponto, nos deparamos com diferentes
possibilidades de resultados e interpretações. Por isso, o mapa apresentado a seguir enfatiza
informações essenciais das propriedades das funções com base no resultado do limite. Como
sugestão para estudo, recomendamos a expansão deste mapa com informações adicionais
sobre limites no infinito e outras observações que você considere pertinentes.
c x = c
c
lim
x→c− Hc(x) = 0
lim
x→c+
Hc(x) = 1
x = c Hc(c) = 1
x = c
c
x = c
(−∞, c) (c, +∞)
c R − {c} x = c
Disciplina
CÁLCULO DIFERENCIAL E
INTEGRAL I

[conteúdo visual/fórmula não recuperado integralmente da fonte]

## Página 78

ANTON, H. et al. Cálculo. v. 1. 10. ed. Porto Alegre: Bookman, 2014.
ÁVILA, G. S. de S.; ARAÚJO, L. C. L. de. Cálculo: ilustrado, prático e descomplicado. Rio de
Janeiro: LTC, 2012.
GUIDORIZZI, H. L. Um curso de cálculo. v. 1. 6. ed. Rio de Janeiro: LTC, 2018.
ROGAWSKI, J.; ADAMS, C.; DOERING, C. I. Cálculo. v. 1. 3. ed. Porto Alegre: Bookman, 2018.
STEWART, J.; CLEGG, D.; WATSON, S. Cálculo. v. 1. São Paulo: Cengage Learning Brasil, 2021.
Disciplina
CÁLCULO DIFERENCIAL E
INTEGRAL I

[conteúdo visual/fórmula não recuperado integralmente da fonte]