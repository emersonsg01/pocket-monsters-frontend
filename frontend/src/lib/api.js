const API = 'https://pokeapi.co/api/v2';
const cache = new Map();

// Promessas ficam em cache e são marcadas com status para que o `use()` do
// React leia dados já resolvidos sem suspender de novo (navegação instantânea).
function cached(key, load) {
  if (!cache.has(key)) {
    const promise = load();
    promise.status = 'pending';
    promise.then(
      (value) => Object.assign(promise, { status: 'fulfilled', value }),
      (reason) => {
        Object.assign(promise, { status: 'rejected', reason });
        cache.delete(key);
      },
    );
    cache.set(key, promise);
  }
  return cache.get(key);
}

async function getJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export const MAX_ID = 1025;

export function loadIndex() {
  return cached('index', async () => {
    const rows = await getJson(`${import.meta.env.BASE_URL}pokedex-index.json`);
    return rows.map(([id, name, gen, types]) => ({ id, name, gen, types, search: name.toLowerCase() }));
  });
}

export function loadDetail(id) {
  return cached(`detail:${id}`, async () => {
    const [pokemon, species] = await Promise.all([
      getJson(`${API}/pokemon/${id}`),
      getJson(`${API}/pokemon-species/${id}`),
    ]);
    const evolution = await getJson(species.evolution_chain.url);
    return { pokemon, species, evolution };
  });
}

export function prefetchDetail(id) {
  loadDetail(id).catch(() => {});
}
