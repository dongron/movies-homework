import { notFound } from 'next/navigation';

import { fetchMovieDetails } from '@/lib/omdb';

import MoviePage from './MoviePage';

const Page = async ({ params }: { params: Promise<{ 'movie-id': string }> }) => {
  const { 'movie-id': id } = await params;
  try {
    const movie = await fetchMovieDetails(id);
    return <MoviePage movie={movie} />;
  } catch {
    notFound();
  }
};

export default Page;
