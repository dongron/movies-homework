'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import FavoriteButton from '@/components/movies/FavoriteButton';
import FavoritesList from '@/components/movies/FavoritesList';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { formatYear } from '@/lib/format-year';
import type { MovieDetails } from '@/types/Movie';

const Field = ({ label, value }: { label: string; value: string }) => {
  if (value === 'N/A') return null;
  return (
    <div className='flex gap-2'>
      <span className='text-muted-foreground text-sm font-medium'>{label}</span>
      <span className='text-sm'>{value}</span>
    </div>
  );
};

const MoviePage = ({ movie }: { movie: MovieDetails }) => {
  const hasPoster = movie.Poster !== 'N/A';
  const [posterError, setPosterError] = useState(false);
  const hasGenres = movie.Genre !== 'N/A';
  const genres = hasGenres ? movie.Genre.split(', ') : [];

  return (
    <main className='mx-auto mt-6 flex max-w-7xl flex-col justify-center gap-6 px-3 font-[family-name:var(--font-geist-sans)] sm:mt-3 sm:gap-12 sm:px-0'>
      <Link href='/' className='text-muted-foreground text-sm hover:underline'>
        &larr; Back to movies
      </Link>

      <div className='flex flex-col gap-8 md:flex-row'>
        <div className='relative aspect-[2/3] w-full max-w-xs shrink-0'>
          {hasPoster && !posterError ? (
            <Image
              src={movie.Poster}
              alt={`${movie.Title} poster`}
              fill
              className='bg-muted rounded-lg object-contain'
              sizes='(max-width: 768px) 100vw, 320px'
              onError={() => setPosterError(true)}
            />
          ) : (
            <div className='bg-muted text-muted-foreground flex h-full items-center justify-center rounded-lg text-sm'>
              No poster
            </div>
          )}
        </div>

        <div className='flex flex-1 flex-col gap-4'>
          <div>
            <div className='flex items-center gap-2'>
              <h1 className='text-3xl font-bold'>{movie.Title}</h1>
              <FavoriteButton movie={{ id: movie.imdbID, title: movie.Title, year: movie.Year }} />
            </div>
            <div className='text-muted-foreground mt-1 flex items-center gap-2 text-sm'>
              <span>{formatYear(movie.Year)}</span>
              {movie.Rated !== 'N/A' && (
                <>
                  <span>&middot;</span>
                  <span>{movie.Rated}</span>
                </>
              )}
              {movie.Runtime !== 'N/A' && (
                <>
                  <span>&middot;</span>
                  <span>{movie.Runtime}</span>
                </>
              )}
            </div>
          </div>

          {hasGenres && (
            <div className='flex flex-wrap gap-1.5'>
              {genres.map((genre) => (
                <Badge key={genre} variant='secondary'>
                  {genre}
                </Badge>
              ))}
            </div>
          )}

          <Card>
            <CardContent className='flex flex-wrap gap-4'>
              {movie.Ratings.length === 0 ? (
                <span className='text-muted-foreground text-sm'>No ratings</span>
              ) : (
                movie.Ratings.map((rating) => (
                  <div key={rating.Source} className='flex flex-col items-center gap-0.5'>
                    <span className='text-lg font-bold'>{rating.Value}</span>
                    <span className='text-muted-foreground text-xs'>{rating.Source}</span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <p className='text-sm leading-relaxed'>{movie.Plot === 'N/A' ? 'No description available' : movie.Plot}</p>

          <div className='flex flex-col gap-2 border-t pt-4'>
            <Field label='Director' value={movie.Director} />
            <Field label='Writer' value={movie.Writer} />
            <Field label='Actors' value={movie.Actors} />
            <Field label='Released' value={movie.Released} />
            <Field label='Awards' value={movie.Awards} />
            <Field label='Box Office' value={movie.BoxOffice} />
          </div>
        </div>
      </div>

      <FavoritesList />
    </main>
  );
};

export default MoviePage;
