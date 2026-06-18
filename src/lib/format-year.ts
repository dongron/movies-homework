/**
 * Formats a movie/series year string for display.
 *
 * The OMDB API returns ongoing series with a trailing en dash and no end year,
 * e.g. `2022–`. This replaces the dangling dash with `now` so the grid, details
 * page, and favorites list render `2022–now` instead of `2022–`.
 *
 * Closed ranges (`2011–2015`) and single years (`1994`) are returned unchanged.
 */
export function formatYear(year: string): string {
  if (year.endsWith('–')) {
    return `${year}now`;
  }
  return year;
}
