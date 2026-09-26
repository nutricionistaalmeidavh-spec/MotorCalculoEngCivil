# Mod4cal1.pdf — páginas 1–13

## Página 1 — Aula 1: Taxas Relacionadas

A unidade inicia o estudo das aplicações de derivadas por meio de **taxas relacionadas**, destacando que o conceito é usado quando variáveis estão associadas por uma função diferenciável e suas taxas de variação se relacionam.

## Página 2 — Ponto de partida

O material apresenta um tanque em forma de cone circular reto invertido, com 8 m de altura e diâmetro superior de 6 m. A água escoa a 10 000 cm³/min e também é bombeada para dentro. O problema pede a taxa de bombeamento necessária para que o nível da água suba a 20 cm/min quando a altura da água for 2 m.

A aula relaciona taxas de variação às regras de derivação, especialmente à **regra da cadeia**, e à construção de modelos geométricos.

## Páginas 3–4 — Bola de futebol / esfera

Uma bola é aproximada por uma esfera e recebe ar a 100 cm³/s. O objetivo é determinar a taxa de crescimento do raio quando o diâmetro é 8 cm, isto é, quando r=4 cm.

Volume da esfera:

V = (4/3)πr³

Derivando em relação ao tempo:

dV/dt = 4πr² · dr/dt

Com dV/dt=100 e r=4:

dr/dt = 100 / (4π·16) = 25/(16π) cm/s.

O material define esse tipo de situação como **problema de taxas relacionadas**, porque a taxa desconhecida é determinada a partir de outras variáveis e taxas conhecidas.

### Estratégia indicada pelo material

- Ler cuidadosamente o enunciado.
- Identificar notações para as variáveis relevantes.
- Identificar as taxas conhecidas e a taxa procurada, escrevendo-as como derivadas.
- Encontrar uma equação que relacione as variáveis.
- Derivar para obter uma relação entre as taxas, usando regra da cadeia e outras regras quando necessário.
- Substituir os valores conhecidos somente após a derivação.
- Resolver a equação para a taxa desconhecida.

## Páginas 5–6 — Problema da escada

Uma escada de 1,3 m está apoiada em uma parede. O topo desliza para baixo a 0,2 m/s. O problema pede a rapidez com que a base se afasta da parede quando o topo está a 0,5 m do chão.

Com x como a distância da base à parede e y como a altura do topo:

x² + y² = 1,3² = 1,69

Quando y=0,5, resulta x=1,2.

Derivando em relação ao tempo:

2x dx/dt + 2y dy/dt = 0

Logo:

dx/dt = −(y/x) dy/dt

Com dy/dt=−0,2 m/s, y=0,5 e x=1,2:

dx/dt ≈ 0,083 m/s.

Portanto, a base se afasta da parede a aproximadamente **0,083 m/s**.

## Páginas 6–8 — Volume de uma calha

A calha tem 20 m de comprimento e extremidades em forma de triângulo isósceles de 5 m de base por 2 m de altura. Entra água a 8 m³/min. O problema pede a rapidez com que o nível sobe quando a água tem 1 m de profundidade.

Se b é a base da seção ocupada pela água e h é a profundidade:

V = (1/2)·b·h·20 = 10bh

Por semelhança de triângulos:

5/2 = b/h  ⇒  b = (5/2)h

Assim:

V = 25h²

Derivando:

dV/dt = 50h · dh/dt

Com dV/dt=8 e h=1:

dh/dt = 8/50 = 4/25 = **0,16 m/min**.

## Páginas 8–10 — Problema do farol

O material modela o movimento do feixe de um farol usando um triângulo retângulo e a tangente. A distância do farol à costa é 5 km e x mede a distância do ponto iluminado ao ponto mais próximo da costa.

Relação:

tg θ = x/5  ⇒  x = 5 tg θ

Derivando:

dx/dt = 5 sec²θ · dθ/dt

Para o caso estudado, o feixe realiza 6 rotações por minuto e o resultado apresentado para a velocidade do ponto luminoso é aproximadamente **218,7 km/min**.

## Páginas 10–12 — Retorno ao tanque cônico

O material volta ao problema inicial do reservatório. O tanque tem altura 800 cm e raio superior 300 cm. Pela semelhança de triângulos:

300/800 = r/h  ⇒  r = 3h/8

Volume do cone de água:

V = (1/3)πr²h

Substituindo r=3h/8:

V = (3/64)πh³

Derivando:

dV/dt = (9/64)πh² · dh/dt

Com h=200 cm e dh/dt=20 cm/min:

dV/dt = 112 500π cm³/min.

Como essa variação é a taxa de entrada T menos a saída de 10 000 cm³/min:

112 500π = T − 10 000

T = 112 500π + 10 000 ≈ **363 429,2 cm³/min**.

## Página 13 — Referências e transição

A aula indica referências adicionais para taxas relacionadas e inicia a **Aula 2 — Pontos Críticos, Máximos e Mínimos de Funções**.
