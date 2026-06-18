import MovieResults from '@/app/(frontend)/MovieResults';
import type { MovieSearchResult, OmdbError } from '@/types/Movie';
import { cleanup, render } from '@testing-library/react';

import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/image', () => ({
    default: (props: React.ComponentProps<'img'>) => <img {...props} />
}));

vi.mock('next/navigation', () => ({
    useSearchParams: () => new URLSearchParams()
}));

vi.mock('next/link', () => ({
    default: ({
        href,
        children,
        ...props
    }: { href: string; children: React.ReactNode } & React.ComponentProps<'a'>) => (
        <a href={href} {...props}>
            {children}
        </a>
    )
}));

afterEach(cleanup);

const moviesFixture: MovieSearchResult[] = [
    {
        Title: "Schindler's List",
        Year: '1994',
        imdbID: 'tt0108052',
        Type: 'movie',
        Poster: 'https://m.media-amazon.com/images/M/poster1.jpg'
    },
    {
        Title: 'Kill List',
        Year: '2011',
        imdbID: 'tt1788391',
        Type: 'movie',
        Poster: 'N/A'
    }
];

describe('MovieResults', () => {
    it('renders the movie grid when given movies', () => {
        const { getAllByRole, getByText } = render(<MovieResults movies={moviesFixture} />);
        expect(getAllByRole('link')).toHaveLength(2);
        expect(getByText("Schindler's List")).toBeInTheDocument();
        expect(getByText('Kill List')).toBeInTheDocument();
    });

    it('renders an empty grid container when given no movies', () => {
        const { queryByRole } = render(<MovieResults movies={[]} />);
        expect(queryByRole('link')).not.toBeInTheDocument();
    });

    it('renders the "too many results" message and no grid for that api error', () => {
        const error: OmdbError = { kind: 'api', message: 'Too many results.' };
        const { getByText, queryByRole } = render(<MovieResults error={error} />);
        expect(getByText('Your search returned too many results. Try a more specific filters.')).toBeInTheDocument();
        expect(queryByRole('link')).not.toBeInTheDocument();
    });

    it('renders the "no movies matched" empty state for "Movie not found!"', () => {
        const error: OmdbError = { kind: 'api', message: 'Movie not found!' };
        const { getByText, queryByRole } = render(<MovieResults error={error} />);
        expect(getByText('No movies matched your search.')).toBeInTheDocument();
        expect(queryByRole('link')).not.toBeInTheDocument();
    });

    it('renders a generic error message for transport errors', () => {
        const error: OmdbError = { kind: 'transport', status: 404, message: 'OMDB request failed with status 404' };
        const { getByText, queryByRole } = render(<MovieResults error={error} />);
        expect(getByText("We couldn't load movies right now. Please try again later.")).toBeInTheDocument();
        expect(queryByRole('link')).not.toBeInTheDocument();
    });

    it('renders a generic error message for unrecognized api errors', () => {
        const error: OmdbError = { kind: 'api', message: 'Invalid API key!' };
        const { getByText, queryByRole } = render(<MovieResults error={error} />);
        expect(getByText("We couldn't load movies right now. Please try again later.")).toBeInTheDocument();
        expect(queryByRole('link')).not.toBeInTheDocument();
    });
});
