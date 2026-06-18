import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import MovieGridSkeleton from '../MovieGridSkeleton';

afterEach(() => {
  cleanup();
});

describe('MovieGridSkeleton', () => {
  it('renders the grid skeleton container', () => {
    render(<MovieGridSkeleton />);
    expect(screen.getByTestId('movie-grid-skeleton')).toBeInTheDocument();
  });

  it('renders exactly 10 skeleton cards (matching the OMDB page size)', () => {
    render(<MovieGridSkeleton />);
    expect(screen.getAllByTestId('movie-grid-skeleton-card')).toHaveLength(10);
  });

  it('renders no links, images, or real movie content', () => {
    const { container } = render(<MovieGridSkeleton />);
    expect(container.querySelector('a')).toBeNull();
    expect(container.querySelector('img')).toBeNull();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('is built from the base Skeleton primitive', () => {
    const { container } = render(<MovieGridSkeleton />);
    expect(
      container.querySelectorAll('[data-slot="skeleton"]').length,
    ).toBeGreaterThan(0);
  });
});
