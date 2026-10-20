export const TYPES = {
  normal: { name: 'Normal', color: '#9fa19f' },
  fire: { name: 'Fogo', color: '#e62829' },
  water: { name: 'Água', color: '#2980ef' },
  electric: { name: 'Elétrico', color: '#fac000' },
  grass: { name: 'Planta', color: '#3fa129' },
  ice: { name: 'Gelo', color: '#3dcef3' },
  fighting: { name: 'Lutador', color: '#ff8000' },
  poison: { name: 'Venenoso', color: '#9141cb' },
  ground: { name: 'Terrestre', color: '#915121' },
  flying: { name: 'Voador', color: '#81b9ef' },
  psychic: { name: 'Psíquico', color: '#ef4179' },
  bug: { name: 'Inseto', color: '#91a119' },
  rock: { name: 'Pedra', color: '#afa981' },
  ghost: { name: 'Fantasma', color: '#704170' },
  dragon: { name: 'Dragão', color: '#5060e1' },
  dark: { name: 'Sombrio', color: '#624d4e' },
  steel: { name: 'Aço', color: '#60a1b8' },
  fairy: { name: 'Fada', color: '#ef70ef' },
};

export const TYPE_KEYS = Object.keys(TYPES);

// Multiplicador de dano: ATTACK[atacante][defensor]; ausente = 1×.
const ATTACK = {
  normal: { rock: 0.5, ghost: 0, steel: 0.5 },
  fire: { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
  water: { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
  electric: { water: 2, electric: 0.5, grass: 0.5, ground: 0, flying: 2, dragon: 0.5 },
  grass: { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
  ice: { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
  fighting: { normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5 },
  poison: { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
  ground: { fire: 2, electric: 2, grass: 0.5, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
  flying: { electric: 0.5, grass: 2, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
  psychic: { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
  bug: { fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5 },
  rock: { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
  ghost: { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
  dragon: { dragon: 2, steel: 0.5, fairy: 0 },
  dark: { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
  steel: { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
  fairy: { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 },
};

/** Quanto dano cada tipo atacante causa contra um Pokémon com os tipos dados. */
export function defensiveMatchups(defenderTypes) {
  return TYPE_KEYS.map((attacker) => ({
    type: attacker,
    multiplier: defenderTypes.reduce((m, t) => m * (ATTACK[attacker][t] ?? 1), 1),
  }));
}

export const GENERATIONS = [
  { id: 1, label: 'I', region: 'Kanto' },
  { id: 2, label: 'II', region: 'Johto' },
  { id: 3, label: 'III', region: 'Hoenn' },
  { id: 4, label: 'IV', region: 'Sinnoh' },
  { id: 5, label: 'V', region: 'Unova' },
  { id: 6, label: 'VI', region: 'Kalos' },
  { id: 7, label: 'VII', region: 'Alola' },
  { id: 8, label: 'VIII', region: 'Galar' },
  { id: 9, label: 'IX', region: 'Paldea' },
];

export const STATS = {
  hp: 'HP',
  attack: 'Ataque',
  defense: 'Defesa',
  'special-attack': 'At. Esp.',
  'special-defense': 'Def. Esp.',
  speed: 'Velocidade',
};

const SPRITES = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon';

export const artwork = (id, shiny = false) =>
  `${SPRITES}/other/official-artwork/${shiny ? 'shiny/' : ''}${id}.png`;

export const formatNumber = (id) => `#${String(id).padStart(4, '0')}`;

export const prettify = (slug) =>
  slug.replace(/-/g, ' ').replace(/(^|\s)(\p{L})/gu, (_, s, c) => s + c.toUpperCase());

export const idFromUrl = (url) => Number(url.split('/').filter(Boolean).pop());
