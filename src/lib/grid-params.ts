const DEFAULT_SEARCH = 'list';
const MIN_PAGE = 1;
const MAX_PAGE = 100;

export type CanonicalizedGridParams = {
  searchTerm: string;
  pageNumber: number;
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

export function canonicalizeGridParams(
  rawSearch: string | undefined,
  rawPage: string | undefined,
): CanonicalizedGridParams {
  const searchTerm = normalizeSearch(rawSearch);
  const pageNumber = parsePage(rawPage);
  const canonical = `/?s=${encodeURIComponent(searchTerm)}&page=${pageNumber}`;

  // Compare the raw (untrimmed) inputs against their canonical form so that
  // whitespace and missing params trigger a redirect. Next.js hands us
  // already-decoded searchParams, so encoding differences are invisible here
  // (and must not trigger a redirect — that would loop).
  const searchChanged = rawSearch !== searchTerm;
  const pageChanged = rawPage !== String(pageNumber);

  return {
    searchTerm,
    pageNumber,
    canonical,
    needsRedirect: searchChanged || pageChanged,
  };
}
