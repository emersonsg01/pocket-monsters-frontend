# Pokédex

Pokédex moderna e responsiva com os **1025 Pokémon**, feita para funcionar tão bem no celular quanto no computador. Construída com React 19 + Vite e dados públicos da [PokeAPI](https://pokeapi.co).

## Funcionalidades

**Lista**
- Busca instantânea por nome ou número (`25`, `#025`, `pika`)
- Filtro por tipo (até dois combinados — mostra quem tem ambos) e por região/geração
- Favoritos salvos no navegador e filtro "só favoritos"
- Ordenação por número ou nome, crescente ou decrescente
- Botão **Surpreenda-me**: abre um Pokémon aleatório entre os resultados filtrados

**Ficha do Pokémon**
- Arte oficial com alternância **shiny** e botão para **ouvir o grito**
- **Sobre**: descrição da Pokédex, altura, peso, taxa de captura, experiência base, habilidades (incluindo a oculta), proporção de gênero, grupos de ovos, crescimento, habitat e outras formas
- **Status**: gráfico radar e barras dos status base, com total
- **Evolução**: árvore clicável com as condições (nível, item, troca, amizade, horário, local…)
- **Fraquezas**: dano recebido de cada tipo (4×, 2×, ½×, ¼×, imune), calculado localmente
- Navegação para o anterior/próximo, por botão, teclado ou gesto de deslizar

**Interface**
- Desktop (≥ 1024 px): lista à esquerda e ficha em painel lateral fixo; sem seleção, mostra o **Pokémon do dia**
- Celular: a ficha abre em tela cheia sobre a lista, que mantém a rolagem e os filtros
- Tema escuro ou claro conforme o sistema; respeita "reduzir movimento"
- Transição animada: a imagem do card "voa" até a ficha (View Transitions API, nos navegadores que suportam)

### Atalhos de teclado

| Tecla | Ação |
| --- | --- |
| `/` | Focar a busca |
| `←` / `→` | Pokémon anterior / próximo (com a ficha aberta) |
| `Esc` | Fechar a ficha |

## Como rodar

Requer Node.js 18 ou superior. Todos os comandos são executados dentro de `frontend/`.

```bash
cd frontend
npm install
npm run dev
```

O app abre em `http://localhost:5173`.

| Script | O que faz |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento com recarregamento instantâneo |
| `npm run build` | Build de produção em `frontend/dist/` |
| `npm run preview` | Serve o build de produção localmente |
| `npm run lint` | Verifica o código com ESLint |
| `npm run build:index` | Regenera `public/pokedex-index.json` a partir da PokeAPI |

## Publicação

### Vercel

O projeto já vem configurado para a Vercel. Com o repositório conectado, cada push gera um deploy automático: o branch de produção (normalmente `main`) publica o site, e os demais branches geram URLs de prévia.

- O `vercel.json` da raiz instala e compila o app que está em `frontend/` e publica `frontend/dist`. Nas configurações do projeto na Vercel, deixe **Root Directory** vazio (raiz do repositório) e não sobrescreva os comandos de build.
- Se preferir definir **Root Directory** como `frontend`, também funciona: nesse caso vale o `frontend/vercel.json`, e a Vercel detecta o Vite sozinha.
- Os dois arquivos redirecionam qualquer rota para o `index.html` (necessário para abrir `/pokemon/25` direto) e configuram cache longo para os arquivos com hash em `/assets/`.

Não é preciso configurar variáveis de ambiente.

### Outros provedores

O build gera arquivos estáticos em `frontend/dist/` que podem ser hospedados em qualquer serviço estático (Netlify, GitHub Pages, Cloudflare Pages…). Duas observações:

- **Rotas da SPA**: endereços como `/pokemon/25` precisam cair no `index.html`. Configure o redirecionamento de fallback do seu provedor (por exemplo, `/* /index.html 200` no Netlify).
- **Raiz do domínio**: o `index.html` referencia `/pokedex-index.json` e `/pokeball.svg` com caminho absoluto. Para publicar em um subcaminho, ajuste o `base` no `vite.config.js` e esses caminhos.

## Estrutura

```
frontend/
├── public/
│   └── pokedex-index.json   índice estático dos 1025 Pokémon (gerado)
├── scripts/
│   └── build-index.mjs      gera o índice a partir da PokeAPI
└── src/
    ├── main.jsx             rotas e ponto de entrada
    ├── styles.css           todo o estilo (tokens, layout, componentes)
    ├── lib/                 dados, cache, regras de tipos, favoritos, transições
    ├── pages/               Shell (lista), Detail (ficha), Welcome (painel vazio)
    └── components/          cards, filtros, ícones e seções da ficha
```

Detalhes de funcionamento interno, desempenho e como estender estão em [docs/arquitetura.md](docs/arquitetura.md).

## Créditos

Dados e imagens: [PokeAPI](https://pokeapi.co) e [PokeAPI/sprites](https://github.com/PokeAPI/sprites). Pokémon e nomes relacionados são marcas da Nintendo, Game Freak e The Pokémon Company; este é um projeto de fã, sem fins comerciais.
