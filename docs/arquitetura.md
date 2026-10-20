# Arquitetura

Este documento explica como a Pokédex funciona por dentro: de onde vêm os dados, como são carregados e guardados em cache, como as telas se organizam e como estender o app.

## Visão geral

```
PokeAPI ──(build:index, ~27 requisições)──► public/pokedex-index.json
                                                     │
                                         carregado uma vez na abertura
                                                     ▼
                         Shell: busca, filtros e grade (tudo em memória)
                                                     │ clique / hover
                                                     ▼
PokeAPI ──(/pokemon, /pokemon-species, evolution-chain)──► Detail
```

O app não tem backend próprio. A lista inteira roda sobre um índice estático; a PokeAPI só é consultada quando uma ficha é aberta (ou pré-carregada).

## Dados

### Índice estático

`frontend/scripts/build-index.mjs` monta `public/pokedex-index.json`, com uma linha por espécie:

```json
[25, "Pikachu", 1, ["electric"]]
//id  nome      geração  tipos (na ordem dos slots)
```

Em vez de uma requisição por Pokémon (1025), o script consulta os endpoints `/type/{tipo}` (18) e `/generation/{n}` (9) e cruza os resultados. O arquivo resultante tem cerca de 34 KB.

O script também converte o identificador da PokeAPI em nome de exibição (`mr-mime` → `Mr. Mime`, `ho-oh` → `Ho-Oh`). Casos especiais ficam nos mapas `SPECIAL_NAMES` e `KEEP_HYPHEN` do próprio script.

### Ficha do Pokémon

`loadDetail(id)` em `src/lib/api.js` busca, em uma única promessa:

| Endpoint | Usado para |
| --- | --- |
| `/pokemon/{id}` | tipos, status, habilidades, altura, peso, grito |
| `/pokemon-species/{id}` | descrição, categoria, captura, gênero, ovos, lendário/mítico, formas |
| `species.evolution_chain.url` | árvore de evolução |

A PokeAPI não tem textos em português; descrição e categoria usam o inglês. Os nomes de tipos, status e rótulos da interface são traduzidos em `src/lib/pokemon.js`.

As imagens são a arte oficial em `raw.githubusercontent.com/PokeAPI/sprites`, montadas pela função `artwork(id, shiny)`.

## Cache e carregamento

Todas as requisições passam pela função `cached()` em `src/lib/api.js`:

- A **promessa** (não o resultado) fica guardada em um `Map`, então chamadas repetidas reaproveitam a mesma requisição, mesmo que ela ainda esteja em andamento.
- Cada promessa recebe os campos `status` e `value` quando resolve. O `use()` do React 19 lê esses campos e devolve o dado na hora, sem suspender de novo. É isso que deixa instantânea a navegação para fichas já carregadas.
- Se a requisição falha, ela sai do cache para que a próxima tentativa refaça a busca.

Os componentes leem os dados com `use(loadIndex())` e `use(loadDetail(id))` dentro de `<Suspense>`. Enquanto carregam, aparecem os esqueletos de `components/Fallbacks.jsx`; erros vão para o `RouteError` do roteador.

### Pré-carregamento

`prefetchDetail(id)` dispara o `loadDetail` sem esperar o resultado. Ele é chamado:

- ao passar o mouse, tocar ou focar um card (`PokemonCard.jsx`);
- para o Pokémon anterior e o próximo sempre que uma ficha abre (`Detail.jsx`).

Na prática, quando o clique acontece os dados normalmente já chegaram.

## Rotas e layout

As rotas ficam em `src/main.jsx` (data router do React Router 7):

| Rota | Painel |
| --- | --- |
| `/` | `Welcome`: Pokémon do dia e atalhos (visível só no desktop) |
| `/pokemon/:id` | `Detail`: a ficha completa |

As duas são filhas de `Shell`, que desenha o cabeçalho, os filtros e a grade e mostra a rota filha em um `<aside class="panel">`. Como a lista nunca é desmontada, a posição da rolagem e os filtros se mantêm enquanto a ficha está aberta.

O mesmo HTML vira dois layouts por CSS, com o ponto de quebra em **1024 px**:

- **Desktop**: grid de duas colunas; o painel é `sticky`, com a altura da tela e rolagem própria.
- **Celular**: o painel só aparece quando há ficha (classe `.app--detail`) e vira uma camada `position: fixed` em tela cheia. A rolagem da página por baixo é travada com `html:has(.app--detail)`.

