# Mod4cal1.pdf — páginas 30–46

## Página 30 — Aula 3: Problemas de otimização e testes das derivadas

A aula apresenta o uso das derivadas para compreender crescimento, decrescimento, máximos, mínimos e concavidade, além de modelar problemas de otimização.

O problema de abertura usa o custo:

C(x)=0,01x³−0,6x²+13x

Todas as unidades são vendidas por R$ 7,00 e o objetivo é determinar a produção de lucro máximo.

## Páginas 31–32 — Crescimento e decrescimento

O teste de crescimento/decrescimento usa o sinal da primeira derivada:

- f′(x)>0 em um intervalo ⇒ f é crescente;
- f′(x)<0 em um intervalo ⇒ f é decrescente.

O material usa f(x)=x² como exemplo:

f′(x)=2x.

Logo, f é decrescente em (−∞,0) e crescente em (0,+∞).

## Páginas 33–35 — Testes da primeira e segunda derivadas

### Teste da primeira derivada

Se c é ponto crítico:

- mudança de sinal de f′ de positivo para negativo ⇒ máximo local;
- mudança de negativo para positivo ⇒ mínimo local;
- sem mudança de sinal ⇒ não há máximo nem mínimo local em c.

### Teste da segunda derivada

Se c é ponto crítico e a segunda derivada existe:

- f″(c)>0 ⇒ mínimo local;
- f″(c)<0 ⇒ máximo local.

Exemplo apresentado:

g(x)=2(x+1)²

g′(x)=4(x+1)

O ponto crítico é x=−1. A segunda derivada é constante:

g″(x)=4>0.

Logo, x=−1 é ponto de mínimo local.

## Páginas 36–39 — Concavidade e ponto de inflexão

O material considera:

h(x)=x³.

Derivadas:

h′(x)=3x²

h″(x)=6x.

Em x=0, h′(0)=0 e h″(0)=0. O teste da segunda derivada é inconclusivo para máximo ou mínimo, mas o sinal de h″ muda ao atravessar zero:

- para x<0, h″(x)<0 ⇒ concavidade para baixo;
- para x>0, h″(x)>0 ⇒ concavidade para cima.

Assim, x=0 é ponto de inflexão.

O teste da concavidade é resumido por:

- f″(x)>0 ⇒ gráfico côncavo para cima;
- f″(x)<0 ⇒ gráfico côncavo para baixo.

## Páginas 40–43 — Otimização: caixa de papelão

Uma folha de 12 cm por 24 cm recebe cortes quadrados de lado x nos quatro cantos para formar uma caixa sem tampa.

Dimensões da caixa:

- altura: x;
- comprimento: 24−2x;
- largura: 12−2x.

Volume:

V(x)=(24−2x)(12−2x)x

V(x)=288x−72x²+4x³.

O domínio físico é:

0≤x≤6.

Primeira derivada:

V′(x)=288−144x+12x².

Pontos críticos obtidos:

x=6−2√3≈2,54

x=6+2√3≈9,46.

Somente o primeiro pertence ao domínio físico.

Segunda derivada:

V″(x)=−144+24x.

No ponto viável:

V″(6−2√3)=−48√3<0,

portanto o ponto corresponde a máximo local. Comparando com as extremidades:

- V(0)=0;
- V(6−2√3)≈332,6 cm³;
- V(6)=0.

Logo, o volume máximo ocorre para cortes de lado:

**x=6−2√3≈2,54 cm**.

### Procedimento geral indicado para otimização

- Ler o problema e identificar variáveis, condições e incógnita.
- Construir um diagrama quando possível.
- Atribuir notações às variáveis.
- Expressar a incógnita em função das demais variáveis.
- Reduzir uma função de várias variáveis a uma função de uma variável quando necessário.
- Estudar a função com pontos críticos, primeira e segunda derivadas, concavidade e outros testes pertinentes.
- Relacionar a solução matemática à incógnita original.

## Páginas 43–45 — Exercício: lucro máximo

Custo:

C(x)=0,01x³−0,6x²+13x.

Receita, com preço unitário de R$ 7,00:

R(x)=7x.

Lucro:

L(x)=R(x)−C(x)

L(x)=−0,01x³+0,6x²−6x.

Domínio contextual:

D(L)=[0,+∞).

Raízes apresentadas:

x=0,

x≈12,68,

x≈47,32.

Primeira derivada:

L′(x)=−0,03x²+1,2x−6.

Pontos críticos:

x≈5,86 e x≈34,14.

Segunda derivada:

L″(x)=−0,06x+1,2.

Classificação:

- L″(5,86)=0,8484>0 ⇒ mínimo local;
- L″(34,14)=−0,8484<0 ⇒ máximo local.

Como L(x)→−∞ quando x→+∞, o ponto x≈34,14 corresponde ao lucro máximo no contexto estudado.

## Página 46 — Referências

A aula encerra com referências para crescimento, decrescimento, extremos, concavidade e problemas de máximo e mínimo, e prepara a transição para a Aula 4 — Regra de L’Hospital.
