import Image from 'next/image';
import Link from 'next/link';

import type { MovieSearchResult } from '@/types/Movie';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

const MovieCard = ({ movie }: { movie: MovieSearchResult }) => {
  const hasPoster = movie.Poster !== 'N/A';

  return (
    <Card className="gap-0 overflow-hidden pt-0">
      <Link href={`/${movie.imdbID}`} className="relative block aspect-[2/3]">
        {hasPoster ? (
          <Image
            src={movie.Poster}
            alt={`${movie.Title} poster`}
            fill
            className="bg-muted object-contain"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />
        ) : (
          <div className="bg-muted flex h-full items-center justify-center text-sm text-muted-foreground">
            No poster
          </div>
        )}
      </Link>
      <CardContent className="flex flex-col gap-1 pt-4">
        <h3 className="line-clamp-2 text-sm font-semibold leading-tight">
          {movie.Title}
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{movie.Year}</span>
          <Badge variant="secondary" className="text-[10px] capitalize">
            {movie.Type}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default MovieCard;
