import { Suspense } from 'react';

import { redirect } from 'next/navigation';

import HomePage from '@/app/(frontend)/HomePage';
import MovieResultsSection from '@/app/(frontend)/MovieResultsSection';
import MovieFilters from '@/components/movies/MovieFilters';
import MovieGridSkeleton from '@/components/movies/MovieGridSkeleton';
import { canonicalizeGridParams } from '@/lib/grid-params';

const Page = async ({
  searchParams
}: {
  searchParams: Promise<{
    s?: string;
    page?: string;
    type?: string;
    y?: string;
  }>;
}) => {
  const { s, page, type, y } = await searchParams;
  const {
    searchTerm,
    pageNumber,
    type: movieType,
    year,
    canonical,
    needsRedirect
  } = canonicalizeGridParams(s, page, type, y);

  if (needsRedirect) redirect(canonical);

  return (
    <HomePage>
      <MovieFilters />
      <Suspense key={`${searchTerm}-${pageNumber}-${movieType ?? ''}-${year ?? ''}`} fallback={<MovieGridSkeleton />}>
        <MovieResultsSection searchTerm={searchTerm} pageNumber={pageNumber} type={movieType} year={year} />
      </Suspense>
    </HomePage>
  );
};

export default Page;
