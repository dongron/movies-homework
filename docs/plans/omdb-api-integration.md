# Implementation Plan: OMDB API Integration

## Overview

Replace the mock data layer for the movies grid and movie details pages with real server-side `fetch` calls to the OMDB API. The grid route reads its search term from URL search params (never the API key) and renders inline error/empty states on failure. The details route calls `notFound()` on any failure. A new typed OMDB client (`src/lib/omdb.ts`) centralizes URL building and error classification; `src/data/movies.ts` becomes a thin data-access wrapper over it so existing import paths stay valid.

## Architecture Decisions

- **Layered data access:** Routes import from `@/data/movies` (existing path), which delegates to `@/lib/omdb.ts`. Keeps the OMDB HTTP contract in one testable unit and avoids churning route import paths. Mock fixtures stay in `src/data/movies.ts` for component tests.
- **Typed errors over sentinel values:** The OMDB client throws a discriminated `OmdbError` (`kind: 'transport' | 'api'`) rather than returning `null`. This lets the grid route distinguish "too many results" (api) from a 404 (transport) and render the right inline state, while the details route collapses both into `notFound()`.
- **Thin route components, fat presentational children:** `page.tsx` files do only orchestration (await params/searchParams, call data layer, try/catch, hand off). All rendering logic lives in `HomePage`/`MoviePage`, which are already covered by vitest + testing-library. Async RSC `page.tsx` is verified via type-check + build + manual, not unit tests (jsdom can't faithfully run RSC).
- **API key isolation:** Read from `process.env.OMDB_API_KEY` only in `src/lib/omdb.ts` (server module). Never passed through props, never prefixed `NEXT_PUBLIC_`, never appears in a URL string the browser sees. The `?s=` search param is the only OMDB parameter mirrored into the browser URL.
- **Dynamic routes by default:** `searchParams` and `params` make both routes dynamic in App Router, so `next build` will not call the OMDB API at build time. No `generateStaticParams` / `revalidate` changes in scope.

## Task List

### Phase 1: Foundation (shared contract)

- [ ] **Task 1: Add `OmdbError` type**
  - Description: Extend `src/types/Movie.ts` with the discriminated error shape the OMDB client will throw, so the client and routes share one source of truth.
  - Acceptance:
    - [ ] `OmdbError` type exported from `@/types/Movie` with `kind: 'transport' | 'api'`, optional `status?: number`, required `message: string`.
    - [ ] No existing types removed or renamed; `MovieSearchResponse`, `MovieDetails`, etc. unchanged.
  - Verify: `bun run type-check` passes; `bun run lint` passes.
  - Dependencies: None.
  - Files: `src/types/Movie.ts`
  - Scope: XS (1 file)

- [ ] **Task 2: Build OMDB client + unit tests**
  - Description: Create `src/lib/omdb.ts` exporting `buildOmdbUrl`, `searchMovies`, and `fetchMovieDetails`. Implement the throwing contract from the spec: non-2xx or fetch rejection → `OmdbError` `kind: 'transport'`; `Response === 'False'` → `OmdbError` `kind: 'api'` with the OMDB `Error` string. Read `process.env.BASE_API_URL` and `process.env.OMDB_API_KEY`. Cover with `src/lib/__tests__/omdb.test.ts` using mocked `global.fetch`.
  - Acceptance:
    - [ ] `buildOmdbUrl({ s, page })` and `buildOmdbUrl({ i })` produce URLs with `apikey`, `s`/`i`, and `page` set correctly; `page` defaults to `1`.
    - [ ] `searchMovies` returns parsed `MovieSearchResponse` on success; throws `transport` error on HTTP 404 and on fetch rejection; throws `api` error with `"Too many results."`, `"Movie not found!"`, and `"Invalid API key!"` for the corresponding `Response: "False"` payloads.
    - [ ] `fetchMovieDetails` returns parsed `MovieDetails` on success; throws `transport` on 404; throws `api` with `"Incorrect IMDb ID."` for that False payload.
    - [ ] All tests pass with `global.fetch` mocked and restored per test; no real network calls.
  - Verify: `bun run test -- src/lib/__tests__/omdb.test.ts` passes; `bun run type-check` passes; `bun run lint` passes.
  - Dependencies: Task 1.
  - Files: `src/lib/omdb.ts`, `src/lib/__tests__/omdb.test.ts`
  - Scope: M (2 files, but the client + its tests are one cohesive unit)

### Checkpoint: Foundation
- [ ] `bun run lint`, `bun run type-check`, `bun run test` all pass
- [ ] OMDB client tested in isolation with no real network calls
- [ ] No route files touched yet; app still runs against mock data unchanged

- [ ] **Task 3: Data-access wrapper + update its tests**
  - Description: Rewrite `src/data/movies.ts` so `getMovieDetails(id)` delegates to `fetchMovieDetails` (re-exporting the typed throw behavior) and add `searchMovies(term, page)` re-exporting from `@/lib/omdb`. Keep `mockMovieDetails` and `mockMovieSearchResponse` exports intact as test fixtures. Update `src/data/__tests__/movies.test.ts` to mock `@/lib/omdb` instead of asserting against static mock data.
  - Acceptance:
    - [ ] `getMovieDetails` and `searchMovies` re-export/delegate to `@/lib/omdb`; mock fixtures still exported with the same names and shapes.
    - [ ] `movies.test.ts` mocks `@/lib/omdb` and asserts `getMovieDetails` returns the mocked details for a known ID and throws/propagates for an unknown ID per the new contract.
    - [ ] No other source file that imports from `@/data/movies` breaks (grep confirms import sites still resolve).
  - Verify: `bun run test -- src/data` passes; `bun run type-check` passes; `bun run lint` passes.
  - Dependencies: Task 2.
  - Files: `src/data/movies.ts`, `src/data/__tests__/movies.test.ts`
  - Scope: S (2 files)

### Phase 2: Core Features (vertical slices)

- [ ] **Task 4: Details route SSR integration**
  - Description: Update `src/app/(frontend)/[movie-id]/page.tsx` to `await fetchMovieDetails(id)` inside a try/catch; on any thrown `OmdbError` (transport or api) or unexpected error, call `notFound()`. On success, render `MoviePage` as today. Keep the existing `params: Promise<{ 'movie-id': string }>` signature.
  - Acceptance:
    - [ ] Page calls the real OMDB details endpoint via the data layer; no mock import remains in this file.
    - [ ] Any `OmdbError` (404 transport, "Incorrect IMDb ID." api) triggers `notFound()` and renders the existing `not-found.tsx`.
    - [ ] Existing `MoviePage.test.tsx` still passes (presentational contract unchanged).
  - Verify: `bun run type-check`; `bun run test`; `bun run build` succeeds without prerendering the dynamic route; manual: visit `/tt0108052` (renders details) and `/tt0000000` (renders not-found).
  - Dependencies: Task 3.
  - Files: `src/app/(frontend)/[movie-id]/page.tsx`
  - Scope: XS (1 file)

- [ ] **Task 5: Grid route SSR + HomePage error/empty states**
  - Description: Convert `src/app/(frontend)/page.tsx` to an async Server Component reading `searchParams: Promise<{ s?: string; page?: string }>`, defaulting `s` to `"list"` and hardcoding `page=1`, then calling `searchMovies(s, 1)` in a try/catch. On success pass `movies` to `HomePage`; on `OmdbError` pass an `error` descriptor. Update `HomePage.tsx` to accept either `movies` or `error` and render: the grid (success), "too many results" inline state (api + `"Too many results."`), "no movies matched" empty state (api + `"Movie not found!"`), or a generic inline error (all other failures). Add `src/app/(frontend)/__tests__/HomePage.test.tsx` covering the four branches.
  - Acceptance:
    - [ ] `page.tsx` derives `s` from URL (default `"list"`), always sends `page=1`, and never puts `apikey` in any client-visible URL.
    - [ ] `HomePage` renders `MovieGrid` when given `movies`; renders the correct inline message for each of the three error/empty variants; never renders the grid in an error state.
    - [ ] `MovieGrid.test.tsx` and `MovieCard.test.tsx` still pass unchanged.
    - [ ] New `HomePage.test.tsx` mocks `next/image` and `next/link` per existing convention and asserts each branch's visible text.
  - Verify: `bun run test` (all green, including new HomePage tests); `bun run type-check`; `bun run lint`; `bun run build`; manual: visit `/` (grid), `/?s=zzzznotreal` (empty state), and temporarily break the env to confirm the generic error state renders.
  - Dependencies: Task 4 (same data layer; independent route but sequential to keep one PR-shaped checkpoint).
  - Files: `src/app/(frontend)/page.tsx`, `src/app/(frontend)/HomePage.tsx`, `src/app/(frontend)/__tests__/HomePage.test.tsx`
  - Scope: M (3 files)

### Checkpoint: Core Features
- [ ] `bun run lint`, `bun run type-check`, `bun run test`, `bun run build` all pass
- [ ] Both routes SSR-render from the real OMDB API
- [ ] All four grid failure modes render inline states; details failures render `not-found.tsx`
- [ ] No mock data used in route code (only in tests)

### Phase 3: Polish

- [ ] **Task 6: Final validation + leak check**
  - Description: Run the full validation suite from `AGENTS.md`, verify the API key never leaks into the client bundle, and confirm every spec success criterion checkbox is demonstrably met. Update the spec's success criteria checkboxes to reflect reality.
  - Acceptance:
    - [ ] `bun run lint`, `bun run type-check`, `bun run test`, `bun run build` all pass cleanly.
    - [ ] Grep of `.next/static` (and `.next/server` sanity) for the literal API key `b8186782` and the env var name `OMDB_API_KEY` returns no matches in client chunks.
    - [ ] No `NEXT_PUBLIC_` usage introduced anywhere in `src/`.
    - [ ] `docs/specs/omdb-api-integration.md` success criteria checkboxes all checked.
  - Verify: run the four commands; `rg -n "b8186782|OMDB_API_KEY|NEXT_PUBLIC_" .next/static` returns no matches; review the spec checklist.
  - Dependencies: Task 5.
  - Files: `docs/specs/omdb-api-integration.md` (checkbox updates only)
  - Scope: XS (0 source files)

### Checkpoint: Complete
- [ ] All spec success criteria met and checked off
- [ ] All validation commands green
- [ ] No API key leakage in client bundle
- [ ] Ready for human review

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Async RSC `page.tsx` can't be unit-tested in jsdom | Med | Keep `page.tsx` as orchestration only; push all rendering into `HomePage`/`MoviePage` which are tested. Verify routes via type-check + build + manual. |
| `next build` tries to prerender and hits the OMDB API | Med | `searchParams`/`params` make both routes dynamic automatically; no `generateStaticParams`. Confirm via build log showing the routes as `ƒ (Dynamic)`. |
| API key leaks into client bundle | High | Only reference `process.env.OMDB_API_KEY` inside `src/lib/omdb.ts` (server module); never pass it through props or `NEXT_PUBLIC_`. Task 6 greps `.next/static` to verify. |
| Mocked `global.fetch` leaks between tests | Low | `afterEach(() => vi.restoreAllMocks())` in `omdb.test.ts`; isolate mocks per test. |
| OMDB env var missing in dev runtime | Low | Document in spec; dev fails loudly with a transport error that the grid renders as the generic inline error (not a crash). |
| Existing `@/data/movies` import sites break | Low | Task 3 keeps `getMovieDetails` + mock fixture exports; grep all import sites before/after. |
| `Movie not found!` False response mis-classified as hard error | Low | Spec fixes this as an empty-state; Task 5's HomePage branches on `error.message` to render "no movies matched" for that specific string. |

## Open Questions

- None. All scope decisions resolved during Specify; no new questions surfaced during planning.

## Parallelization Notes

Tasks are strictly sequential here (single agent, each builds on the previous layer's contract). If parallelized later, the only safe-to-parallelize pair would be Task 4 (details route) and Task 5 (grid route) after Task 3 lands, since they touch disjoint files and share only the already-frozen `@/data/movies` contract.
