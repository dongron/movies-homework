import { STORAGE_KEY } from '@/lib/favorites';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';

import FavoritesList from '../FavoritesList';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

const movie1 = { id: 'tt0108052', title: "Schindler's List", year: '1994' };
const movie2 = { id: 'tt0825232', title: 'The Bucket List', year: '2007' };
const movie3 = { id: 'tt11743610', title: 'The Terminal List', year: '2022–' };

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  cleanup();
});

describe('FavoritesList', () => {
  it('shows empty state when no favorites', () => {
    render(<FavoritesList />);
    expect(screen.getByText('No favorites yet.')).toBeInTheDocument();
  });

  it('lists favorites with title as link and year', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([movie1, movie2]));
    render(<FavoritesList />);
    const link1 = screen.getByRole('link', { name: "Schindler's List" });
    expect(link1).toHaveAttribute('href', '/tt0108052');
    expect(screen.getByText('1994')).toBeInTheDocument();
    const link2 = screen.getByRole('link', { name: 'The Bucket List' });
    expect(link2).toHaveAttribute('href', '/tt0825232');
    expect(screen.getByText('2007')).toBeInTheDocument();
  });

  it('renders "now" as the end year for an ongoing series favorite', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([movie3]));
    render(<FavoritesList />);
    expect(screen.getByText('2022–now')).toBeInTheDocument();
  });

  it('shows confirmation dialog before removing', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([movie1, movie2]));
    render(<FavoritesList />);
    const removeButtons = screen.getAllByRole('button', { name: /remove.*from favorites/i });
    fireEvent.click(removeButtons[0]);

    expect(screen.getByText('Remove from favorites?')).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toEqual([movie1, movie2]);

    fireEvent.click(screen.getByRole('button', { name: /^remove$/i }));
    expect(screen.queryByText("Schindler's List")).not.toBeInTheDocument();
    expect(screen.getByText('The Bucket List')).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toEqual([movie2]);
  });

  it('dialog shows the correct movie title', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([movie1, movie2]));
    render(<FavoritesList />);
    const removeButtons = screen.getAllByRole('button', { name: /remove.*from favorites/i });
    fireEvent.click(removeButtons[1]);

    const dialog = screen.getByRole('alertdialog');
    expect(dialog).toHaveTextContent('The Bucket List');
  });

  it('does not remove when cancel is clicked in dialog', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([movie1]));
    render(<FavoritesList />);
    fireEvent.click(screen.getByRole('button', { name: /remove.*from favorites/i }));
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

    expect(screen.getByRole('link', { name: "Schindler's List" })).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toEqual([movie1]);
  });

  it('shows empty state after confirming removal of last favorite', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([movie1]));
    render(<FavoritesList />);
    fireEvent.click(screen.getByRole('button', { name: /remove.*from favorites/i }));
    fireEvent.click(screen.getByRole('button', { name: /^remove$/i }));
    expect(screen.getByText('No favorites yet.')).toBeInTheDocument();
  });

  it('updates when a cross-tab storage event fires (AC 5)', () => {
    render(<FavoritesList />);
    expect(screen.getByText('No favorites yet.')).toBeInTheDocument();

    localStorage.setItem(STORAGE_KEY, JSON.stringify([movie1]));
    fireEvent(
      window,
      new StorageEvent('storage', {
        key: STORAGE_KEY,
        newValue: JSON.stringify([movie1])
      })
    );

    expect(screen.queryByText('No favorites yet.')).not.toBeInTheDocument();
    expect(screen.getByText("Schindler's List")).toBeInTheDocument();
  });

  it('ignores storage events for other keys', () => {
    render(<FavoritesList />);
    expect(screen.getByText('No favorites yet.')).toBeInTheDocument();

    fireEvent(
      window,
      new StorageEvent('storage', {
        key: 'some-other-key',
        newValue: 'irrelevant'
      })
    );

    expect(screen.getByText('No favorites yet.')).toBeInTheDocument();
  });
});
