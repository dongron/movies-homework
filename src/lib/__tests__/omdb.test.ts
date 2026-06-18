import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { MovieDetails, MovieSearchResponse } from '@/types/Movie';

import {
  buildOmdbUrl,
  fetchMovieDetails,
  searchMovies,
} from '@/lib/omdb';

const searchSuccessBody: MovieSearchResponse = {
  Search: [
    {
      Title: 'Schindler\'s List',
      Year: '1994',
      imdbID: 'tt0108052',
      Type: 'movie',
      Poster: 'https://m.media-amazon.com/images/M/poster.jpg',
    },
  ],
  totalResults: '1',
  Response: 'True',
};

const detailsSuccessBody: MovieDetails = {
  Title: 'Schindler\'s List',
  Year: '1994',
  Rated: 'R',
  Released: '04 Feb 1994',
  Runtime: '195 min',
  Genre: 'Biography, Drama, History',
  Director: 'Steven Spielberg',
  Writer: 'Thomas Keneally, Steven Zaillian',
  Actors: 'Liam Neeson, Ralph Fiennes, Ben Kingsley',
  Plot: 'A plot.',
  Language: 'English',
  Country: 'United States',
  Awards: 'Won 7 Oscars.',
  Poster: 'https://m.media-amazon.com/images/M/poster.jpg',
  Ratings: [
    { Source: 'Internet Movie Database', Value: '9.0/10' },
    { Source: 'Rotten Tomatoes', Value: '98%' },
    { Source: 'Metacritic', Value: '95/100' },
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
  Response: 'True',
};

const env = {
  BASE_API_URL: 'http://www.omdbapi.com/',
  OMDB_API_KEY: 'b8186782',
};

function jsonResponse(body: unknown, init?: { status?: number } & ResponseInit): Response {
  return new Response(JSON.stringify(body), {
    status: init?.status ?? 200,
    headers: { 'content-type': 'application/json' },
    ...init,
  });
}

beforeEach(() => {
  vi.stubEnv('BASE_API_URL', env.BASE_API_URL);
  vi.stubEnv('OMDB_API_KEY', env.OMDB_API_KEY);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe('buildOmdbUrl', () => {
  it('builds a search URL with apikey, s, and page=1 default', () => {
    const url = buildOmdbUrl({ s: 'list' });
    expect(url).toBe('http://www.omdbapi.com/?apikey=b8186782&s=list&page=1');
  });

  it('builds a search URL with an explicit page', () => {
    const url = buildOmdbUrl({ s: 'batman', page: 2 });
    expect(url).toBe('http://www.omdbapi.com/?apikey=b8186782&s=batman&page=2');
  });

  it('builds a details URL with apikey and i', () => {
    const url = buildOmdbUrl({ i: 'tt0108052' });
    expect(url).toBe('http://www.omdbapi.com/?apikey=b8186782&i=tt0108052');
  });

  it('normalizes a base URL without a trailing slash', () => {
    vi.stubEnv('BASE_API_URL', 'http://www.omdbapi.com');
    const url = buildOmdbUrl({ i: 'tt0108052' });
    expect(url).toBe('http://www.omdbapi.com/?apikey=b8186782&i=tt0108052');
  });
});

describe('searchMovies', () => {
  it('returns the parsed MovieSearchResponse on success', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(searchSuccessBody)));
    const result = await searchMovies('list', 1);
    expect(result).toEqual(searchSuccessBody);
    expect(fetch).toHaveBeenCalledOnce();
    const calledUrl = (fetch as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(String(calledUrl)).toContain('s=list');
    expect(String(calledUrl)).toContain('page=1');
    expect(String(calledUrl)).toContain('apikey=b8186782');
  });

  it('throws a transport OmdbError on HTTP 404', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ Response: 'False', Error: 'Not found' }, { status: 404 })));
    await expect(searchMovies('list')).rejects.toMatchObject({
      kind: 'transport',
      status: 404,
    });
  });

  it('throws a transport OmdbError when fetch rejects', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')));
    await expect(searchMovies('list')).rejects.toMatchObject({ kind: 'transport' });
  });

  it('throws an api OmdbError with "Too many results." for that payload', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ Response: 'False', Error: 'Too many results.' })));
    await expect(searchMovies('l')).rejects.toMatchObject({
      kind: 'api',
      message: 'Too many results.',
    });
  });

  it('throws an api OmdbError with "Movie not found!" for that payload', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ Response: 'False', Error: 'Movie not found!' })));
    await expect(searchMovies('zzzznotreal')).rejects.toMatchObject({
      kind: 'api',
      message: 'Movie not found!',
    });
  });

  it('throws an api OmdbError for an invalid API key payload', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ Response: 'False', Error: 'Invalid API key!' })));
    await expect(searchMovies('list')).rejects.toMatchObject({
      kind: 'api',
      message: 'Invalid API key!',
    });
  });
});

describe('fetchMovieDetails', () => {
  it('returns the parsed MovieDetails on success', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(detailsSuccessBody)));
    const result = await fetchMovieDetails('tt0108052');
    expect(result).toEqual(detailsSuccessBody);
    const calledUrl = (fetch as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(String(calledUrl)).toContain('i=tt0108052');
    expect(String(calledUrl)).toContain('apikey=b8186782');
  });

  it('throws a transport OmdbError on HTTP 404', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ Response: 'False', Error: 'Not found' }, { status: 404 })));
    await expect(fetchMovieDetails('tt0000000')).rejects.toMatchObject({
      kind: 'transport',
      status: 404,
    });
  });

  it('throws an api OmdbError with "Incorrect IMDb ID." for that payload', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ Response: 'False', Error: 'Incorrect IMDb ID.' })));
    await expect(fetchMovieDetails('garbage')).rejects.toMatchObject({
      kind: 'api',
      message: 'Incorrect IMDb ID.',
    });
  });
});
