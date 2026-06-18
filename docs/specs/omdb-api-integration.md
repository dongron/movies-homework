# Spec: OMDB API Integration (Movies Grid + Details)

## Objective

Replace the mock data layer for the movies grid (list) and movie details pages with real requests to the OMDB API, fetched server-side (SSR) on every route load. The grid page must derive its fetch parameters from the URL search params (never including the API key). Both flows must gracefully handle OMDB failure modes: HTTP 404, network errors, and `Response: "False"` payloads (notably `Error: "Too many results."`).

### User stories

- As a visitor, when I open `/` (optionally with `?s=<term>`), I see a server-rendered grid of movies returned by OMDB for that search term, page 1.
- As a visitor, when I open `/<imdbID>`, I see a server-rendered movie details page for that ID.
- As a visitor, when OMDB cannot fulfill the list request (404, network error, or `Response: "False"` such as "Too many results." or "Movie not found!"), I see a clear inline error/empty state on the grid page, not a crash.
- As a visitor, when OMDB cannot fulfill a details request (404, network error, or `Response: "False"` such as "Incorrect IMDb ID."), I see the existing Next.js not-found page.

## Tech Stack

- Next.js 16 (App Router, RSC) — already in repo
- React 19 + TypeScript (strict) — already in repo
- Tailwind CSS v4 + shadcn/ui — already in repo
- Vitest + @testing-library/react — already in repo
- OMDB API (`http://www.omdbapi.com/`) via `fetch` (Node runtime, server-only)

## Commands

```bash
bun run install        # install dependencies
bun run dev            # start dev server (turbopack)
bun run build          # production build (turbopack)
bun run lint           # eslint
bun run lint:fix       # eslint --fix
bun run format         # prettier --write
bun run type-check     # tsc --noEmit
bun run test           # vitest run
bun run test:watch     # vitest watch
```

## Project Structure

Relevant existing layout (no new top-level dirs):

```
src/app/(frontend)/
  page.tsx                      # grid route entry (Server Component) — WILL EDIT
  HomePage.tsx                  # grid presentational shell — WILL EDIT
  [movie-id]/
    page.tsx                    # details route entry (Server Component) — WILL EDIT
    MoviePage.tsx               # details presentational — unchanged
    not-found.tsx               # details/list 404 UI — unchanged
src/components/movies/
  MovieGrid.tsx                 # grid layout — unchanged (still takes MovieSearchResult[])
  MovieCard.tsx                 # card — unchanged
src/data/
  movies.ts                     # data access layer — WILL REWRITE (real fetch)
  __tests__/movies.test.ts      # data layer tests — WILL UPDATE
src/types/
  Movie.ts                      # domain types — WILL EXTEND (error shape)
src/lib/
  favorites.ts                  # unchanged
docs/specs/
  omdb-api-integration.md       # THIS SPEC
```

New files:

```
src/lib/omdb.ts                 # OMDB client: buildUrl, searchMovies, fetchMovieDetails, typed errors
src/lib/__tests__/omdb.test.ts  # unit tests for the OMDB client (mocked fetch)
src/app/(frontend)/HomePage.tsx # will render error/empty state alongside the grid
```

## Code Style

Follow existing repo conventions (2-space indent, single quotes, trailing commas, `type` over `interface`, `const` function components, `@/` path alias, no comments unless requested).

Representative existing style (`src/data/movies.ts` / `src/app/(frontend)/[movie-id]/page.tsx`):

```ts
import type { MovieDetails, MovieSearchResponse } from '@/types/Movie';

export async function getMovieDetails(id: string): Promise<MovieDetails | null> {
  return mockMovieDetails[id] ?? null;
}
```

```tsx
const Page = async ({ params }: { params: Promise<{ 'movie-id': string }> }) => {
  const { 'movie-id': id } = await params;
  const movie = await getMovieDetails(id);
  if (!movie) notFound();
  return <MoviePage movie={movie} />;
};
```

