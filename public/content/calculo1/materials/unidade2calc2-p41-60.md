# Unidade2calc2.pdf — páginas 41–60

> Transcrição do texto extraído do arquivo original, preservada por página. O aviso ao fim de cada página sinaliza que elementos visuais e fórmulas podem não ter sido recuperados integralmente pelo extrator.

## Página 41

Retornando agora ao caso do limite de 
Com base nesse limite fundamental, podemos estudar o comportamento de outras funções. Por
exemplo, a partir do limite fundamental, podemos afirmar que 
É importante ressaltar que, apesar de utilizarmos as notações 
−x
2 ≤ x
2 sen (
1
x
) ≤ x
2
lim
x→0
(−x
2) = lim
x→0
x
2 = 0
lim
x→0
(x
2 sen (
1
x
)) = 0
sen(x)
x
x → 0
cos (x) ≤
sen (x)
x ≤ 1
−
π
2 ≤ x ≤
π
2
x ≠ 0
lim
x→0
cos (x) = 1
lim
x→0
1 = 1
lim
x→0
sen(x)
x = 1
lim
x→0
sen(3x)
x = 3
θ = 3x
∞
−∞
Disciplina
CÁLCULO DIFERENCIAL E
INTEGRAL I

[conteúdo visual/fórmula não recuperado integralmente da fonte]

## Página 42

Com base nas propriedades estudadas, vejamos outros exemplos envolvendo o cálculo de
limites. Perceba que em todos os momentos nos quais aplicamos a chamada substituição direta,
basicamente estamos empregando as primeiras propriedades estudadas, envolvendo o limite de
constante, limite de 
(a)   Vamos calcular 
Para esse caso, vamos colocar 2 em evidência no numerador e, em seguida, vamos multiplicar o
numerador e o denominador por 
. Com isso, obtemos:
Sabemos que 
. Além disso, observe que:
Sendo assim,
Portanto,
x
x
lim
x→0
2−2 cos (x)
sen (x)
1
x
1
x
lim
x→0
2−2 cos (x)
sen (x) = lim
x→0
2(cos (x))
sen (x) = lim
x→0
2(1−cos (x))
x
sen (x)
x
lim
x→0
sen(x)
x = 1
lim
x→0
sen(x)
x = 1
1−cos (x)
x = (
1−cos (x)
x )(
1+cos (x)
1+cos (x) ) =
1−cos
2 (x)
x(1+cos (x)) =
sen
2 (x)
x(1+cos (x)) =
sen (x)
x
⋅
sen (x)
1+cos (x)
lim
x→0
1−cos (x)
x = lim
x→0
(
sen (x)
x
⋅
sen (x)
1+cos (x) ) = lim
x→0
(
sen (x)
x ) ⋅ lim
x→0
(
sen (x)
1+cos (x) ) = 1 ⋅
0
2 = 0
Disciplina
CÁLCULO DIFERENCIAL E
INTEGRAL I

[conteúdo visual/fórmula não recuperado integralmente da fonte]

## Página 43

(b)  Se 
Note que 
 e 
. Portanto, pelo teorema do confronto, podemos afirmar que 
.
(c)    Estudemos o limite da função 
Note que a substituição direta do limite conduz à indeterminação 
. Por isso, inicialmente vamos expandir o numerador da função 
:
lim
x→0
2−2 cos (x)
sen (x) = lim
x→0
2(1−cos (x))
x
sen (x)
x
=
2⋅lim
x→0
1−cos (x)
x
lim
x→0
sen (x)
x
= 2⋅0
1 = 0
x
2 + 4 ≤ f(x) ≤ 4 + sen (x)
−2 ≤ x ≤ 5
lim
x→0
f(x)
lim
x→0
(x
2 + 4) = 0
2 + 4 = 4
lim
x→0
(4 + sen (x)) = 4 + 0 = 4
lim
x→0
f(x) = 4
lim
x→0
(x
2 + 4) = 0
2 + 4 = 4
lim
x→0
(4 + sen (x)) = 4 + 0 = 4
lim
x→0
f(x) = 4
g(x) =
(2+x)
3−8
x
x → 0
0
0
g
Disciplina
CÁLCULO DIFERENCIAL E
INTEGRAL I

