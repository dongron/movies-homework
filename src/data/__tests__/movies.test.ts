import { afterEach, describe, expect, it, vi } from 'vitest';

import { getMovieDetails, searchMovies } from '@/data/movies';

vi.mock('@/lib/omdb', () => ({
  buildOmdbUrl: vi.fn(),
  searchMovies: vi.fn(),
  fetchMovieDetails: vi.fn(),
}));

import { fetchMovieDetails, searchMovies as omdbSearchMovies } from '@/lib/omdb';

afterEach(() => {
  vi.clearAllMocks();
});

describe('getMovieDetails', () => {
  it('delegates to fetchMovieDetails and returns its result for a known ID', async () => {
    const mocked = {
      Title: "Schindler's List",
      Year: '1994',
      imdbID: 'tt0108052',
      Response: 'True',
    };
    vi.mocked(fetchMovieDetails).mockResolvedValue(mocked as never);

    const movie = await getMovieDetails('tt0108052');

    expect(fetchMovieDetails).toHaveBeenCalledOnce();
    expect(fetchMovieDetails).toHaveBeenCalledWith('tt0108052');
    expect(movie).toEqual(mocked);
  });

  it('propagates the OmdbError thrown by fetchMovieDetails for an unknown ID', async () => {
    vi.mocked(fetchMovieDetails).mockRejectedValue({
      kind: 'api',
      message: 'Incorrect IMDb ID.',
    });

    await expect(getMovieDetails('tt0000000')).rejects.toMatchObject({
      kind: 'api',
      message: 'Incorrect IMDb ID.',
    });
  });
});

describe('searchMovies re-export', () => {
  it('delegates to the OMDB client searchMovies', async () => {
    const mocked = {
      Search: [],
      totalResults: '0',
      Response: 'True',
    };
    vi.mocked(omdbSearchMovies).mockResolvedValue(mocked as never);

    const result = await searchMovies('list', 1);

    expect(omdbSearchMovies).toHaveBeenCalledOnce();
    expect(omdbSearchMovies).toHaveBeenCalledWith('list', 1);
    expect(result).toEqual(mocked);
  });
});
