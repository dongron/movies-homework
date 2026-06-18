import { Suspense } from 'react';

import { redirect } from 'next/navigation';

import HomePage from '@/app/(frontend)/HomePage';
import MovieResultsSection from '@/app/(frontend)/MovieResultsSection';
import MovieGridSkeleton from '@/components/movies/MovieGridSkeleton';
import { canonicalizeGridParams } from '@/lib/grid-params';

const Page = async ({
  searchParams,
}: {
  searchParams: Promise<{ s?: string; page?: string }>;
}) => {
  const { s, page } = await searchParams;
  const { searchTerm, pageNumber, canonical, needsRedirect } =
    canonicalizeGridParams(s, page);

  if (needsRedirect) redirect(canonical);

  return (
    <HomePage>
      <Suspense
        key={`${searchTerm}-${pageNumber}`}
        fallback={<MovieGridSkeleton />}
      >
        <MovieResultsSection searchTerm={searchTerm} pageNumber={pageNumber} />
      </Suspense>
    </HomePage>
  );
};

export default Page;
