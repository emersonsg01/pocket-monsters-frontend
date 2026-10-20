import { STATS } from '../../lib/pokemon';

const MAX = 255;
const SIZE = 220;
const R = 78;
const C = SIZE / 2;

const point = (i, r) => {
  const a = (Math.PI * 2 * i) / 6 - Math.PI / 2;
  return [C + r * Math.cos(a), C + r * Math.sin(a)];
};

// Cor da barra conforme a faixa do valor-base.
const tone = (v) => (v < 50 ? '#f25f5c' : v < 80 ? '#ffb347' : v < 110 ? '#f7dc6f' : v < 140 ? '#7bd389' : '#38c6d9');

export default function Stats({ stats }) {
  const values = stats.map((s) => ({ key: s.stat.name, label: STATS[s.stat.name], value: s.base_stat }));
  const total = values.reduce((sum, s) => sum + s.value, 0);
  const shape = values.map((s, i) => point(i, (Math.min(s.value, 160) / 160) * R).join(',')).join(' ');

  return (
    <div className="stats">
      <svg className="radar" viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label="Gráfico de status base">
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <polygon key={f} className="radar__ring" points={values.map((_, i) => point(i, R * f).join(',')).join(' ')} />
        ))}
        {values.map((_, i) => {
          const [x, y] = point(i, R);
          return <line key={i} className="radar__axis" x1={C} y1={C} x2={x} y2={y} />;
        })}
        <polygon className="radar__shape" points={shape} />
        {values.map((s, i) => {
          const [x, y] = point(i, R + 22);
          return (
            <text key={s.key} x={x} y={y} className="radar__label" textAnchor="middle" dominantBaseline="middle">
              {s.label}
            </text>
          );
        })}
      </svg>

      <ul className="bars">
        {values.map((s) => (
          <li key={s.key} className="bar">
            <span className="bar__label">{s.label}</span>
            <span className="bar__value">{s.value}</span>
            <span className="bar__track">
              <span className="bar__fill" style={{ '--w': `${(s.value / MAX) * 100}%`, '--c': tone(s.value) }} />
            </span>
          </li>
        ))}
        <li className="bar bar--total">
          <span className="bar__label">Total</span>
          <span className="bar__value">{total}</span>
        </li>
      </ul>
    </div>
  );
}