## Desempenho

| Técnica | Onde |
| --- | --- |
| Índice estático com pré-carregamento (`<link rel="preload">`) | `index.html`, `scripts/build-index.mjs` |
| Grade renderizada em lotes de 48 por `IntersectionObserver` | `Grid` em `pages/Shell.jsx` |
| `content-visibility: auto` nos cards (o navegador pula os fora da tela) | `.card` em `styles.css` |
| Imagens com `loading="lazy"`, `decoding="async"` e dimensões fixas | `PokemonCard.jsx` |
| Busca com `useDeferredValue` (digitar não trava a grade) | `pages/Shell.jsx` |
| Cards com `memo` | `PokemonCard.jsx` |
| Cache de promessas e pré-carregamento | `lib/api.js` |
| `preconnect` para PokeAPI, sprites e fontes | `index.html` |
| Sem biblioteca de UI: só React, React Router e CSS próprio | `package.json` |

A grade recebe uma `key` derivada dos filtros, então qualquer mudança de filtro reinicia os lotes no primeiro.

## Transição do card para a ficha

`src/lib/transition.js` usa a View Transitions API para a imagem do card "voar" até a arte grande da ficha:

1. Espera os dados da ficha por até 500 ms, para que o novo estado já esteja pronto.
2. Dá à imagem do card o nome de transição `hero-art`.
3. Põe a classe `vt-from-card` no `<html>`, que tira o nome `hero-art` da ficha que já estava aberta (no desktop). Cada captura só pode ter um elemento com o mesmo nome.
4. Dentro de `startViewTransition`, remove o nome do card e a classe e navega com `flushSync`. A nova ficha, que tem `hero-art` via CSS, vira o destino da animação.

Sem suporte à API, ou com "reduzir movimento" ativo, a navegação acontece normalmente, sem animação. Ao adicionar novas transições com nome, lembre que um nome não pode se repetir na mesma captura.

## Estilo e temas

Todo o estilo está em `src/styles.css`:

- **Tokens** em `:root` (cores, raio, sombra, fonte), redefinidos em `prefers-color-scheme: light`.
- **Cor por Pokémon**: os componentes definem `--tc` (cor do primeiro tipo) e `--tc2` (segundo tipo) inline, e o CSS deriva fundos, bordas e brilhos com `color-mix()`.
- Fonte Outfit (Google Fonts), com fontes do sistema como alternativa.
- As classes seguem um BEM simples: `bloco__elemento--variante`.

## Favoritos

`src/lib/favorites.js` guarda um `Set` de ids no `localStorage` (chave `pokedex:favorites`) e o expõe via `useSyncExternalStore`, então qualquer componente que usa `useFavorites()` atualiza junto. Se o armazenamento estiver indisponível (aba privada, por exemplo), os favoritos valem só durante a sessão.

## Regras de tipos

`defensiveMatchups(tipos)` em `src/lib/pokemon.js` multiplica, para cada tipo atacante, a eficácia contra cada tipo do defensor, usando a tabela `ATTACK` (regras da Geração 6 em diante). A aba Fraquezas agrupa o resultado em 4×, 2×, ½×, ¼× e 0×.

## Como estender

**Nova geração de Pokémon**
1. Acrescente a geração em `GENERATIONS` (`src/lib/pokemon.js`) e ajuste `GENERATIONS` no script de índice.
2. Atualize `MAX_ID` em `src/lib/api.js`.
3. Rode `npm run build:index` e confira os nomes novos (inclua exceções em `SPECIAL_NAMES`/`KEEP_HYPHEN` se preciso).

**Nova aba na ficha**
1. Crie o componente em `src/components/detail/`.
2. Adicione a entrada em `TABS` e a renderização condicional em `pages/Detail.jsx`.
3. O indicador da aba usa `grid-template-columns: repeat(4, 1fr)` e largura `/ 4` em `.tabs` e `.tabs__indicator`; ajuste esses valores para o novo número de abas.

**Novo filtro**
Adicione o campo em `DEFAULT_FILTERS` e a condição em `matches()` (`pages/Shell.jsx`), e o controle em `components/Filters.jsx`. Se o filtro precisar de dados que não estão no índice, inclua-os no script de índice, para que a lista continue sem requisições por Pokémon.
