import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { MovieSearchResult } from '@/types/Movie';

import MovieGrid from '../MovieGrid';

vi.mock('next/image', () => ({
  default: (props: React.ComponentProps<'img'>) => <img {...props} />,
}));

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...props
  }: { href: string; children: React.ReactNode } & React.ComponentProps<'a'>) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

afterEach(cleanup);

const moviesFixture: MovieSearchResult[] = [
  {
    Title: "Schindler's List",
    Year: '1994',
    imdbID: 'tt0108052',
    Type: 'movie',
    Poster: 'https://m.media-amazon.com/images/M/poster1.jpg',
  },
  {
    Title: 'The Terminal List',
    Year: '2022–',
    imdbID: 'tt11743610',
    Type: 'series',
    Poster: 'https://m.media-amazon.com/images/M/poster2.jpg',
  },
  {
    Title: 'Kill List',
    Year: '2011',
    imdbID: 'tt1788391',
    Type: 'movie',
    Poster: 'N/A',
  },
];

describe('MovieGrid', () => {
  it('renders a card for each movie', () => {
    const { getAllByRole } = render(<MovieGrid movies={moviesFixture} />);
    const links = getAllByRole('link');
    expect(links).toHaveLength(3);
  });

  it('renders all movie titles', () => {
    const { getByText } = render(<MovieGrid movies={moviesFixture} />);
    expect(getByText("Schindler's List")).toBeInTheDocument();
    expect(getByText('The Terminal List')).toBeInTheDocument();
    expect(getByText('Kill List')).toBeInTheDocument();
  });

  it('links each card to the correct details page', () => {
    const { getAllByRole } = render(<MovieGrid movies={moviesFixture} />);
    const links = getAllByRole('link');
    expect(links[0]).toHaveAttribute('href', '/tt0108052');
    expect(links[1]).toHaveAttribute('href', '/tt11743610');
    expect(links[2]).toHaveAttribute('href', '/tt1788391');
  });

  it('renders an empty grid when given no movies', () => {
    const { container, queryByRole } = render(<MovieGrid movies={[]} />);
    expect(container.querySelector('[class*="grid"]')).toBeInTheDocument();
    expect(queryByRole('link')).not.toBeInTheDocument();
  });
});
