import { defensiveMatchups } from '../../lib/pokemon';
import TypeBadge from '../TypeBadge';

const GROUPS = [
  { test: (m) => m >= 4, label: 'Muito fraco', x: '4×', tone: 'bad' },
  { test: (m) => m === 2, label: 'Fraco', x: '2×', tone: 'bad' },
  { test: (m) => m === 0.5, label: 'Resistente', x: '½×', tone: 'good' },
  { test: (m) => m > 0 && m <= 0.25, label: 'Muito resistente', x: '¼×', tone: 'good' },
  { test: (m) => m === 0, label: 'Imune', x: '0×', tone: 'good' },
];

export default function Matchups({ types }) {
  const all = defensiveMatchups(types);
  return (
    <div className="matchups">
      {GROUPS.map((g) => {
        const list = all.filter((a) => g.test(a.multiplier));
        if (!list.length) return null;
        return (
          <section key={g.x} className={`matchup matchup--${g.tone}`}>
            <h3>
              <span className="matchup__x">{g.x}</span> {g.label}
            </h3>
            <div className="matchup__types">
              {list.map((a) => <TypeBadge key={a.type} type={a.type} />)}
            </div>
          </section>
        );
      })}
      <p className="muted small">Dano recebido de golpes de cada tipo.</p>
    </div>
  );
}
