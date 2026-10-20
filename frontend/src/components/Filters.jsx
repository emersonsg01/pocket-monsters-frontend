import { GENERATIONS, TYPE_KEYS, TYPES } from '../lib/pokemon';
import { HeartIcon } from './Icons';

export default function Filters({ filters, onChange, favoritesCount }) {
  const { types, gen, onlyFavorites, sort } = filters;
  const set = (patch) => onChange({ ...filters, ...patch });

  const toggleType = (t) => {
    // Até dois tipos: com dois selecionados, mostra quem tem os dois.
    if (types.includes(t)) set({ types: types.filter((x) => x !== t) });
    else set({ types: [...types.slice(-1), t] });
  };

  return (
    <div className="filters">
      <div className="chips" role="group" aria-label="Filtrar por tipo">
        {TYPE_KEYS.map((t) => (
          <button
            key={t}
            type="button"
            className="chip chip--type"
            style={{ '--tc': TYPES[t].color }}
            aria-pressed={types.includes(t)}
            onClick={() => toggleType(t)}
          >
            {TYPES[t].name}
          </button>
        ))}
      </div>
      <div className="filters__row">
        <div className="chips" role="group" aria-label="Filtrar por geração">
          <button type="button" className="chip" aria-pressed={gen === 0} onClick={() => set({ gen: 0 })}>
            Todas
          </button>
          {GENERATIONS.map((g) => (
            <button
              key={g.id}
              type="button"
              className="chip"
              aria-pressed={gen === g.id}
              title={`Geração ${g.label} · ${g.region}`}
              onClick={() => set({ gen: gen === g.id ? 0 : g.id })}
            >
              {g.region}
            </button>
          ))}
        </div>
        <div className="filters__end">
          <button
            type="button"
            className="chip chip--fav"
            aria-pressed={onlyFavorites}
            onClick={() => set({ onlyFavorites: !onlyFavorites })}
          >
            <HeartIcon size={14} filled={onlyFavorites} /> Favoritos{favoritesCount ? ` · ${favoritesCount}` : ''}
          </button>
          <select
            className="select"
            value={sort}
            onChange={(e) => set({ sort: e.target.value })}
            aria-label="Ordenar"
          >
            <option value="id">Nº crescente</option>
            <option value="-id">Nº decrescente</option>
            <option value="name">Nome A–Z</option>
            <option value="-name">Nome Z–A</option>
          </select>
        </div>
      </div>
    </div>
  );
}
