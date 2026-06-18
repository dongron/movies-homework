'use client';

import { useState } from 'react';

import Link from 'next/link';

import { Skeleton } from '@/components/ui/skeleton';
import { useFavorites } from '@/hooks/use-favorites';
import { formatYear } from '@/lib/format-year';
import type { FavoriteMovie } from '@/types/Movie';

import RemoveFavoriteDialog from './RemoveFavoriteDialog';
import { Heart } from 'lucide-react';

const FavoritesListSkeleton = () => (
  <div className='flex flex-col gap-2' data-testid='favorites-list-skeleton'>
    {Array.from({ length: 3 }, (_, i) => (
      <div key={i} className='flex items-center gap-3'>
        <Skeleton className='size-6 rounded-sm' />
        <Skeleton className='h-4 w-32' />
        <Skeleton className='h-4 w-12' />
      </div>
    ))}
  </div>
);

const FavoritesList = () => {
  const { favorites, remove, loading } = useFavorites();
  const [pendingRemove, setPendingRemove] = useState<FavoriteMovie | null>(null);

  return (
    <div className='mt-8 border-t pt-6'>
      <h2 className='mb-4 text-xl font-semibold'>Favorites</h2>
      {loading ? (
        <FavoritesListSkeleton />
      ) : favorites.length === 0 ? (
        <p className='text-muted-foreground text-sm'>No favorites yet.</p>
      ) : (
        <ul className='flex flex-col gap-2'>
          {favorites.map((movie) => (
            <li key={movie.id} className='flex items-center gap-3'>
              <button
                type='button'
                onClick={() => setPendingRemove(movie)}
                aria-label={`Remove ${movie.title} from favorites`}
                className='hover:bg-muted focus-visible:outline-ring cursor-pointer rounded-sm p-1 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2'>
                <Heart className='size-4 fill-red-500 text-red-500' />
              </button>
              <Link href={`/${movie.id}`} className='text-sm font-medium hover:underline'>
                {movie.title}
              </Link>
              <span className='text-muted-foreground text-sm'>{formatYear(movie.year)}</span>
            </li>
          ))}
        </ul>
      )}
      <RemoveFavoriteDialog
        movieTitle={pendingRemove?.title ?? ''}
        open={pendingRemove !== null}
        onOpenChange={(open) => {
          if (!open) setPendingRemove(null);
        }}
        onConfirm={() => {
          if (pendingRemove) {
            remove(pendingRemove.id);
            setPendingRemove(null);
          }
        }}
      />
    </div>
  );
};

export default FavoritesList;
