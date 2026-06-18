import MovieResults from '@/app/(frontend)/MovieResults';
import MoviePagination from '@/components/movies/MoviePagination';
import { searchMovies } from '@/lib/omdb';
import type { MovieType, OmdbError } from '@/types/Movie';

type MovieResultsSectionProps = {
  searchTerm: string;
  pageNumber: number;
  type?: MovieType;
  year?: number;
};

const MovieResultsSection = async ({ searchTerm, pageNumber, type, year }: MovieResultsSectionProps) => {
  try {
    const response = await searchMovies({ searchTerm, page: pageNumber, type, year });
    const totalResults = Number(response.totalResults) || 0;
    return (
      <>
        <div className='sr-only' aria-live='polite' role='status'>
          {totalResults === 1
            ? `1 result found for "${searchTerm}"`
            : `${totalResults} results found for "${searchTerm}"`}
        </div>
        <MovieResults movies={response.Search} />
        <MoviePagination
          totalResults={totalResults}
          pageNumber={pageNumber}
          searchTerm={searchTerm}
          type={type}
          year={year}
        />
      </>
    );
  } catch (cause) {
    const error: OmdbError =
      cause && typeof cause === 'object' && 'kind' in cause
        ? (cause as OmdbError)
        : { kind: 'transport', message: 'OMDB request failed' };
    return <MovieResults error={error} />;
  }
};

export default MovieResultsSection;
