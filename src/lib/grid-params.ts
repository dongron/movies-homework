import { isValidType, normalizeYear } from '@/lib/movie-filters';
import type { MovieType } from '@/types/Movie';

const DEFAULT_SEARCH = 'list';
const MIN_PAGE = 1;
export const MAX_PAGE = 100;

export type CanonicalizedGridParams = {
  searchTerm: string;
  pageNumber: number;
  type?: MovieType;
  year?: number;
  canonical: string;
  needsRedirect: boolean;
};

function parsePage(raw: string | undefined): number {
  if (raw === undefined) return MIN_PAGE;
  const trimmed = raw.trim();
  const parsed = Number.parseFloat(trimmed);
  if (!Number.isFinite(parsed)) return MIN_PAGE;
  const floored = Math.floor(parsed);
  return Math.min(Math.max(floored, MIN_PAGE), MAX_PAGE);
}

function normalizeSearch(raw: string | undefined): string {
  const trimmed = (raw ?? '').trim();
  return trimmed === '' ? DEFAULT_SEARCH : trimmed;
}

function parseType(raw: string | undefined): MovieType | undefined {
  return isValidType(raw) ? raw : undefined;
}

export function canonicalizeGridParams(
  rawSearch: string | undefined,
  rawPage: string | undefined,
  rawType?: string,
  rawYear?: string
): CanonicalizedGridParams {
  const searchTerm = normalizeSearch(rawSearch);
  const pageNumber = parsePage(rawPage);
  const type = parseType(rawType);
  const year = normalizeYear(rawYear);

  const typeQuery = type ? `&type=${type}` : '';
  const yearQuery = year ? `&y=${year}` : '';
  const canonical = `/?s=${encodeURIComponent(searchTerm)}${typeQuery}${yearQuery}&page=${pageNumber}`;

  // Compare the raw (untrimmed) inputs against their canonical form so that
  // whitespace and missing params trigger a redirect. Next.js hands us
  // already-decoded searchParams, so encoding differences are invisible here
  // (and must not trigger a redirect — that would loop).
  const searchChanged = rawSearch !== searchTerm;
  const pageChanged = rawPage !== String(pageNumber);
  // An invalid or empty type resolves to `undefined`; redirecting drops it from
  // the URL. A valid type equals its raw form, and an absent one stays absent.
  const typeChanged = rawType !== type;
  const yearChanged = rawYear !== (year === undefined ? undefined : String(year));

  return {
    searchTerm,
    pageNumber,
    type,
    year,
    canonical,
    needsRedirect: searchChanged || pageChanged || typeChanged || yearChanged
  };
}

/**
 * Build the next grid query params after changing one filter. Any filter change
 * clears `page` so results restart at page 1. A `null` or empty value removes the
 * key (the "Any" option). The input params are not mutated.
 */
export function setGridFilter(current: URLSearchParams, key: string, value: string | null): URLSearchParams {
  const next = new URLSearchParams(current.toString());
  if (value === null || value === '') {
    next.delete(key);
  } else {
    next.set(key, value);
  }
  next.delete('page');
  return next;
}
