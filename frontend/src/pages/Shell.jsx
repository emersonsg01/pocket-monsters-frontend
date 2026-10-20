import { use, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { Outlet, useMatch, useNavigate } from 'react-router-dom';
import { loadIndex, MAX_ID } from '../lib/api';
import { useFavorites } from '../lib/favorites';
import { transitionTo } from '../lib/transition';
import PokemonCard from '../components/PokemonCard';
import Filters from '../components/Filters';
import { CloseIcon, Pokeball, SearchIcon, ShuffleIcon } from '../components/Icons';

const PAGE = 48;
const DEFAULT_FILTERS = { types: [], gen: 0, onlyFavorites: false, sort: 'id' };

function matches(p, query, filters, favorites) {
  if (filters.gen && p.gen !== filters.gen) return false;
  if (filters.onlyFavorites && !favorites.has(p.id)) return false;
  if (filters.types.some((t) => !p.types.includes(t))) return false;
  if (!query) return true;
  const num = query.replace(/^#/, '');
  if (/^\d+$/.test(num)) return String(p.id).startsWith(String(Number(num)));
  return p.search.includes(query);
}

function sortBy(list, sort) {
  const dir = sort.startsWith('-') ? -1 : 1;
  const key = sort.replace('-', '');
  return [...list].sort((a, b) =>
    key === 'name' ? dir * a.name.localeCompare(b.name) : dir * (a.id - b.id),
  );
}

export default function Shell() {
  const index = use(loadIndex());
  const favorites = useFavorites();
  const navigate = useNavigate();
  const match = useMatch('/pokemon/:id');
  const activeId = match ? Number(match.params.id) : null;
  const searchRef = useRef(null);

  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());

  const results = useMemo(() => {
    const filtered = index.filter((p) => matches(p, deferredQuery, filters, favorites));
    return filters.sort === 'id' ? filtered : sortBy(filtered, filters.sort);
  }, [index, deferredQuery, filters, favorites]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === '/' && document.activeElement !== searchRef.current) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const surprise = () => {
    const pool = results.length ? results : index;
    transitionTo(navigate, `/pokemon/${pool[Math.floor(Math.random() * pool.length)].id}`);
  };

  const isFiltered = query || filters !== DEFAULT_FILTERS;

  return (
    <div className={`app${activeId ? ' app--detail' : ''}`}>
      <main className="list">
        <header className="topbar">
          <div className="topbar__row">
            <a className="brand" href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }}>
              <Pokeball size={30} />
              <span>Pokédex</span>
            </a>
            <label className="search">
              <SearchIcon size={18} />
              <input
                ref={searchRef}
                type="search"
                placeholder="Buscar por nome ou número"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Buscar Pokémon"
                enterKeyHint="search"
              />
              <kbd>/</kbd>
            </label>
            <button type="button" className="icon-btn icon-btn--accent" onClick={surprise} title="Pokémon aleatório">
              <ShuffleIcon size={18} />
              <span className="hide-sm">Surpreenda-me</span>
            </button>
          </div>
          <Filters filters={filters} onChange={setFilters} favoritesCount={favorites.size} />
        </header>

        <div className="list__meta">
          <span>
            {results.length === index.length
              ? `${MAX_ID} Pokémon`
              : `${results.length} de ${index.length} Pokémon`}
          </span>
          {isFiltered && (
            <button type="button" className="link-btn" onClick={() => { setQuery(''); setFilters(DEFAULT_FILTERS); }}>
              <CloseIcon size={14} /> Limpar filtros
            </button>
          )}
        </div>

        {results.length ? (
          <Grid key={`${deferredQuery}|${JSON.stringify(filters)}`} items={results} favorites={favorites} activeId={activeId} />
        ) : (
          <div className="empty">
            <Pokeball size={56} className="empty__ball" />
            <p>Nenhum Pokémon encontrado.</p>
            {filters.onlyFavorites && !favorites.size && <p className="muted">Toque no coração de um Pokémon para favoritá-lo.</p>}
          </div>
        )}
      </main>

      <aside className="panel">
        <Outlet />
      </aside>
    </div>
  );
}

// Renderiza em lotes conforme a rolagem: o DOM nunca carrega os 1025 cards de uma vez.
function Grid({ items, favorites, activeId }) {
  const [limit, setLimit] = useState(PAGE);
  const sentinel = useRef(null);
  const hasMore = limit < items.length;

  useEffect(() => {
    if (!hasMore) return;
    const io = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setLimit((l) => l + PAGE),
      { rootMargin: '1200px 0px' },
    );
    io.observe(sentinel.current);
    return () => io.disconnect();
  }, [hasMore, limit]);

  return (
    <>
      <div className="grid">
        {items.slice(0, limit).map((p) => (
          <PokemonCard key={p.id} pokemon={p} favorite={favorites.has(p.id)} active={p.id === activeId} />
        ))}
      </div>
      {hasMore && <div ref={sentinel} className="grid__sentinel" aria-hidden="true" />}
    </>
  );
}
