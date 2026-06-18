import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const SKELETON_CARD_COUNT = 10;

const MovieGridSkeleton = () => {
  return (
    <div
      className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
      data-testid="movie-grid-skeleton"
    >
      {Array.from({ length: SKELETON_CARD_COUNT }, (_, i) => (
        <Card
          key={i}
          className="gap-0 overflow-hidden pt-0"
          data-testid="movie-grid-skeleton-card"
        >
          <Skeleton className="aspect-[2/3] w-full rounded-none" />
          <CardContent className="flex flex-col gap-2 pt-4">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/3" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MovieGridSkeleton;
