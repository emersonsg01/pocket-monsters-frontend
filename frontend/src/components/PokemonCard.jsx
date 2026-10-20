import { memo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { artwork, formatNumber, TYPES } from '../lib/pokemon';
import { loadDetail, prefetchDetail } from '../lib/api';
import { transitionTo } from '../lib/transition';
import TypeBadge from './TypeBadge';
import { HeartIcon } from './Icons';

function PokemonCard({ pokemon, favorite, active }) {
  const { id, name, types } = pokemon;
  const navigate = useNavigate();
  const img = useRef(null);
  const to = `/pokemon/${id}`;

  const open = (e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    transitionTo(navigate, to, { source: img.current, ready: loadDetail(id) });
  };

  return (
    <Link
      to={to}
      className={`card${active ? ' card--active' : ''}`}
      style={{ '--tc': TYPES[types[0]].color }}
      onClick={open}
      onPointerEnter={() => prefetchDetail(id)}
      onTouchStart={() => prefetchDetail(id)}
      onFocus={() => prefetchDetail(id)}
      aria-current={active ? 'page' : undefined}
    >
      <span className="card__num">{formatNumber(id)}</span>
      {favorite && <HeartIcon className="card__fav" size={16} filled />}
      <img
        ref={img}
        className="card__img"
        src={artwork(id)}
        alt=""
        width="160"
        height="160"
        loading="lazy"
        decoding="async"
      />
      <span className="card__name">{name}</span>
      <span className="card__types">
        {types.map((t) => (
          <TypeBadge key={t} type={t} size="sm" />
        ))}
      </span>
    </Link>
  );
}

export default memo(PokemonCard);
