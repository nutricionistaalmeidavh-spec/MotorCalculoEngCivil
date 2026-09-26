# Mod4cal1.pdf — páginas 47–64

## Páginas 47–50 — Aula 4: Regra de L’Hospital

A regra de L’Hospital é apresentada como uma estratégia para calcular limites de quocientes de funções diferenciáveis quando a substituição direta gera formas indeterminadas do tipo 0/0 ou ∞/∞.

Sob as hipóteses adequadas:

lim f(x)/g(x) = lim f′(x)/g′(x),

quando o limite do quociente das derivadas existe ou é infinito.

### Exemplo 1

lim x→−2 (x³+8)/(x+2).

A substituição direta produz 0/0. Aplicando L’Hospital:

lim 3x²/1 = 3(−2)² = **12**.

### Exemplo 2

lim x→∞ (10x−9)/(−3+12x).

A forma é ∞/∞. Aplicando L’Hospital:

lim 10/12 = **5/6**.

O material reforça que a regra deve ser usada em razões de funções diferenciáveis quando a substituição direta produz 0/0 ou ∞/∞, ou após transformações que levem a uma dessas formas.

## Página 51 — Limites laterais

A regra pode ser aplicada separadamente aos limites laterais.

Exemplo:

g(x)=sen x/x².

Quando x→0⁻:

lim sen x/x² = lim cos x/(2x) = −∞.

Quando x→0⁺:

lim sen x/x² = lim cos x/(2x) = +∞.

Assim, os limites laterais têm sinais opostos e o limite bilateral não existe como número real ou infinito único.

## Página 52 — Forma 0·∞

Exemplo:

lim x→0⁺ x ln x.

A expressão é reescrita como:

x ln x = ln x/(1/x).

A forma passa a ser −∞/∞. Aplicando L’Hospital:

lim (1/x)/(−1/x²) = lim (−x) = **0**.

## Página 53 — Forma ∞−∞

Exemplo:

lim x→0⁺ (1/x − 1/sen x).

Primeiro, a diferença é escrita como um único quociente:

(sen x−x)/(x sen x).

A forma é 0/0. O material aplica L’Hospital sucessivamente e obtém:

**0**.

## Páginas 53–54 — Forma 1^∞

Exemplo:

lim x→0⁺ (1+x)^(1/x).

Aplicando logaritmo natural:

ln L = lim ln(1+x)/x.

A forma é 0/0. Por L’Hospital:

ln L = lim [1/(1+x)]/1 = 1.

Portanto:

L = **e**.

## Páginas 54–55 — Comparação de estratégias

Exemplo:

lim x→0 [√(1+x)−1]/x.

Pelo procedimento algébrico, racionaliza-se o numerador. Pela regra de L’Hospital, deriva-se numerador e denominador:

lim [1/(2√(1+x))]/1 = **1/2**.

O material observa que L’Hospital pode simplificar o cálculo, desde que as condições da regra sejam verificadas.

## Página 56 — Aplicação sucessiva da regra

Exemplo:

lim x→0 (x−sen x)/x³.

A regra é aplicada três vezes:

1. (1−cos x)/(3x²);
2. sen x/(6x);
3. cos x/6.

Resultado:

**1/6**.

Outro exemplo analisa limites laterais de:

sec x/(1+tg x)

quando x→π/2. Os dois lados conduzem ao mesmo valor:

**1**.

## Páginas 57–58 — Aplicação em circuito elétrico

A corrente é modelada por:

I(t)=1/sen t − 1/t.

Para t→0⁺, a forma inicial é ∞−∞, então o material combina as frações:

I(t) = (t−sen t)/(t sen t).

A forma passa a 0/0. Aplicando L’Hospital e, em seguida, novamente quando necessário, o limite obtido é:

**0**.

Assim, no instante de ligação analisado pelo limite lateral direito, a corrente modelada tende a zero.

## Página 59 — Referências

A aula indica referências específicas para formas indeterminadas e a regra de L’Hospital.

## Páginas 60–64 — Encerramento da Unidade 4

A videoaula final retoma os principais tópicos da unidade:

- derivada como taxa de variação;
- regras de derivação;
- taxas relacionadas;
- pontos críticos, máximos e mínimos;
- problemas de otimização;
- testes das derivadas;
- regra de L’Hospital.

A competência sintetizada é reconhecer e compreender os conceitos necessários para solucionar problemas de otimização e taxas relacionadas.

### Problema final do reservatório

O encerramento retorna ao tanque cônico de 8 m de altura e 6 m de diâmetro superior, com vazamento de 10 000 cm³/min e nível subindo a 20 cm/min quando h=2 m.

Pela semelhança de triângulos:

r=3h/8.

Volume:

V=(1/3)πr²h=(3/64)πh³.

Derivando:

dV/dt=(9/64)πh²·dh/dt.

Com h=200 cm e dh/dt=20 cm/min:

dV/dt=112 500π cm³/min.

Se T é a taxa de bombeamento:

112 500π = T−10 000.

Portanto:

T=112 500π+10 000≈**363 429,2 cm³/min**.

A unidade encerra enfatizando que a derivada, embora seja um conceito matemático, possui aplicações em taxas de variação, otimização, engenharia, economia e no cálculo de limites.
