import type { MovieDetails } from '@/types/Movie';
import { cleanup, render } from '@testing-library/react';

import MoviePage from '../MoviePage';
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

const fixture: MovieDetails = {
  Title: "Schindler's List",
  Year: '1994',
  Rated: 'R',
  Released: '04 Feb 1994',
  Runtime: '195 min',
  Genre: 'Biography, Drama, History',
  Director: 'Steven Spielberg',
  Writer: 'Thomas Keneally, Steven Zaillian',
  Actors: 'Liam Neeson, Ralph Fiennes, Ben Kingsley',
  Plot: 'In German-occupied Poland during World War II, industrialist Oskar Schindler gradually becomes concerned for his Jewish workforce after witnessing their persecution by the Nazis.',
  Language: 'English, Hebrew, German, Polish, Latin',
  Country: 'United States',
  Awards: 'Won 7 Oscars. 91 wins & 49 nominations total',
  Poster:
    'https://m.media-amazon.com/images/M/MV5BNjM1ZDQxYWUtMzQyZS00MTE1LWJmZGYtNGUyNTdlYjM3ZmVmXkEyXkFqcGc@._V1_QL75_UX380_CR0,4,380,562_.jpg',
  Ratings: [
    { Source: 'Internet Movie Database', Value: '9.0/10' },
    { Source: 'Rotten Tomatoes', Value: '98%' },
    { Source: 'Metacritic', Value: '95/100' }
  ],
  Metascore: '95',
  imdbRating: '9.0',
  imdbVotes: '1,582,378',
  imdbID: 'tt0108052',
  Type: 'movie',
  DVD: 'N/A',
  BoxOffice: '$96,898,818',
  Production: 'N/A',
  Website: 'N/A',
  Response: 'True'
};

const naPosterFixture: MovieDetails = {
  ...fixture,
  Poster: 'N/A'
};

const naFieldsFixture: MovieDetails = {
  ...fixture,
  BoxOffice: 'N/A',
  Awards: 'N/A',
  DVD: 'N/A',
  Production: 'N/A',
  Website: 'N/A'
};

const ongoingSeriesFixture: MovieDetails = {
  ...fixture,
  Title: 'The Terminal List',
  Year: '2022–',
  Type: 'series'
};

describe('MoviePage', () => {
  it('renders the movie title and year', () => {
    const { getByText } = render(<MoviePage movie={fixture} />);
    expect(getByText("Schindler's List")).toBeInTheDocument();
    expect(getByText('1994')).toBeInTheDocument();
  });

  it('renders "now" as the end year for an ongoing series', () => {
    const { getByText } = render(<MoviePage movie={ongoingSeriesFixture} />);
    expect(getByText('2022–now')).toBeInTheDocument();
  });

  it('renders the plot', () => {
    const { getByText } = render(<MoviePage movie={fixture} />);
    expect(getByText(/industrialist Oskar Schindler/)).toBeInTheDocument();
  });

  it('renders each genre as a separate badge', () => {
    const { getByText } = render(<MoviePage movie={fixture} />);
    expect(getByText('Biography')).toBeInTheDocument();
    expect(getByText('Drama')).toBeInTheDocument();
    expect(getByText('History')).toBeInTheDocument();
  });

  it('renders each rating source and value', () => {
    const { getByText } = render(<MoviePage movie={fixture} />);
    expect(getByText('Internet Movie Database')).toBeInTheDocument();
    expect(getByText('9.0/10')).toBeInTheDocument();
    expect(getByText('Rotten Tomatoes')).toBeInTheDocument();
    expect(getByText('98%')).toBeInTheDocument();
    expect(getByText('Metacritic')).toBeInTheDocument();
    expect(getByText('95/100')).toBeInTheDocument();
  });

  it('renders the poster with correct alt text', () => {
    const { getByAltText } = render(<MoviePage movie={fixture} />);
    const img = getByAltText("Schindler's List poster");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', fixture.Poster);
  });

  it('renders a placeholder when poster is N/A', () => {
    const { getByText, queryByRole } = render(<MoviePage movie={naPosterFixture} />);
    expect(getByText('No poster')).toBeInTheDocument();
    expect(queryByRole('img')).not.toBeInTheDocument();
  });

  it('hides fields whose value is N/A', () => {
    const { queryByText } = render(<MoviePage movie={naFieldsFixture} />);
    expect(queryByText('N/A')).not.toBeInTheDocument();
  });

  it('renders the back link to /', () => {
    const { getByText } = render(<MoviePage movie={fixture} />);
    const link = getByText(/back to movies/i).closest('a');
    expect(link).toHaveAttribute('href', '/');
  });

  it('renders director, writer, and actors', () => {
    const { getByText } = render(<MoviePage movie={fixture} />);
    expect(getByText('Steven Spielberg')).toBeInTheDocument();
    expect(getByText('Thomas Keneally, Steven Zaillian')).toBeInTheDocument();
    expect(getByText('Liam Neeson, Ralph Fiennes, Ben Kingsley')).toBeInTheDocument();
  });

  it('renders box office when not N/A', () => {
    const { getByText } = render(<MoviePage movie={fixture} />);
    expect(getByText('$96,898,818')).toBeInTheDocument();
  });

  it('renders rated, runtime, and released', () => {
    const { getByText } = render(<MoviePage movie={fixture} />);
    expect(getByText('R')).toBeInTheDocument();
    expect(getByText('195 min')).toBeInTheDocument();
    expect(getByText('04 Feb 1994')).toBeInTheDocument();
  });

  it('renders awards when not N/A', () => {
    const { getByText } = render(<MoviePage movie={fixture} />);
    expect(getByText('Won 7 Oscars. 91 wins & 49 nominations total')).toBeInTheDocument();
  });

  it('hides rated and runtime when N/A', () => {
    const naMetaFixture: MovieDetails = {
      ...fixture,
      Rated: 'N/A',
      Runtime: 'N/A'
    };
    const { queryByText } = render(<MoviePage movie={naMetaFixture} />);
    expect(queryByText('N/A')).not.toBeInTheDocument();
  });

  it('hides the awards row when awards is N/A', () => {
    const { queryByText } = render(<MoviePage movie={naFieldsFixture} />);
    expect(queryByText('Awards')).not.toBeInTheDocument();
  });

  it('hides the box office row when box office is N/A', () => {
    const { queryByText } = render(<MoviePage movie={naFieldsFixture} />);
    expect(queryByText('Box Office')).not.toBeInTheDocument();
  });
});
