import type { MovieSearchResult } from '@/types/Movie';

import MovieCard from '@/components/movies/MovieCard';

const MovieGrid = ({ movies }: { movies: MovieSearchResult[] }) => {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {movies.map((movie) => (
        <MovieCard key={movie.imdbID} movie={movie} />
      ))}
    </div>
  );
};

export default MovieGrid;
