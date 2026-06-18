'use client';

import { useState } from 'react';

import { Heart } from 'lucide-react';

import type { FavoriteMovie } from '@/types/Movie';

import { Skeleton } from '@/components/ui/skeleton';
import { useFavorites } from '@/hooks/use-favorites';
import { cn } from '@/lib/utils';

import RemoveFavoriteDialog from './RemoveFavoriteDialog';

const FavoriteButton = ({ movie }: { movie: FavoriteMovie }) => {
  const { isFavorite, toggle, remove, loading } = useFavorites();
  const favorited = isFavorite(movie.id);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleClick = () => {
    if (favorited) {
      setDialogOpen(true);
    } else {
      toggle(movie);
    }
  };

  if (loading) {
    return <Skeleton className="size-8 rounded-sm" data-testid="favorite-button-skeleton" />;
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
        aria-pressed={favorited}
        className="cursor-pointer rounded-sm p-1 transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <Heart
          className={cn(
            'size-6',
            favorited ? 'fill-red-500 text-red-500' : 'text-muted-foreground',
          )}
        />
      </button>
      <RemoveFavoriteDialog
        movieTitle={movie.title}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onConfirm={() => {
          remove(movie.id);
          setDialogOpen(false);
        }}
      />
    </>
  );
};

export default FavoriteButton;
