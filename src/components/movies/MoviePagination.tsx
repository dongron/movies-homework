import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination';
import { MAX_PAGE } from '@/lib/grid-params';
import type { MovieType } from '@/types/Movie';

const RESULTS_PER_PAGE = 10;
const SIBLING_COUNT = 1;

type MoviePaginationProps = {
  totalResults: number;
  pageNumber: number;
  searchTerm: string;
  type?: MovieType;
  year?: number;
};

function buildPageHref(page: number, searchTerm: string, type?: MovieType, year?: number): string {
  const params = new URLSearchParams();
  params.set('s', searchTerm);
  if (type) params.set('type', type);
  if (year) params.set('y', String(year));
  params.set('page', String(page));
  return `/?${params.toString()}`;
}

function getPageNumbers(current: number, total: number): (number | 'ellipsis')[] {
  const pages: (number | 'ellipsis')[] = [];

  const leftSibling = Math.max(current - SIBLING_COUNT, 2);
  const rightSibling = Math.min(current + SIBLING_COUNT, total - 1);

  pages.push(1);

  if (leftSibling > 2) {
    pages.push('ellipsis');
  }

  for (let i = leftSibling; i <= rightSibling; i++) {
    if (i !== 1 && i !== total) {
      pages.push(i);
    }
  }

  if (rightSibling < total - 1) {
    pages.push('ellipsis');
  }

  if (total > 1) {
    pages.push(total);
  }

  return pages;
}

const MoviePagination = ({ totalResults, pageNumber, searchTerm, type, year }: MoviePaginationProps) => {
  const totalPages = Math.min(Math.ceil(totalResults / RESULTS_PER_PAGE), MAX_PAGE);

  if (totalPages <= 1) return null;

  const pages = getPageNumbers(pageNumber, totalPages);
  const isFirst = pageNumber === 1;
  const isLast = pageNumber === totalPages;

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href={isFirst ? undefined : buildPageHref(pageNumber - 1, searchTerm, type, year)}
            aria-disabled={isFirst || undefined}
            tabIndex={isFirst ? -1 : undefined}
            className={isFirst ? 'pointer-events-none opacity-50' : undefined}
          />
        </PaginationItem>

        {pages.map((page, i) =>
          page === 'ellipsis' ? (
            <PaginationItem key={`ellipsis-${i}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={page}>
              <PaginationLink href={buildPageHref(page, searchTerm, type, year)} isActive={page === pageNumber}>
                {page}
              </PaginationLink>
            </PaginationItem>
          )
        )}

        <PaginationItem>
          <PaginationNext
            href={isLast ? undefined : buildPageHref(pageNumber + 1, searchTerm, type, year)}
            aria-disabled={isLast || undefined}
            tabIndex={isLast ? -1 : undefined}
            className={isLast ? 'pointer-events-none opacity-50' : undefined}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default MoviePagination;
