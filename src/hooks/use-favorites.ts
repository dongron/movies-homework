'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import type { FavoriteMovie } from '@/types/Movie';

import {
  CHANGE_EVENT,
  STORAGE_KEY,
  getFavorites,
  isFavorite as checkIsFavorite,
  removeFavorite as removeFromStorage,
  toggleFavorite as toggleInStorage,
} from '@/lib/favorites';

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(false);

  const reload = useCallback(() => {
    setFavorites(getFavorites());
  }, []);

  useEffect(() => {
    reload();
    if (!mountedRef.current) {
      mountedRef.current = true;
      setLoading(false);
    }

    const onStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) reload();
    };

    window.addEventListener(CHANGE_EVENT, reload);
    window.addEventListener('storage', onStorageChange);
    return () => {
      window.removeEventListener(CHANGE_EVENT, reload);
      window.removeEventListener('storage', onStorageChange);
    };
  }, [reload]);

  const isFavorite = useCallback(
    (id: string) => favorites.some((m) => m.id === id),
    [favorites],
  );

  const toggle = useCallback((movie: FavoriteMovie) => {
    toggleInStorage(movie);
  }, []);

  const remove = useCallback((id: string) => {
    removeFromStorage(id);
  }, []);

  return { favorites, loading, isFavorite, toggle, remove };
}
