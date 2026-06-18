import type { OmdbError } from '@/types/Movie';

import MovieResults from '@/app/(frontend)/MovieResults';
import { searchMovies } from '@/lib/omdb';

type MovieResultsSectionProps = {
  searchTerm: string;
  pageNumber: number;
};

const MovieResultsSection = async ({
  searchTerm,
  pageNumber,
}: MovieResultsSectionProps) => {
  try {
    const response = await searchMovies(searchTerm, pageNumber);
    return <MovieResults movies={response.Search} />;
  } catch (cause) {
    const error: OmdbError =
      cause && typeof cause === 'object' && 'kind' in cause
        ? (cause as OmdbError)
        : { kind: 'transport', message: 'OMDB request failed' };
    return <MovieResults error={error} />;
  }
};

export default MovieResultsSection;
