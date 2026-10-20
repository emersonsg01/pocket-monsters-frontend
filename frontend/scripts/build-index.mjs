// Gera public/pokedex-index.json: um índice compacto (id, nome, tipos, geração)
// de todas as espécies. Usa só ~30 requisições (por tipo e por geração) em vez
// de uma por Pokémon, e o app carrega esse arquivo estático em uma única ida.
import { writeFile } from 'node:fs/promises';

const API = 'https://pokeapi.co/api/v2';
const TYPES = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice', 'fighting', 'poison', 'ground',
  'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy',
];
const GENERATIONS = 9;

// Nomes com hífen que fazem parte do nome oficial.
const KEEP_HYPHEN = new Set([
  'ho-oh', 'porygon-z', 'jangmo-o', 'hakamo-o', 'kommo-o', 'wo-chien', 'chien-pao', 'ting-lu', 'chi-yu',
]);
const SPECIAL_NAMES = {
  'nidoran-f': 'Nidoran♀', 'nidoran-m': 'Nidoran♂', 'mr-mime': 'Mr. Mime', 'mime-jr': 'Mime Jr.',
  'mr-rime': 'Mr. Rime', 'type-null': 'Type: Null', farfetchd: "Farfetch'd", sirfetchd: "Sirfetch'd",
  flabebe: 'Flabébé',
};

const idFromUrl = (url) => Number(url.split('/').filter(Boolean).pop());
const titleCase = (s) => s.replace(/(^|[\s-])(\w)/g, (_, sep, c) => sep + c.toUpperCase());

function displayName(slug) {
  if (SPECIAL_NAMES[slug]) return SPECIAL_NAMES[slug];
  return titleCase(KEEP_HYPHEN.has(slug) ? slug : slug.replace(/-/g, ' '));
}

async function getJson(path) {
  const res = await fetch(`${API}/${path}`);
  if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`);
  return res.json();
}

const [typeData, genData] = await Promise.all([
  Promise.all(TYPES.map((t) => getJson(`type/${t}`))),
  Promise.all(Array.from({ length: GENERATIONS }, (_, i) => getJson(`generation/${i + 1}`))),
]);

const byId = new Map();
genData.forEach((gen, i) => {
  for (const s of gen.pokemon_species) {
    const id = idFromUrl(s.url);
    byId.set(id, { id, slug: s.name, name: displayName(s.name), gen: i + 1, types: [] });
  }
});

typeData.forEach((type, i) => {
  for (const { pokemon, slot } of type.pokemon) {
    const entry = byId.get(idFromUrl(pokemon.url));
    if (entry) entry.types[slot - 1] = TYPES[i];
  }
});

const list = [...byId.values()]
  .sort((a, b) => a.id - b.id)
  .map(({ id, name, gen, types }) => [id, name, gen, types.filter(Boolean)]);

await writeFile(new URL('../public/pokedex-index.json', import.meta.url), JSON.stringify(list));
console.log(`pokedex-index.json: ${list.length} Pokémon`);
