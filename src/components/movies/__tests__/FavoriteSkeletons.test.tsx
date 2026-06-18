import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/hooks/use-favorites', () => ({
  useFavorites: () => ({
    favorites: [],
    loading: true,
    isFavorite: () => false,
    toggle: vi.fn(),
    remove: vi.fn(),
  }),
}));

import FavoriteButton from '../FavoriteButton';
import FavoritesList from '../FavoritesList';

const movie = { id: 'tt0108052', title: "Schindler's List", year: '1994' };

afterEach(() => {
  cleanup();
});

describe('FavoriteButton skeleton', () => {
  it('renders skeleton when loading', () => {
    render(<FavoriteButton movie={movie} />);
    expect(screen.getByTestId('favorite-button-skeleton')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});

describe('FavoritesList skeleton', () => {
  it('renders skeleton rows when loading', () => {
    render(<FavoritesList />);
    expect(screen.getByTestId('favorites-list-skeleton')).toBeInTheDocument();
    expect(screen.queryByText('No favorites yet.')).not.toBeInTheDocument();
  });

  it('renders heading while loading', () => {
    render(<FavoritesList />);
    expect(screen.getByText('Favorites')).toBeInTheDocument();
  });
});
