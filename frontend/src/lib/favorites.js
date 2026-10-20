import { useSyncExternalStore } from 'react';

const KEY = 'pokedex:favorites';
const listeners = new Set();

function read() {
  try {
    return new Set(JSON.parse(localStorage.getItem(KEY)) ?? []);
  } catch {
    return new Set();
  }
}

let favorites = read();

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function toggleFavorite(id) {
  favorites = new Set(favorites);
  if (favorites.has(id)) favorites.delete(id);
  else favorites.add(id);
  try {
    localStorage.setItem(KEY, JSON.stringify([...favorites]));
  } catch {
    // Sem armazenamento (aba privada etc.): favoritos valem só nesta sessão.
  }
  listeners.forEach((l) => l());
}

export function useFavorites() {
  return useSyncExternalStore(subscribe, () => favorites);
}