New OMDB client will follow the same shape: async functions returning typed results or throwing a typed error.

## OMDB API Contract

Base URL: `process.env.BASE_API_URL` (e.g. `http://www.omdbapi.com/`).
API key: `process.env.OMDB_API_KEY` (server-only, never serialized to the client, never placed in the URL the browser sees).

### List (search) request

```
GET {BASE_API_URL}?apikey={KEY}&s={searchTerm}&page=1
```

Example: `http://www.omdbapi.com/?apikey=b8186782&s=list&page=1`

- `s` comes from the route's `searchParams.s`; defaults to `"list"` when absent/empty.
- `page` is always `1` for now (hardcoded; not read from the URL yet, but the spec leaves room to read it later).

### Details request

```
GET {BASE_API_URL}?apikey={KEY}&i={imdbID}
```

Example: `http://www.omdbapi.com/?apikey=b8186782&i=tt0108052`

- `i` comes from the route's `params['movie-id']`.

### Response shapes

Success (list):

```json
{ "Search": [ { "Title", "Year", "imdbID", "Type", "Poster" } ], "totalResults": "691", "Response": "True" }
```

Success (details): a `MovieDetails` object with `"Response": "True"`.

Failure (HTTP 200, `Response: "False"`):

```json
{ "Response": "False", "Error": "Too many results." }
```

Other known `Error` strings: `"Movie not found!"` (list, zero matches), `"Incorrect IMDb ID."` (details, unknown ID), `"Invalid API key!"`.

Failure (HTTP non-200): treat any non-`ok` response (including 404) as a transport error.

## Error Handling Strategy

### OMDB client (`src/lib/omdb.ts`)

Distinguish two failure categories with a typed error:

```ts
export type OmdbError = {
  kind: 'transport' | 'api';
  status?: number;   // present for transport errors
  message: string;   // OMDB `Error` string for api errors, generic for transport
};
```

- `searchMovies(searchTerm: string, page = 1): Promise<MovieSearchResponse>`
  - Throws `OmdbError` with `kind: 'transport'` when `!response.ok` (includes 404) or `fetch` rejects.
  - Throws `OmdbError` with `kind: 'api'` and the OMDB `Error` string when `Response === 'False'` (covers "Too many results.", "Movie not found!", "Invalid API key!", etc.).
  - Returns the parsed `MovieSearchResponse` on success.

- `fetchMovieDetails(id: string): Promise<MovieDetails>`
  - Same throwing contract. `Response === 'False'` (e.g. "Incorrect IMDb ID.") throws `OmdbError` `kind: 'api'`.

### Grid page (`src/app/(frontend)/page.tsx` + `HomePage.tsx`)

- `page.tsx` becomes an async Server Component reading `searchParams: Promise<{ s?: string; page?: string }>`.
- Calls `searchMovies(s, 1)` inside a try/catch.
- On success: passes `movies` to `HomePage` (which renders `MovieGrid`).
- On failure (any `OmdbError`): passes an error descriptor to `HomePage`, which renders an inline error/empty state instead of the grid. Two variants:
  - "Too many results." → "Your search returned too many results. Try a more specific query."
  - Other api/transport errors → "We couldn't load movies right now. Please try again later." (For "Movie not found!" specifically, render an empty-state: "No movies matched your search.")
- The API key is never passed to `HomePage` or serialized into the client bundle.

### Details page (`src/app/(frontend)/[movie-id]/page.tsx`)

- Calls `fetchMovieDetails(id)` inside a try/catch.
- On any failure (transport 404, network, or `Response: "False"` such as "Incorrect IMDb ID."): call `notFound()` and render the existing `not-found.tsx`. No distinction between 404 and other errors (per decision).
- On success: render `MoviePage` as today.

## Testing Strategy

Framework: Vitest + @testing-library/react (jsdom), already configured.