[conteúdo visual/fórmula não recuperado integralmente da fonte]

## Página 44

Agora, calculando o limite por substituição direta obtemos:
(d)   Calculemos o 
Faremos a avaliação desse limite a partir dos limites laterais correspondentes, sabendo que 
 e 
. Antes, perceba que:
Iniciemos pelo limite à esquerda em 
. Nesse caso,
0
0
g
g(x) =
(2+x)
3−8
x =
(2+x)(4+4x+x
2)−8
x =
8+8x+2x
2+4x+4x
2+x
3−8
x =
x
3+6x
2+12x
x =
x(x
2+6x+12)
x
lim
x→0
(2+x)
3−8
x = lim
x→0
(x
2 + 6x + 12) = 0
2 + 6 ⋅ 0 + 12 = 12
lim
x→2
x+2
x
2−4
lim
x→0−
1
x = −∞
lim
x→0+
1
x = +∞
lim
x→0−
1
x = −∞
lim
x→0+
1
x = +∞
x+2
x
2−4 = x+2
(x−2)(x+2) = 1
x−2
x = 2
x = 2
lim
x→2−
x+2
x
2−4 = lim
x→2−
1
x−2 = lim
x→0−
1
x = −∞
Disciplina
CÁLCULO DIFERENCIAL E
INTEGRAL I

[conteúdo visual/fórmula não recuperado integralmente da fonte]

## Página 45

De forma análoga, para o limite à direita em 
:
Portanto, podemos concluir que 
 não existe.
(e)   Vamos avaliar 
Multiplicando o numerador e o denominador da função por 
 obtemos:
Como queremos avaliar 
 então 
. Nesse caso, empregando a substituição 
 teremos:
x = 2
x = 2
lim
x→2+
x+2
x
2−4 = lim
x→2+
1
x−2 = lim
x→0+
1
x = +∞
lim
x→2
x+2
x
2−4
lim
x→2
x+2
x
2−4
lim
x→−∞
x
√x
2+1
1
x
1
x
x
√x
2+1
=
x
x
1
x √x
2+1
=
1
1
x √x
2+1
x → −∞
x < 0
1
x = −√ 1
x
2
x → −∞
x < 0
Disciplina
CÁLCULO DIFERENCIAL E
INTEGRAL I

[conteúdo visual/fórmula não recuperado integralmente da fonte]

## Página 46

Agora, calculando o limite:
(f)     Estudemos o limite da função 
Dividindo o numerador e o denominador pela maior potência de 
 do denominador, que, no caso, é 
, obtemos:
Agora, calculando o limite, sabendo que 
 quando 
1
x = −√ 1
x2
x
√x
2+1
= 1
1
x √x
2+1
= 1
−√ 1
x
2 √x
2+1
= 1
−√ x
2
x
2 + 1
x
2
= 1
−√1+
1
x
2
lim
x→−∞
x
√x
2+1
= lim
x→−∞
1
−√1+
1
x
2
=
1
−√1+0
= −1
h(x) = 8x
4+3x−5
x
2+1
x → −∞
x
x
2
x
x
2
h(x) =
8x
4+3x−5
x
2+1 =
8x
4
x
2 + 3x
x
2 − 5
x
2
x
2
x
2 − 1
x
2
=
8x
2+ 3
x − 5
x
2
1−
1
x2
8x
2 +
3
x −
5
x
2 → ∞
8x
2 +
3
x −
5
x
2 → ∞
x → −∞
1 − 1
x
2 → 1
x → ∞
Disciplina
CÁLCULO DIFERENCIAL E
INTEGRAL I

[conteúdo visual/fórmula não recuperado integralmente da fonte]

## Página 47

Note que precisamos empregar estratégias específicas no cálculo dos limites, conforme a
função e o tipo de limite a serem estudados (limite no ponto ou no infinito). Por isso a prática do
cálculo de limites é imprescindível para que você possa reconhecer qual é a estratégia mais
eficiente em cada situação. 
Vamos Exercitar?
Vamos avaliar os limites das funções apresentadas:
 quando   tende a valores muito grandes:
