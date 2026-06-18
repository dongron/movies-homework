import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { formatYear } from '@/lib/format-year';
import { fetchMovieDetails } from '@/lib/omdb';
import { SITE_NAME } from '@/lib/site';

import MoviePage from './MoviePage';

type RouteParams = { params: Promise<{ 'movie-id': string }> };

export async function generateMetadata({ params }: RouteParams): Promise<Metadata> {
  const { 'movie-id': id } = await params;
  try {
    const movie = await fetchMovieDetails(id);
    const title = `${movie.Title} (${formatYear(movie.Year)})`;
    const description = movie.Plot !== 'N/A' ? movie.Plot : `Details for ${movie.Title} on ${SITE_NAME}.`;
    const poster = movie.Poster !== 'N/A' ? movie.Poster : undefined;

    return {
      title,
      description,
      alternates: { canonical: `/${movie.imdbID}` },
      openGraph: {
        title,
        description,
        ...(poster && { images: [{ url: poster, alt: `${movie.Title} poster` }] })
      },
      twitter: {
        card: poster ? 'summary_large_image' : 'summary',
        title,
        description,
        ...(poster && { images: [poster] })
      }
    };
  } catch {
    return { title: 'Movie not found' };
  }
}

function buildJsonLd(movie: import('@/types/Movie').MovieDetails) {
  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Movie',
    name: movie.Title,
    dateCreated: movie.Year
  };

  if (movie.Plot !== 'N/A') jsonLd.description = movie.Plot;
  if (movie.Poster !== 'N/A') jsonLd.image = movie.Poster;
  if (movie.Genre !== 'N/A') jsonLd.genre = movie.Genre.split(', ');
  if (movie.Director !== 'N/A') {
    jsonLd.director = movie.Director.split(', ').map((name) => ({
      '@type': 'Person',
      name
    }));
  }
  if (movie.imdbRating !== 'N/A') {
    jsonLd.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: movie.imdbRating,
      bestRating: '10',
      ratingCount: movie.imdbVotes?.replace(/,/g, '') ?? undefined
    };
  }

  return jsonLd;
}

const Page = async ({ params }: RouteParams) => {
  const { 'movie-id': id } = await params;
  try {
    const movie = await fetchMovieDetails(id);
    return (
      <>
        <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(buildJsonLd(movie)) }} />
        <MoviePage movie={movie} />
      </>
    );
  } catch {
    notFound();
  }
};

export default Page;
