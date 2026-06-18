import { describe, expect, it } from 'vitest';

import { getMovieDetails } from '@/data/movies';

describe('getMovieDetails', () => {
  it('returns the mock for a known ID', async () => {
    const movie = await getMovieDetails('tt0108052');
    expect(movie).not.toBeNull();
    expect(movie!.Title).toBe("Schindler's List");
    expect(movie!.imdbID).toBe('tt0108052');
  });

  it('returns null for an unknown ID', async () => {
    const movie = await getMovieDetails('tt0000000');
    expect(movie).toBeNull();
  });
});