Nesse caso, devemos calcular 
 quando   tende a zero:
Devemos calcular 
lim
x→−∞
h(x) = lim
x→−∞
8x
2+
3
x −
5
x
2
1− 1
x
2
= ∞
f(x) = 3 sen (x + π
2
) x
lim
x→∞
f(x) = lim
x→∞
[3 sen (x + π
2
)]
sen (x +
π
2
)
f(x) = 3 sen (x +
π
2
)
f
lim
x→∞
f(x)
g(x) =
tg(x)
x x
lim
x→0
tg(x)
x
lim
x→0
sen(x)
x = 1
tg(x)
x =
sen (x)
cos (x)
x =
sen (x)
cos (x)
⋅
1
x =
sen (x)
x
⋅
1
cos (x)
Disciplina
CÁLCULO DIFERENCIAL E
INTEGRAL I

[conteúdo visual/fórmula não recuperado integralmente da fonte]

## Página 48

Como 
Isto é, 
Saiba mais
Uma primeira referência importante acerca das estratégias de cálculo de limites é o livro Cálculo,
volume 1, de James Stewart, Daniel Clegg e Saleem Watson. Na seção 2.3, “Cálculos usando
propriedades dos limites”, no trecho entre as páginas 84 e 91, você encontrará um estudo
detalhado das propriedades básicas dos limites, incluindo o teorema do confronto.
No livro Um curso de cálculo, volume 1, de Hamilton Luiz Guidorizzi, você também encontrará
conceitos e exemplos interessantes associados ao cálculo de limites. Para isso, consulte a
seção 3.6 “Teorema do confronto”, páginas 90 e 92, seção 3.8 “O limite fundamental”, entre as
páginas 94 e 96, e a seção 3.9 “Propriedades operatórias. Demonstração do teorema do
confronto”, páginas 97 e 98. Nesses trechos você encontrará exemplos e justificativas
importantes relacionadas ao conteúdo em estudo.
Outra referência para o cálculo de limites é o livro Cálculo, volume 1, de Howard Anton, Irl. C.
Bivens e Stephen L. Davis. Na seção 1.2 “Calculando limites”, página 80 até a 86, você encontrará
as primeiras propriedades de limites, bem como o estudo dos limites de funções polinomiais,
racionais e com radicais, além das definidas por partes. Já na seção 1.3 “Limites no infinito;
comportamento final de uma função”, entre as páginas 89 e 96, a discussão se dá acerca dos
limites infinitos e no infinito, relacionados tanto a funções polinomiais, racionais e com radicais
quanto às funções trigonométricas, exponenciais e logarítmicas.
Referências
ANTON, H. et al. Cálculo. v. 1. 10. ed. Porto Alegre: Bookman, 2014. E-book. Disponível em:
https://integrada.minhabiblioteca.com.br/#/books/9788582602263/. Acesso em: 1 abr. 2024
lim
x→0
cos (x) = 1
lim
x→0
tg(x)
x = lim
x→0
(
sen (x)
x
⋅
1
cos (x) ) == lim
x→0
(
sen (x)
x ) ⋅ lim
x→0
(
1
cos (x) ) = 1 ⋅
1
1 = 1
lim
x→0
tg(x)
x = 1
Disciplina
CÁLCULO DIFERENCIAL E
INTEGRAL I

[conteúdo visual/fórmula não recuperado integralmente da fonte]

## Página 49

