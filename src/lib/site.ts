export const SITE_NAME = 'Movies Database';

export const SITE_DESCRIPTION =
  'Search and explore movies, TV shows and episodes. Browse ratings, cast, plot details and more.';

export function siteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3000';
}
