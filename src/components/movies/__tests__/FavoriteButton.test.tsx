import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { STORAGE_KEY } from '@/lib/favorites';

import FavoriteButton from '../FavoriteButton';
import FavoritesList from '../FavoritesList';

const movie = { id: 'tt0108052', title: "Schindler's List", year: '1994' };

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  cleanup();
});

describe('FavoriteButton', () => {
  it('renders as not-pressed when movie is not in favorites', () => {
    render(<FavoriteButton movie={movie} />);
    const button = screen.getByRole('button', { name: 'Add to favorites' });
    expect(button).toHaveAttribute('aria-pressed', 'false');
  });

  it('renders as pressed when movie is in favorites', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([movie]));
    render(<FavoriteButton movie={movie} />);
    const button = screen.getByRole('button', { name: 'Remove from favorites' });
    expect(button).toHaveAttribute('aria-pressed', 'true');
  });

  it('toggles favorite state on click', () => {
    render(<FavoriteButton movie={movie} />);
    const button = screen.getByRole('button', { name: 'Add to favorites' });
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-pressed', 'true');
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toEqual([movie]);
  });

  it('shows confirmation dialog before removing', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([movie]));
    render(<FavoriteButton movie={movie} />);
    const button = screen.getByRole('button', { name: 'Remove from favorites' });
    fireEvent.click(button);

    expect(screen.getByText('Remove from favorites?')).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toEqual([movie]);

    fireEvent.click(screen.getByRole('button', { name: /^remove$/i }));
    expect(button).toHaveAttribute('aria-pressed', 'false');
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toEqual([]);
  });

  it('does not remove when cancel is clicked in dialog', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([movie]));
    render(<FavoriteButton movie={movie} />);
    const button = screen.getByRole('button', { name: 'Remove from favorites' });
    fireEvent.click(button);

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(button).toHaveAttribute('aria-pressed', 'true');
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toEqual([movie]);
  });

  it('updates FavoritesList when heart is toggled (AC 4: live update)', () => {
    render(
      <>
        <FavoriteButton movie={movie} />
        <FavoritesList />
      </>,
    );
    expect(screen.getByText('No favorites yet.')).toBeInTheDocument();

    const button = screen.getByRole('button', { name: 'Add to favorites' });
    fireEvent.click(button);

    expect(screen.queryByText('No favorites yet.')).not.toBeInTheDocument();
    expect(screen.getByText("Schindler's List")).toBeInTheDocument();
    expect(screen.getByText('1994')).toBeInTheDocument();
  });

  it('updates when a cross-tab storage event fires', () => {
    render(<FavoriteButton movie={movie} />);
    expect(screen.getByRole('button', { name: 'Add to favorites' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );

    localStorage.setItem(STORAGE_KEY, JSON.stringify([movie]));
    fireEvent(
      window,
      new StorageEvent('storage', {
        key: STORAGE_KEY,
        newValue: JSON.stringify([movie]),
      }),
    );

    expect(screen.getByRole('button', { name: 'Remove from favorites' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('reflects removal from FavoritesList in the heart button (AC 4: reverse)', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([movie]));
    render(
      <>
        <FavoriteButton movie={movie} />
        <FavoritesList />
      </>,
    );

    const heartButton = screen.getByRole('button', { name: 'Remove from favorites' });
    expect(heartButton).toHaveAttribute('aria-pressed', 'true');

    const listRemoveButton = screen.getByRole('button', {
      name: `Remove ${movie.title} from favorites`,
    });
    fireEvent.click(listRemoveButton);
    fireEvent.click(screen.getByRole('button', { name: /^remove$/i }));

    expect(heartButton).toHaveAttribute('aria-pressed', 'false');
  });
});
