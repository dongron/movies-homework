import type { FavoriteMovie } from '@/types/Movie';

export const STORAGE_KEY = 'movies-homework:favorites';
export const CHANGE_EVENT = 'favorites:changed';

export function getFavorites(): FavoriteMovie[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persist(favorites: FavoriteMovie[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
}

export function isFavorite(id: string): boolean {
  return getFavorites().some((m) => m.id === id);
}

export function addFavorite(movie: FavoriteMovie) {
  const favorites = getFavorites();
  if (favorites.some((m) => m.id === movie.id)) return;
  persist([...favorites, movie]);
}

export function removeFavorite(id: string) {
  const favorites = getFavorites();
  persist(favorites.filter((m) => m.id !== id));
}

export function toggleFavorite(movie: FavoriteMovie) {
  if (isFavorite(movie.id)) {
    removeFavorite(movie.id);
  } else {
    addFavorite(movie);
  }
}