- `src/lib/__tests__/omdb.test.ts` (new): unit-test the OMDB client with `global.fetch` mocked.
  - searchMovies: success returns parsed response; HTTP 404 throws transport error; HTTP 200 + `Response: "False"` ("Too many results.") throws api error with that message; "Movie not found!" throws api error; network rejection throws transport error.
  - fetchMovieDetails: success returns parsed details; 404 throws transport; `Response: "False"` ("Incorrect IMDb ID.") throws api error.
  - buildUrl: asserts `apikey` is included server-side and `s`/`i`/`page` are appended correctly.
- `src/data/__tests__/movies.test.ts` (update): keep `getMovieDetails`/re-exports green; if `src/data/movies.ts` becomes a thin re-export wrapper over `src/lib/omdb.ts`, update tests to mock the omdb client instead of relying on mock data. Mock data fixtures (`mockMovieDetails`, `mockMovieSearchResponse`) are retained for component tests.
- Grid route: a Vitest render of `HomePage` with an error prop shows the inline error/empty state and does not render the grid; with movies it renders the grid (existing `MovieGrid.test.tsx` continues to pass unchanged).
- Details route: existing `MoviePage.test.tsx` stays green (presentational contract unchanged).

Coverage target: the OMDB client has 100% branch coverage for success + each error kind. No new e2e tests in this spec.

## Boundaries

- **Always:**
  - Read the API key only from `process.env.OMDB_API_KEY` server-side; never log it, never inline it in a URL string sent to the client, never pass it through props.
  - Run `bun run lint`, `bun run type-check`, and `bun run test` before declaring done; run `bun run build` if behavior changed.
  - Keep edits scoped to the files listed in Project Structure; preserve existing style and the `@/` alias.
  - Treat any non-2xx HTTP response as a transport error.
- **Ask first:**
  - Adding a new dependency.
  - Changing `next.config.ts` (e.g. adding image remote patterns).
  - Reading `page` from the URL before the "for now, page=1" constraint is lifted.
- **Never:**
  - Commit `.env` (already gitignored) or hardcode the API key in source.
  - Edit anything under `src/__registry__` or `src/registry/new-york-v4/ui`.
  - Expose the OMDB API key to the client (no `NEXT_PUBLIC_` prefix, no `"use client"` data fetching).
  - Remove existing passing tests without approval.

## Success Criteria

- [ ] Visiting `/` SSR-renders a grid populated from `GET {BASE_API_URL}?apikey={KEY}&s=list&page=1`.
- [ ] Visiting `/?s=batman` SSR-renders a grid for `s=batman`, page 1. The URL the browser sees contains `s=batman` and never contains `apikey`.
- [ ] Visiting `/tt0108052` SSR-renders the details page from `GET {BASE_API_URL}?apikey={KEY}&i=tt0108052`.
- [ ] When OMDB returns HTTP 404 for the list call, the grid page renders an inline error message (not a crash, not the Next.js 404 page).
- [ ] When OMDB returns `{ "Response": "False", "Error": "Too many results." }` (HTTP 200) for the list call, the grid page renders the "too many results" inline message.
- [ ] When OMDB returns `{ "Response": "False", "Error": "Movie not found!" }` for the list call, the grid page renders an empty-state message.
- [ ] When OMDB returns HTTP 404 or `{ "Response": "False", "Error": "Incorrect IMDb ID." }` for the details call, the route renders `not-found.tsx`.
- [ ] `page` is always sent as `1` to the list API regardless of URL.
- [ ] `bun run lint`, `bun run type-check`, `bun run test`, and `bun run build` all pass.
- [ ] No `NEXT_PUBLIC_` usage; the API key does not appear in the client bundle (verified by build + grep of `.next/static`).

## Open Questions

- None remaining. All scope decisions resolved during Specify (search UI: none; False responses: handle all; list 404 UX: inline; details failures: notFound()).