GOMES, F. M. Pré-cálculo: operações, equações, funções e trigonometria. São Paulo: Cengage
Learning Brasil, 2018.
GUIDORIZZI, H. L. Um curso de cálculo. v. 1. 6. ed. Rio de Janeiro: LTC, 2018. E-book. Disponível
em: https://integrada.minhabiblioteca.com.br/#/books/9788521635574/. Acesso em: 1 abr.
2024.
ROGAWSKI, J.; ADAMS, C.; DOERING, C. I. Cálculo. v. 1. 3. ed. Porto Alegre: Bookman, 2018.
STEWART, J.; CLEGG, D.; WATSON, S. Cálculo. v. 1. São Paulo: Cengage Learning Brasil, 2021.
Disponível em: https://integrada.minhabiblioteca.com.br/#/books/9786555584097/. Acesso em:
1 abr. 2024.
Aula 4
Continuiudade de Funções
Continuidade de funções
Este conteúdo é um vídeo!
Para assistir este conteúdo é necessário que você acesse o AVA pelo
computador ou pelo aplicativo. Você pode baixar os vídeos direto no aplicativo
para assistir mesmo sem conexão à internet.
Dica para você
Aproveite o acesso para baixar os slides do vídeo, isso pode deixar sua
aprendizagem ainda mais completa.
Olá, estudante!
Nesta videoaula você terá a oportunidade de explorar o conceito de continuidade de funções,
acompanhado de exemplos fundamentais. Além disso, abordaremos o conceito de funções
descontínuas e a classificação dos pontos de descontinuidade.
Esse conteúdo é fundamental para sua jornada profissional, pois capacita você a realizar uma
análise abrangente de diversas funções. Isso possibilita a obtenção de insights dos fenômenos
modelados por tais funções, enriquecendo sua prática no campo profissional.
Prepare-se para essa jornada de conhecimento!
Disciplina
CÁLCULO DIFERENCIAL E
INTEGRAL I

[conteúdo visual/fórmula não recuperado integralmente da fonte]

## Página 50

