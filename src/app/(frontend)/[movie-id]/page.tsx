import { notFound } from 'next/navigation';

import { getMovieDetails } from '@/data/movies';

import MoviePage from './MoviePage';

const Page = async ({ params }: { params: Promise<{ 'movie-id': string }> }) => {
  const { 'movie-id': id } = await params;
  const movie = await getMovieDetails(id);
  if (!movie) notFound();
  return <MoviePage movie={movie} />;
};

export default Page;
