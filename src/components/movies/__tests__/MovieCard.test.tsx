import type { MovieSearchResult } from '@/types/Movie';
import { cleanup, render } from '@testing-library/react';

import MovieCard from '../MovieCard';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/image', () => ({
  default: (props: React.ComponentProps<'img'>) => <img {...props} />
}));

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode } & React.ComponentProps<'a'>) => (
    <a href={href} {...props}>
      {children}
    </a>
  )
}));

afterEach(cleanup);

const movieFixture: MovieSearchResult = {
  Title: "Schindler's List",
  Year: '1994',
  imdbID: 'tt0108052',
  Type: 'movie',
  Poster:
    'https://m.media-amazon.com/images/M/MV5BNjM1ZDQxYWUtMzQyZS00MTE1LWJmZGYtNGUyNTdlYjM3ZmVmXkEyXkFqcGc@._V1_SX300.jpg'
};

const noPosterFixture: MovieSearchResult = {
  Title: 'Unknown Movie',
  Year: '2020',
  imdbID: 'tt9999999',
  Type: 'movie',
  Poster: 'N/A'
};

const ongoingSeriesFixture: MovieSearchResult = {
  Title: 'The Terminal List',
  Year: '2022–',
  imdbID: 'tt11743610',
  Type: 'series',
  Poster: 'https://m.media-amazon.com/images/M/poster2.jpg'
};

describe('MovieCard', () => {
  it('renders the movie title', () => {
    const { getByText } = render(<MovieCard movie={movieFixture} />);
    expect(getByText("Schindler's List")).toBeInTheDocument();
  });

  it('renders the movie year', () => {
    const { getByText } = render(<MovieCard movie={movieFixture} />);
    expect(getByText('1994')).toBeInTheDocument();
  });

  it('renders the movie type as a badge', () => {
    const { getByText } = render(<MovieCard movie={movieFixture} />);
    expect(getByText('movie')).toBeInTheDocument();
  });

  it('renders the poster image with correct alt text', () => {
    const { getByAltText } = render(<MovieCard movie={movieFixture} />);
    const img = getByAltText("Schindler's List poster");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', movieFixture.Poster);
  });

  it('wraps the poster in a link to /{imdbID}', () => {
    const { getByRole } = render(<MovieCard movie={movieFixture} />);
    const link = getByRole('link');
    expect(link).toHaveAttribute('href', '/tt0108052');
  });

  it('renders a placeholder when poster is N/A', () => {
    const { getByText, queryByRole } = render(<MovieCard movie={noPosterFixture} />);
    expect(getByText('No poster')).toBeInTheDocument();
    expect(queryByRole('img')).not.toBeInTheDocument();
  });

  it('still links to the details page when poster is N/A', () => {
    const { getByRole } = render(<MovieCard movie={noPosterFixture} />);
    const link = getByRole('link');
    expect(link).toHaveAttribute('href', '/tt9999999');
  });

  it('renders "now" as the end year for an ongoing series', () => {
    const { getByText } = render(<MovieCard movie={ongoingSeriesFixture} />);
    expect(getByText('2022–now')).toBeInTheDocument();
  });
});
