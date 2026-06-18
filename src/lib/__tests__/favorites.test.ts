import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { FavoriteMovie } from '@/types/Movie';

import {
  CHANGE_EVENT,
  STORAGE_KEY,
  addFavorite,
  getFavorites,
  isFavorite,
  removeFavorite,
  toggleFavorite,
} from '@/lib/favorites';

const movie: FavoriteMovie = { id: 'tt0108052', title: "Schindler's List", year: '1994' };
const movie2: FavoriteMovie = { id: 'tt0825232', title: 'The Bucket List', year: '2007' };

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('getFavorites', () => {
  it('returns [] when localStorage is empty', () => {
    expect(getFavorites()).toEqual([]);
  });

  it('returns [] when stored value is not valid JSON', () => {
    localStorage.setItem(STORAGE_KEY, '{bad json');
    expect(getFavorites()).toEqual([]);
  });

  it('returns [] when stored value is not an array', () => {
    localStorage.setItem(STORAGE_KEY, '"hello"');
    expect(getFavorites()).toEqual([]);
  });

  it('returns stored favorites', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([movie]));
    expect(getFavorites()).toEqual([movie]);
  });
});

describe('isFavorite', () => {
  it('returns false when movie is not in favorites', () => {
    expect(isFavorite(movie.id)).toBe(false);
  });

  it('returns true when movie is in favorites', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([movie]));
    expect(isFavorite(movie.id)).toBe(true);
  });
});

describe('addFavorite', () => {
  it('adds a movie to favorites', () => {
    addFavorite(movie);
    expect(getFavorites()).toEqual([movie]);
  });

  it('does not add a duplicate', () => {
    addFavorite(movie);
    addFavorite(movie);
    expect(getFavorites()).toEqual([movie]);
  });

  it('adds multiple different movies', () => {
    addFavorite(movie);
    addFavorite(movie2);
    expect(getFavorites()).toEqual([movie, movie2]);
  });

  it('dispatches a change event', () => {
    const handler = vi.fn();
    window.addEventListener(CHANGE_EVENT, handler);
    addFavorite(movie);
    window.removeEventListener(CHANGE_EVENT, handler);
    expect(handler).toHaveBeenCalledOnce();
  });
});

describe('removeFavorite', () => {
  it('removes a movie by id', () => {
    addFavorite(movie);
    addFavorite(movie2);
    removeFavorite(movie.id);
    expect(getFavorites()).toEqual([movie2]);
  });

  it('is a no-op when id is absent', () => {
    addFavorite(movie);
    removeFavorite('tt9999999');
    expect(getFavorites()).toEqual([movie]);
  });

  it('dispatches a change event', () => {
    addFavorite(movie);
    const handler = vi.fn();
    window.addEventListener(CHANGE_EVENT, handler);
    removeFavorite(movie.id);
    window.removeEventListener(CHANGE_EVENT, handler);
    expect(handler).toHaveBeenCalledOnce();
  });
});

describe('toggleFavorite', () => {
  it('adds when not present', () => {
    toggleFavorite(movie);
    expect(getFavorites()).toEqual([movie]);
  });

  it('removes when already present', () => {
    addFavorite(movie);
    toggleFavorite(movie);
    expect(getFavorites()).toEqual([]);
  });
});
