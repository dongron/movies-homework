import MovieGrid from '@/components/movies/MovieGrid';
import type { MovieSearchResult, OmdbError } from '@/types/Movie';

type MovieResultsProps = { movies: MovieSearchResult[] } | { error: OmdbError };

const TOO_MANY_RESULTS = 'Too many results.';
const MOVIE_NOT_FOUND = 'Movie not found!';

function errorBody(error: OmdbError): string {
    if (error.kind === 'api' && error.message === TOO_MANY_RESULTS) {
        return 'Your search returned too many results. Try a more specific filters.';
    }
    if (error.kind === 'api' && error.message === MOVIE_NOT_FOUND) {
        return 'No movies matched your search.';
    }
    return "We couldn't load movies right now. Please try again later.";
}

const MovieResults = (props: MovieResultsProps) => {
    if ('error' in props) {
        return (
            <p className='text-muted-foreground text-center text-lg' role='alert'>
                {errorBody(props.error)}
            </p>
        );
    }

    return <MovieGrid movies={props.movies} />;
};

export default MovieResults;
