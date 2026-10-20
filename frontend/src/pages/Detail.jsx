import { use, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { loadDetail, loadIndex, MAX_ID, prefetchDetail } from '../lib/api';
import { toggleFavorite, useFavorites } from '../lib/favorites';
import { transitionTo } from '../lib/transition';
import { artwork, formatNumber, GENERATIONS, TYPES } from '../lib/pokemon';
import TypeBadge from '../components/TypeBadge';
import About from '../components/detail/About';
import Stats from '../components/detail/Stats';
import Evolution from '../components/detail/Evolution';
import Matchups from '../components/detail/Matchups';
import { ChevronIcon, CloseIcon, HeartIcon, SoundIcon, SparkleIcon } from '../components/Icons';

const TABS = [
  { id: 'about', label: 'Sobre' },
  { id: 'stats', label: 'Status' },
  { id: 'evolution', label: 'Evolução' },
  { id: 'matchups', label: 'Fraquezas' },
];

export default function Detail() {
  const id = Number(useParams().id);
  if (!Number.isInteger(id) || id < 1 || id > MAX_ID) {
    return (
      <div className="detail detail--missing">
        <p>Pokémon não encontrado.</p>
        <Link to="/" className="link-btn">Voltar para a lista</Link>
      </div>
    );
  }
  return <DetailView id={id} />;
}

function DetailView({ id }) {
  const index = use(loadIndex());
  const { pokemon, species, evolution } = use(loadDetail(id));
  const favorites = useFavorites();
  const navigate = useNavigate();
  const [tab, setTab] = useState('about');
  const [shiny, setShiny] = useState(false);
  const scroller = useRef(null);
  const touch = useRef(null);

  const entry = index[id - 1];
  const types = pokemon.types.map((t) => t.type.name);
  const color = TYPES[types[0]].color;
  const prev = index[id - 2];
  const next = index[id];
  const genus = species.genera.find((g) => g.language.name === 'en')?.genus;
  const gen = GENERATIONS[entry.gen - 1];
  const isFav = favorites.has(id);

  const go = (target) => target && transitionTo(navigate, `/pokemon/${target.id}`, { ready: loadDetail(target.id) });
  const close = () => navigate('/');

  useEffect(() => {
    if (prev) prefetchDetail(prev.id);
    if (next) prefetchDetail(next.id);
    scroller.current?.scrollTo({ top: 0 });
    document.title = `${entry.name} · Pokédex`;
    return () => { document.title = 'Pokédex'; };
  }, [id, prev, next, entry.name]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.target.closest('input, select, textarea')) return;
      if (e.key === 'ArrowLeft') go(prev);
      else if (e.key === 'ArrowRight') go(next);
      else if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const playCry = () => {
    const src = pokemon.cries?.latest ?? pokemon.cries?.legacy;
    if (!src) return;
    const audio = new Audio(src);
    audio.volume = 0.35;
    audio.play().catch(() => {});
  };

  // Deslizar o dedo na arte troca de Pokémon no celular.
  const onTouchStart = (e) => { touch.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    if (touch.current == null) return;
    const dx = e.changedTouches[0].clientX - touch.current;
    touch.current = null;
    if (Math.abs(dx) > 60) go(dx > 0 ? prev : next);
  };

  return (
    <article className="detail" style={{ '--tc': color, '--tc2': TYPES[types[1] ?? types[0]].color }} ref={scroller}>
      <header className="hero" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <div className="hero__bar">
          <button type="button" className="round-btn" onClick={close} aria-label="Fechar">
            <CloseIcon size={20} />
          </button>
          <span className="hero__num">{formatNumber(id)}</span>
          <button
            type="button"
            className={`round-btn${isFav ? ' round-btn--on' : ''}`}
            onClick={() => toggleFavorite(id)}
            aria-pressed={isFav}
            aria-label={isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          >
            <HeartIcon size={20} filled={isFav} />
          </button>
        </div>

        <div className="hero__stage">
          <span className="hero__watermark" aria-hidden="true">{entry.name}</span>
          <img
            key={`${id}-${shiny}`}
            className="hero-art"
            src={artwork(id, shiny)}
            alt={entry.name}
            width="320"
            height="320"
            decoding="async"
            fetchPriority="high"
          />
        </div>

        <div className="hero__info">
          <div className="hero__flags">
            {species.is_legendary && <span className="flag">Lendário</span>}
            {species.is_mythical && <span className="flag">Mítico</span>}
            {species.is_baby && <span className="flag">Bebê</span>}
            <span className="flag flag--ghost">Geração {gen.label} · {gen.region}</span>
          </div>
          <h1 className="hero__name">{entry.name}</h1>
          {genus && <p className="hero__genus">{genus}</p>}
          <div className="hero__types">
            {types.map((t) => <TypeBadge key={t} type={t} size="lg" />)}
          </div>
          <div className="hero__actions">
            <button type="button" className="pill-btn" onClick={playCry}>
              <SoundIcon size={16} /> Ouvir grito
            </button>
            <button type="button" className="pill-btn" aria-pressed={shiny} onClick={() => setShiny((s) => !s)}>
              <SparkleIcon size={16} /> {shiny ? 'Normal' : 'Shiny'}
            </button>
          </div>
        </div>
      </header>

      <nav className="tabs" role="tablist" style={{ '--i': TABS.findIndex((t) => t.id === tab) }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            className="tab"
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
        <span className="tabs__indicator" aria-hidden="true" />
      </nav>

      <div className="tab-panel" role="tabpanel" key={`${tab}-${id}`}>
        {tab === 'about' && <About pokemon={pokemon} species={species} />}
        {tab === 'stats' && <Stats stats={pokemon.stats} />}
        {tab === 'evolution' && <Evolution chain={evolution.chain} index={index} currentId={id} />}
        {tab === 'matchups' && <Matchups types={types} />}
      </div>

      <footer className="pager">
        {prev ? (
          <button type="button" className="pager__btn" onClick={() => go(prev)}>
            <ChevronIcon dir="left" size={18} />
            <span><small>{formatNumber(prev.id)}</small>{prev.name}</span>
          </button>
        ) : <span />}
        {next && (
          <button type="button" className="pager__btn pager__btn--next" onClick={() => go(next)}>
            <span><small>{formatNumber(next.id)}</small>{next.name}</span>
            <ChevronIcon size={18} />
          </button>
        )}
      </footer>
    </article>
  );
}
