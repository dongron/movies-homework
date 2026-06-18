import type { MovieDetails, MovieSearchResponse, MovieType, OmdbError } from '@/types/Movie';

type SearchParams = { s: string; page?: number; type?: MovieType; year?: number };
type DetailsParams = { i: string };
type OmdbParams = SearchParams | DetailsParams;

type SearchMoviesOptions = {
  searchTerm: string;
  page?: number;
  type?: MovieType;
  year?: number;
};

function normalizeBase(base: string): string {
  return base.endsWith('/') ? base : `${base}/`;
}

export function buildOmdbUrl(params: OmdbParams): string {
  const base = normalizeBase(process.env.BASE_API_URL ?? 'http://www.omdbapi.com/');
  const apikey = process.env.OMDB_API_KEY ?? '';
  const search = new URLSearchParams({ apikey });

  if ('s' in params) {
    search.set('s', params.s);
    search.set('page', String(params.page ?? 1));
    if (params.type) search.set('type', params.type);
    if (params.year) search.set('y', String(params.year));
  } else {
    search.set('i', params.i);
  }

  return `${base}?${search.toString()}`;
}

function isOmdbError(value: unknown): value is OmdbError {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as OmdbError).kind !== undefined &&
    typeof (value as OmdbError).message === 'string'
  );
}

function transportError(status: number, message: string): OmdbError {
  return { kind: 'transport', status, message };
}

function apiError(message: string): OmdbError {
  return { kind: 'api', message };
}

async function parseJson(response: Response): Promise<Record<string, unknown>> {
  try {
    return (await response.json()) as Record<string, unknown>;
  } catch {
    throw transportError(response.status, 'OMDB response was not valid JSON');
  }
}

function assertOk(response: Response): void {
  if (!response.ok) {
    throw transportError(response.status, `OMDB request failed with status ${response.status}`);
  }
}

function assertApiResponse(payload: Record<string, unknown>): void {
  if (payload.Response !== 'True') {
    const message = typeof payload.Error === 'string' ? payload.Error : 'Unknown OMDB error';
    throw apiError(message);
  }
}

export async function searchMovies({
  searchTerm,
  page = 1,
  type,
  year
}: SearchMoviesOptions): Promise<MovieSearchResponse> {
  let response: Response;
  try {
    response = await fetch(buildOmdbUrl({ s: searchTerm, page, type, year }));
  } catch (cause) {
    if (isOmdbError(cause)) throw cause;
    throw transportError(0, cause instanceof Error ? cause.message : 'OMDB request failed');
  }

  assertOk(response);
  const payload = await parseJson(response);
  assertApiResponse(payload);
  return payload as unknown as MovieSearchResponse;
}

export async function fetchMovieDetails(id: string): Promise<MovieDetails> {
  let response: Response;
  try {
    response = await fetch(buildOmdbUrl({ i: id }));
  } catch (cause) {
    if (isOmdbError(cause)) throw cause;
    throw transportError(0, cause instanceof Error ? cause.message : 'OMDB request failed');
  }

  assertOk(response);
  const payload = await parseJson(response);
  assertApiResponse(payload);
  return payload as unknown as MovieDetails;
}
