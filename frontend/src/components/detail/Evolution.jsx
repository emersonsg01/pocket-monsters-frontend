import { Link } from 'react-router-dom';
import { artwork, formatNumber, idFromUrl, prettify } from '../../lib/pokemon';
import { ChevronIcon } from '../Icons';

const TIME = { day: 'de dia', night: 'à noite', dusk: 'ao entardecer' };

function condition(details) {
  const d = details[0];
  if (!d) return '';
  const parts = [];
  switch (d.trigger.name) {
    case 'level-up':
      parts.push(d.min_level ? `Nv. ${d.min_level}` : 'Subir nível');
      break;
    case 'use-item':
      parts.push(prettify(d.item.name));
      break;
    case 'trade':
      parts.push('Troca');
      break;
    default:
      parts.push(prettify(d.trigger.name));
  }
  if (d.held_item) parts.push(`segurando ${prettify(d.held_item.name)}`);
  if (d.min_happiness) parts.push('amizade');
  if (d.min_affection) parts.push('afeto');
  if (d.known_move) parts.push(`com ${prettify(d.known_move.name)}`);
  if (d.known_move_type) parts.push(`golpe ${prettify(d.known_move_type.name)}`);
  if (d.location) parts.push(`em ${prettify(d.location.name)}`);
  if (TIME[d.time_of_day]) parts.push(TIME[d.time_of_day]);
  if (d.gender === 1) parts.push('♀');
  if (d.gender === 2) parts.push('♂');
  return parts.join(' · ');
}

function Node({ node, index, currentId }) {
  const id = idFromUrl(node.species.url);
  const entry = index[id - 1];

  return (
    <div className={`evo__node${node.evolves_to.length > 2 ? ' evo__node--fan' : ''}`}>
      <Link to={`/pokemon/${id}`} className={`evo__mon${id === currentId ? ' evo__mon--current' : ''}`}>
        <img src={artwork(id)} alt="" width="84" height="84" loading="lazy" decoding="async" />
        <span className="evo__num">{formatNumber(id)}</span>
        <span className="evo__name">{entry?.name ?? prettify(node.species.name)}</span>
      </Link>
      {node.evolves_to.length > 0 && (
        <div className="evo__children">
          {node.evolves_to.map((child) => (
            <div key={child.species.name} className="evo__branch">
              <span className="evo__arrow">
                <ChevronIcon size={18} />
                <small>{condition(child.evolution_details)}</small>
              </span>
              <Node node={child} index={index} currentId={currentId} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Evolution({ chain, index, currentId }) {
  if (!chain.evolves_to.length) {
    return <p className="muted center">Este Pokémon não evolui.</p>;
  }
  return (
    <div className="evo">
      <Node node={chain} index={index} currentId={currentId} />
    </div>
  );
}
