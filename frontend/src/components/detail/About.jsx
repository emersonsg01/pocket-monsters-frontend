import { prettify } from '../../lib/pokemon';

const num = (v, digits = 1) => v.toLocaleString('pt-BR', { maximumFractionDigits: digits });

function flavorText(species) {
  const entries = species.flavor_text_entries.filter((f) => f.language.name === 'en');
  return entries.at(-1)?.flavor_text.replace(/[\f\n­]+/g, ' ') ?? '';
}

export default function About({ pokemon, species }) {
  const female = species.gender_rate < 0 ? null : (species.gender_rate / 8) * 100;
  const forms = species.varieties.filter((v) => !v.is_default);

  return (
    <div className="about">
      {flavorText(species) && <p className="flavor">{flavorText(species)}</p>}

      <dl className="facts">
        <div><dt>Altura</dt><dd>{num(pokemon.height / 10)} m</dd></div>
        <div><dt>Peso</dt><dd>{num(pokemon.weight / 10)} kg</dd></div>
        <div><dt>Captura</dt><dd>{Math.round((species.capture_rate / 255) * 100)}%</dd></div>
        <div><dt>Exp. base</dt><dd>{pokemon.base_experience ?? '—'}</dd></div>
      </dl>

      <section className="block">
        <h3>Habilidades</h3>
        <div className="pills">
          {pokemon.abilities.map((a) => (
            <span key={a.ability.name} className={`pill${a.is_hidden ? ' pill--hidden' : ''}`}>
              {prettify(a.ability.name)}
              {a.is_hidden && <small>oculta</small>}
            </span>
          ))}
        </div>
      </section>

      <section className="block">
        <h3>Gênero</h3>
        {female === null ? (
          <p className="muted">Sem gênero</p>
        ) : (
          <div className="gender">
            <span className="gender__m">♂ {num(100 - female)}%</span>
            <span className="gender__bar" style={{ '--f': `${female}%` }} />
            <span className="gender__f">♀ {num(female)}%</span>
          </div>
        )}
      </section>

      <dl className="rows">
        <div><dt>Grupos de ovos</dt><dd>{species.egg_groups.map((g) => prettify(g.name)).join(', ') || '—'}</dd></div>
        <div><dt>Crescimento</dt><dd>{prettify(species.growth_rate.name)}</dd></div>
        <div><dt>Felicidade base</dt><dd>{species.base_happiness ?? '—'}</dd></div>
        {species.habitat && <div><dt>Habitat</dt><dd>{prettify(species.habitat.name)}</dd></div>}
      </dl>

      {forms.length > 0 && (
        <section className="block">
          <h3>Outras formas</h3>
          <div className="pills">
            {forms.map((f) => <span key={f.pokemon.name} className="pill">{prettify(f.pokemon.name)}</span>)}
          </div>
        </section>
      )}
    </div>
  );
}
