# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

- The app lives in `frontend/` (React 19 + Vite 6, plain CSS, no UI library). The root `package.json` is an unused npm stub; run all commands from `frontend/`.
- `pocket-monsters-backend` is a gitlink (submodule pointer) with no `.gitmodules` entry; it is an empty directory and the current app does not use it. All data comes from the public PokeAPI.
- Deployed on Vercel from the GitHub repo. Root `vercel.json` builds `frontend/` and serves `frontend/dist`; `frontend/vercel.json` covers the case where the Vercel Root Directory is set to `frontend`. Keep the SPA rewrite and headers in sync between both.
- UI text is in Brazilian Portuguese (type names, labels). PokeAPI has no pt-BR flavor text, so descriptions/genus use English.

## Commands (run in `frontend/`)

```bash
npm install
npm run dev          # Vite dev server (also: .claude/launch.json "pokedex" at repo root, port 5173)
npm run build        # production build to dist/
npm run lint         # ESLint flat config
npm run build:index  # regenerate public/pokedex-index.json from PokeAPI
```

There is no test framework.

## Architecture

- **Static index**: `scripts/build-index.mjs` builds `public/pokedex-index.json` (`[id, name, gen, types]` rows for all 1025 species) from ~27 PokeAPI requests (per type + per generation). The list, search and filters run entirely on this file; no per-Pokémon request is needed to render the grid. Display names are derived from slugs in that script (exceptions map there). Rerun it when a new generation is added and update `MAX_ID` in `src/lib/api.js` and `GENERATIONS` in `src/lib/pokemon.js`.
- **Data loading** (`src/lib/api.js`): fetches are cached as promises in a module Map and tagged with `status`/`value`, so components read them with React 19 `use()` under `<Suspense>` and already-loaded data never re-suspends. `loadDetail(id)` fetches `/pokemon/{id}`, `/pokemon-species/{id}` and the evolution chain together. Cards/pager prefetch on hover/touch/focus and the detail view prefetches its neighbours.
- **Routing** (`src/main.jsx`, data router): `/` renders `Shell` (header, filters, grid) with an `<Outlet>` in the side panel: index → `Welcome` (Pokémon of the day, desktop only), `pokemon/:id` → `Detail`. The list stays mounted while a detail is open (preserves scroll/filters). Layout breakpoint is 1024px: above it the detail is a sticky right panel; below it the panel becomes a fixed full-screen overlay (`.app--detail`), with body scroll locked via `:has()`.
- **Grid**: renders in batches of 48 via an IntersectionObserver sentinel, plus `content-visibility: auto` on cards; the `Grid` is keyed by the filter signature so batches reset on filter change. Search uses `useDeferredValue`.
- **View transitions** (`src/lib/transition.js`): card → detail morphs the card image into `.hero-art` using `document.startViewTransition` + `navigate(to, { flushSync: true })`. Only one element may hold the `hero-art` name per snapshot, so the card gets it temporarily and the `vt-from-card` class on `<html>` suppresses the existing detail image's name during the old snapshot. Keep this in mind if adding more named transitions.
- **Domain helpers** (`src/lib/pokemon.js`): type colors/pt-BR names, the full type-effectiveness chart (`defensiveMatchups`), stat labels, generation/region list, artwork URLs (official artwork on raw.githubusercontent.com).
- **Favorites** (`src/lib/favorites.js`): `localStorage`-backed store exposed via `useSyncExternalStore`.
- **Styling**: single `src/styles.css` with CSS variables (dark default, light via `prefers-color-scheme`). Per-Pokémon theming is done by setting `--tc` (primary type color) / `--tc2` inline and using `color-mix()` in CSS.
