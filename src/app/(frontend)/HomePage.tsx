import { mockMovieSearchResponse } from '@/data/movies';

import MovieGrid from '@/components/movies/MovieGrid';

const HomePage: React.FC = () => {
    return (
        <main className='mx-auto mt-6 flex max-w-7xl flex-col justify-center gap-6 px-3 font-[family-name:var(--font-geist-sans)] sm:mt-3 sm:gap-12 sm:px-0'>
            <div className='row-start-2 flex flex-col items-center justify-center gap-8 sm:items-start'>
                <h1 className='text-3xl font-bold'>Movies database</h1>
                <p className='text-center text-lg'>Find your favorite movies and TV shows.</p>
            </div>
            <MovieGrid movies={mockMovieSearchResponse.Search} />
        </main>
    );
};

export default HomePage;
