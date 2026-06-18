import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import RemoveFavoriteDialog from '../RemoveFavoriteDialog';

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});

describe('RemoveFavoriteDialog', () => {
  it('renders the movie title in the dialog', () => {
    render(
      <RemoveFavoriteDialog
        movieTitle="Schindler's List"
        open={true}
        onOpenChange={vi.fn()}
        onConfirm={vi.fn()}
      />,
    );
    expect(screen.getByText(/Schindler's List/)).toBeInTheDocument();
  });

  it('calls onConfirm when Remove is clicked', () => {
    const onConfirm = vi.fn();
    render(
      <RemoveFavoriteDialog
        movieTitle="Schindler's List"
        open={true}
        onOpenChange={vi.fn()}
        onConfirm={onConfirm}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /remove/i }));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it('does not call onConfirm when Cancel is clicked', () => {
    const onConfirm = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <RemoveFavoriteDialog
        movieTitle="Schindler's List"
        open={true}
        onOpenChange={onOpenChange}
        onConfirm={onConfirm}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('is not visible when open is false', () => {
    render(
      <RemoveFavoriteDialog
        movieTitle="Schindler's List"
        open={false}
        onOpenChange={vi.fn()}
        onConfirm={vi.fn()}
      />,
    );
    expect(screen.queryByText(/Schindler's List/)).not.toBeInTheDocument();
  });
});
