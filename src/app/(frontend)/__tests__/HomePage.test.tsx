import HomePage from '@/app/(frontend)/HomePage';
import { cleanup, render } from '@testing-library/react';

import { afterEach, describe, expect, it } from 'vitest';

afterEach(cleanup);

describe('HomePage', () => {
    it('renders the page heading and intro text', () => {
        const { getByText } = render(
            <HomePage>
                <div />
            </HomePage>
        );
        expect(getByText('Movies database')).toBeInTheDocument();
        expect(getByText('Find your favorite movies and TV shows.')).toBeInTheDocument();
    });

    it('renders the content passed as children', () => {
        const { getByTestId } = render(
            <HomePage>
                <div data-testid='grid-slot' />
            </HomePage>
        );
        expect(getByTestId('grid-slot')).toBeInTheDocument();
    });
});
