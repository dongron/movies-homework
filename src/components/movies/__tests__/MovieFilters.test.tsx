import MovieFilters from '@/components/movies/MovieFilters';
import { cleanup, render } from '@testing-library/react';

import { afterEach, describe, expect, it, vi } from 'vitest';

// Behavioural coverage of the URL update (set filter, reset page, preserve other
// params) lives in the `setGridFilter` unit tests. Firing a Radix Select change
// in jsdom is brittle (it needs pointer-capture / scrollIntoView shims and is not
// representative), so these tests assert the toolbar renders the labelled control
// and seeds from the URL without throwing.

const replace = vi.fn();
let currentParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace, push: vi.fn() }),
  usePathname: () => '/',
  useSearchParams: () => currentParams
}));

afterEach(() => {
  cleanup();
  replace.mockReset();
  currentParams = new URLSearchParams();
});

describe('MovieFilters', () => {
  it('renders a labelled Type select', () => {
    const { getByRole } = render(<MovieFilters />);
    expect(getByRole('combobox', { name: 'Type' })).toBeInTheDocument();
  });

  it('renders a labelled Year select', () => {
    const { getByRole } = render(<MovieFilters />);
    expect(getByRole('combobox', { name: 'Year' })).toBeInTheDocument();
  });

  it('renders a labelled Search input', () => {
    const { getByRole } = render(<MovieFilters />);
    expect(getByRole('searchbox', { name: 'Search' })).toBeInTheDocument();
  });

  it('seeds the search input from the URL s param', () => {
    currentParams = new URLSearchParams('s=batman&page=1');
    const { getByRole } = render(<MovieFilters />);
    expect(getByRole('searchbox', { name: 'Search' })).toHaveValue('batman');
  });

  it('shows the default "list" in the search input when s is the default', () => {
    currentParams = new URLSearchParams('s=list&page=1');
    const { getByRole } = render(<MovieFilters />);
    expect(getByRole('searchbox', { name: 'Search' })).toHaveValue('list');
  });

  it('renders without error when all filters are in the URL', () => {
    currentParams = new URLSearchParams('s=batman&type=series&y=2008&page=3');
    const { getByRole } = render(<MovieFilters />);
    expect(getByRole('combobox', { name: 'Type' })).toBeInTheDocument();
    expect(getByRole('combobox', { name: 'Year' })).toBeInTheDocument();
    expect(getByRole('searchbox', { name: 'Search' })).toHaveValue('batman');
  });
});
