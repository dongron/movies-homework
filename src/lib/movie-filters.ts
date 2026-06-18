import type { MovieType } from '@/types/Movie';

/**
 * Sentinel value for the "no filter" option in selects. Radix Select forbids an
 * empty string item value, so the toolbar uses this and the canonicalizer treats
 * anything that is not a known option as "no filter".
 */
export const ANY = 'any';

export const TYPE_OPTIONS: readonly MovieType[] = ['movie', 'series', 'episode'];

export const TYPE_LABELS: Record<MovieType, string> = {
  movie: 'Movie',
  series: 'Series',
  episode: 'Episode'
};

export function isValidType(value: string | undefined): value is MovieType {
  return value !== undefined && (TYPE_OPTIONS as readonly string[]).includes(value);
}

export const MIN_YEAR = 1900;
export const MAX_YEAR = new Date().getFullYear();

export function yearOptions(): number[] {
  const years: number[] = [];
  for (let y = MAX_YEAR; y >= MIN_YEAR; y--) {
    years.push(y);
  }
  return years;
}

export function normalizeYear(raw: string | undefined): number | undefined {
  if (raw === undefined || raw === '') return undefined;
  const parsed = Number(raw);
  if (!Number.isInteger(parsed)) return undefined;
  if (parsed < MIN_YEAR || parsed > MAX_YEAR) return undefined;
  return parsed;
}