Ponto de Partida
Caro estudante, desejamos a você boas-vindas! Nesta aula investigaremos a propriedade da
continuidade de funções, com base no conceito de limite.
O estudo dos limites das funções possui uma ampla gama de aplicações, dentre elas a avaliação
da continuidade. A continuidade é uma característica intuitiva que indica a ausência de
interrupções nos gráficos das funções. Quando uma função é considerada contínua em seu
domínio, podemos calcular derivadas e integrais em todos os pontos, além de utilizar estratégias
para identificar raízes. Por outro lado, quando as funções são descontínuas, podemos realizar
estudos específicos para compreender essa descontinuidade. Assim, o conceito de continuidade
das funções é essencial para resolver problemas ao analisar as propriedades dos modelos
matemáticos relacionados.
Para contribuir com o estudo dessa temática, vamos analisar as funções definidas da seguinte
forma:
Função   com lei de formação:   ;
Função   definida a partir de seu gráfico, ilustrado na Figura 1.
f f(x) = {
x
2−x−2
x−2
, se x ≠ 2
3, se x = 2
g
Disciplina
CÁLCULO DIFERENCIAL E
INTEGRAL I

[conteúdo visual/fórmula não recuperado integralmente da fonte]

## Página 51

Figura 1 | Representação gráfica para a função 
Como você avaliaria cada função com base no conceito de continuidade? E no caso de serem
descontínuas, qual tipo de descontinuidade poderá ser encontrada?
Prossiga em seus estudos e confira os conceitos necessários para cumprir essa tarefa. 
Vamos Começar!
O estudo do limite de uma função pode ser conduzido em relação a um ponto específico,
independentemente de este pertencer ou não ao domínio da função em análise. No entanto, ao
avaliar a continuidade de uma função, é fundamental considerar que o ponto em questão
pertença ao domínio da função. Isso nos possibilita comparar os valores obtidos por meio do
cálculo de limites com as imagens dos pontos determinados pela função. A seguir, vamos
investigar os critérios fundamentais para a construção de funções contínuas.
Funções contínuas
De forma intuitiva, a continuidade de uma função está associada à ideia de não haver lacunas,
saltos ou interrupções em seu gráfico. Com base nessa observação, podemos inferir que a
função retratada na Figura 2(a) seria considerada contínua, ao passo que a função mostrada na
Figura 2(b) seria classificada como descontínua. No entanto, é importante entender como
podemos justificar essa distinção de maneira teórica.
(a)  Função contínua. (b)  Função descontínua.
Figura 2 | Funções contínuas e descontínuas.
g
Disciplina
CÁLCULO DIFERENCIAL E
INTEGRAL I

[conteúdo visual/fórmula não recuperado integralmente da fonte]

## Página 52

Para a definição de função contínua, considere uma função real 
 e um valor 
 de seu domínio. Dizemos que a função 
 é contínua em 
 quando 
. Note que a definição de continuidade de uma função envolve a ocorrência de três condições: 
 está definida em 
, ou 
 está definida; 
 existe; e 
.
f
a
f
x = a
lim
x→a
f(x) = f(a)
f
a
f(a)
lim
x→a
f(x)
lim
x→a
f(x) = f(a)
f
a
f
x = a
lim
x→a
f(x) = f(a)
f
a
f(a)
lim
x→a
f(x)
lim
x→a
f(x) = f(a)
Disciplina
CÁLCULO DIFERENCIAL E
INTEGRAL I

[conteúdo visual/fórmula não recuperado integralmente da fonte]

## Página 53

Considere o exemplo da função 
. Ela está definida em 
 e é tal que:
Além disso, o limite bilateral de 
 existe em 
 de modo que:
Portanto, a função 
 é contínua em 
, pois 
f(x) = 3x − 2
x = 1
f(x) = 3x − 2
x = 1
f(1) = 3 ⋅ 1 − 2 = 3 − 2 = 1
f
x = 1
f
x = 1
lim
x→1
f(x) = lim
x→1
(3x − 2) = 3 ⋅ 1 − 2 = 3 − 2 = 1 = f(1)
f
x = 1
f
x = 1
lim
x→1
f(x) = f(1)
f
f
R
Disciplina
CÁLCULO DIFERENCIAL E
INTEGRAL I

[conteúdo visual/fórmula não recuperado integralmente da fonte]

## Página 54

Dessa forma, dizemos que 
 é uma função contínua em um intervalo do tipo
, com 
, se 
 for contínua em todos os números do intervalo. No caso do exemplo anterior, tomamos o
intervalo como sendo o conjunto de números reais.
Entre as funções contínuas, podemos citar exemplos como as funções afim, quadráticas,
exponenciais, logarítmicas, seno e cosseno. Além disso, utilizando operações de adição,
multiplicação e composição, podemos criar outras funções contínuas a partir de funções já
existentes com essa propriedade. No caso das funções racionais, a continuidade ocorre nos
intervalos nos quais os denominadores não se anulam, como demonstrado no exemplo a seguir.
Considere a função real cuja lei de formação é 
. Note que a função 
 está definida para todos os números reais diferentes de -2, ou seja, seu domínio é descrito por 
. Logo, a função 
 será contínua em todo o seu domínio, ou seja, para todos os reais diferentes de -2. Por exemplo,
tomando o número 
 temos que:
f
(a, b)
a, b ∈ R
f
f
(a, b)
a, b ∈ R
f
f(x) =
x
2−4
x+2
f
D(f) = {x ∈ R; x ≠ −2}
f
x = 3 ∈ D(f)
f(x) =
x
2−4
x+2
f
Disciplina
CÁLCULO DIFERENCIAL E
INTEGRAL I

[conteúdo visual/fórmula não recuperado integralmente da fonte]

## Página 55

Logo, como 
, podemos concluir que 
 é contínua em 
. Um argumento análogo pode ser empregado para provar que 
 será contínua em cada um dos pontos de seu domínio 
.
A continuidade também pode ser avaliada à esquerda ou à direita em um ponto 
, de modo análogo às relações existentes entre limites bilaterais e limites laterais. Nesse caso, 
 é contínua à direta em um valor 
D(f) = {x ∈ R; x ≠ −2}
f
x = 3 ∈ D(f)
f(3) =
3
2−4
3+4 =
9−4
3+4 =
5
7
lim
x→3
f(x) = lim
x→3
(
x
2−4
x+2 ) =
3
2−4
3+4 =
9−4
3+4 =
5
7
lim
x→3
f(x) = f(3)
f
x = 3
f
D(f)
lim
x→3
f(x) = f(3)
f
x = 3
f
D(f)
a
f
a
Disciplina
CÁLCULO DIFERENCIAL E
INTEGRAL I

[conteúdo visual/fórmula não recuperado integralmente da fonte]

## Página 56

quando 
, sendo contínua à esquerda de 
 no caso em que 
.
Seja agora a função 
, definida por partes, a qual é apresentada a seguir e ilustrada no gráfico da Figura 3.
lim
x→a+
f(x) = f(a)
a
lim
x→a−
f(x) = f(a)
a
f
a
lim
x→a+
f(x) = f(a)
a
lim
x→a−
f(x) = f(a)
f
f
f(x) =
⎪⎧
⎨
⎩
x, se x < 1
2, se 1 ≤ x ≤ 2
x, se x > 2
f(x) =
⎪⎧
⎨
⎩
x, se x < 1
2, se 1 ≤ x ≤ 2
x, se x > 2
Disciplina
CÁLCULO DIFERENCIAL E
INTEGRAL I

[conteúdo visual/fórmula não recuperado integralmente da fonte]

## Página 57

Figura 3 | Gráfico da função definida por partes.
Note que a função 
 da Figura 3 foi construída a partir das funções afim 
 e 
, que são contínuas em seus domínios. Por isso, a função 
 é contínua em seu domínio, exceto possivelmente nos pontos 
f
g(x) = x
h(x) = 2
f
x = 1
Disciplina
CÁLCULO DIFERENCIAL E
INTEGRAL I

[conteúdo visual/fórmula não recuperado integralmente da fonte]

## Página 58

e 
, onde ocorrem as mudanças na lei de formação. Por isso, vamos analisar o que ocorre nesses
dois pontos.
Calculando os limites laterais em 
 podemos observar que 
 e 
. Como os limites de 
 em torno de 
 existem, mas são diferentes, então o limite de 
 em 
 não existe, logo, 
 não é contínua nesse ponto. Porém, como 
 e 
, podemos dizer que 
 é contínua à direita em 
x = 2
f
g(x) = x
h(x) = 2
f
x = 1
x = 2
x = 1
lim
x→1−
f(x) = lim
x→1−
x = 1
lim
x→1+
f(x) = lim
x→1+
2 = 2
f
x = 1
f
x = 1
f
f(1) = 2
lim
x→1+
f(x) = 2
f
Disciplina
CÁLCULO DIFERENCIAL E
INTEGRAL I

[conteúdo visual/fórmula não recuperado integralmente da fonte]

## Página 59

.
Agora, para 
 segue que 
 e 
. Sendo 
, então o limite de 
 existe em 
x = 1
x = 1
lim
x→1−
f(x) = lim
x→1−
x = 1
lim
x→1+
f(x) = lim
x→1+
2 = 2
f
x = 1
f
x = 1
f
f(1) = 2
lim
x→1+
f(x) = 2
f
x = 1
x = 2
lim
x→2−
f(x) = lim
x→2−
2 = 2
lim
x→2+
f(x) = lim
x→2+
x = 2
lim
x→2−
f(x) = lim
x→2+
f(x) = 2
f
x = 2
Disciplina
CÁLCULO DIFERENCIAL E
INTEGRAL I

[conteúdo visual/fórmula não recuperado integralmente da fonte]

## Página 60

e, como 
, podemos concluir que 
 é contínua em 
. Portanto, 
 é contínua em todo seu domínio, com exceção de 
.
Com a caracterização das continuidades à direita e à esquerda, podemos afirmar que uma
função f será contínua em um intervalo fechado do tipo 
, com 
f(2) = 2
f
x = 2
f
x = 1
x = 2
lim
x→2−
f(x) = lim
x→2−
2 = 2
lim
x→2+
f(x) = lim
x→2+
x = 2
lim
x→2−
f(x) = lim
x→2+
f(x) = 2
f
x = 2
f(2) = 2
f
x = 2
f
x = 1
[a, b]
a, b ∈ R
Disciplina
CÁLCULO DIFERENCIAL E
INTEGRAL I

[conteúdo visual/fórmula não recuperado integralmente da fonte]