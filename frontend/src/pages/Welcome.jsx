import { use } from 'react';
import { Link } from 'react-router-dom';
import { loadIndex } from '../lib/api';
import { artwork, formatNumber, TYPES } from '../lib/pokemon';
import TypeBadge from '../components/TypeBadge';

// Mesmo Pokémon para todo mundo no mesmo dia.
function dailyPick(list) {
  const d = new Date();
  const seed = d.getFullYear() * 1000 + d.getMonth() * 40 + d.getDate();
  return list[(seed * 2654435761) % list.length];
}

export default function Welcome() {
  const index = use(loadIndex());
  const pick = dailyPick(index);

  return (
    <div className="welcome">
      <p className="eyebrow">Pokémon do dia</p>
      <Link to={`/pokemon/${pick.id}`} className="welcome__card" style={{ '--tc': TYPES[pick.types[0]].color }}>
        <img src={artwork(pick.id)} alt="" width="220" height="220" />
        <span className="welcome__num">{formatNumber(pick.id)}</span>
        <span className="welcome__name">{pick.name}</span>
        <span className="card__types">
          {pick.types.map((t) => <TypeBadge key={t} type={t} />)}
        </span>
      </Link>
      <p className="muted">Escolha um Pokémon na lista para ver status, evoluções e fraquezas.</p>
      <ul className="shortcuts">
        <li><kbd>/</kbd> buscar</li>
        <li><kbd>←</kbd><kbd>→</kbd> anterior / próximo</li>
        <li><kbd>Esc</kbd> fechar</li>
      </ul>
    </div>
  );
}
