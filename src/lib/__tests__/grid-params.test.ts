import { describe, expect, it } from 'vitest';

import { canonicalizeGridParams } from '@/lib/grid-params';

describe('canonicalizeGridParams', () => {
  describe('defaults', () => {
    it('defaults missing s and page to "list" and 1, flagging a redirect', () => {
      const result = canonicalizeGridParams(undefined, undefined);
      expect(result).toEqual({
        searchTerm: 'list',
        pageNumber: 1,
        canonical: '/?s=list&page=1',
        needsRedirect: true,
      });
    });

    it('defaults empty s to "list"', () => {
      const result = canonicalizeGridParams('', undefined);
      expect(result.searchTerm).toBe('list');
      expect(result.needsRedirect).toBe(true);
    });

    it('defaults whitespace-only s to "list"', () => {
      const result = canonicalizeGridParams('   ', undefined);
      expect(result.searchTerm).toBe('list');
      expect(result.needsRedirect).toBe(true);
    });
  });

  describe('canonical passthrough', () => {
    it('returns needsRedirect=false when s and page are already canonical', () => {
      const result = canonicalizeGridParams('batman', '2');
      expect(result).toEqual({
        searchTerm: 'batman',
        pageNumber: 2,
        canonical: '/?s=batman&page=2',
        needsRedirect: false,
      });
    });

    it('treats canonical "list" page 1 as no redirect', () => {
      const result = canonicalizeGridParams('list', '1');
      expect(result.needsRedirect).toBe(false);
      expect(result.canonical).toBe('/?s=list&page=1');
    });
  });

  describe('normalization', () => {
    it('trims whitespace from s and flags a redirect', () => {
      const result = canonicalizeGridParams(' list ', '1');
      expect(result.searchTerm).toBe('list');
      expect(result.canonical).toBe('/?s=list&page=1');
      expect(result.needsRedirect).toBe(true);
    });

    it('adds missing page (defaults to 1) and flags a redirect', () => {
      const result = canonicalizeGridParams('batman', undefined);
      expect(result.pageNumber).toBe(1);
      expect(result.canonical).toBe('/?s=batman&page=1');
      expect(result.needsRedirect).toBe(true);
    });

    it('adds missing s (defaults to "list") while preserving a provided page', () => {
      const result = canonicalizeGridParams(undefined, '3');
      expect(result.searchTerm).toBe('list');
      expect(result.canonical).toBe('/?s=list&page=3');
      expect(result.needsRedirect).toBe(true);
    });

    it('URL-encodes special characters in s', () => {
      const result = canonicalizeGridParams('bat man', '1');
      expect(result.canonical).toBe('/?s=bat%20man&page=1');
      // Next.js decodes searchParams, so a canonical `/?s=bat%20man` URL arrives
      // here as the already-normalized `'bat man'`. No redirect is needed (and
      // asserting one would cause an infinite redirect loop in page.tsx).
      expect(result.needsRedirect).toBe(false);
    });

    it('encodes ampersand-like characters in s', () => {
      const result = canonicalizeGridParams('tom & jerry', '1');
      expect(result.canonical).toBe('/?s=tom%20%26%20jerry&page=1');
      expect(result.needsRedirect).toBe(false);
    });
  });

  describe('page parsing and clamping', () => {
    it('clamps page 0 to 1 and flags a redirect', () => {
      const result = canonicalizeGridParams('list', '0');
      expect(result.pageNumber).toBe(1);
      expect(result.canonical).toBe('/?s=list&page=1');
      expect(result.needsRedirect).toBe(true);
    });

    it('clamps negative page to 1', () => {
      const result = canonicalizeGridParams('list', '-5');
      expect(result.pageNumber).toBe(1);
      expect(result.needsRedirect).toBe(true);
    });

    it('clamps page above 100 down to 100 (OMDB max)', () => {
      const result = canonicalizeGridParams('list', '999');
      expect(result.pageNumber).toBe(100);
      expect(result.canonical).toBe('/?s=list&page=100');
      expect(result.needsRedirect).toBe(true);
    });

    it('treats non-numeric page as default 1', () => {
      const result = canonicalizeGridParams('list', 'abc');
      expect(result.pageNumber).toBe(1);
      expect(result.canonical).toBe('/?s=list&page=1');
      expect(result.needsRedirect).toBe(true);
    });

    it('accepts page 100 as the upper bound (no redirect if canonical)', () => {
      const result = canonicalizeGridParams('list', '100');
      expect(result.pageNumber).toBe(100);
      expect(result.canonical).toBe('/?s=list&page=100');
      expect(result.needsRedirect).toBe(false);
    });

    it('trims whitespace from page', () => {
      const result = canonicalizeGridParams('list', '  2  ');
      expect(result.pageNumber).toBe(2);
      expect(result.needsRedirect).toBe(true);
    });

    it('parses float-ish page by flooring to integer', () => {
      const result = canonicalizeGridParams('list', '2.9');
      expect(result.pageNumber).toBe(2);
      expect(result.needsRedirect).toBe(true);
    });

    it('treats empty string page as default 1', () => {
      const result = canonicalizeGridParams('list', '');
      expect(result.pageNumber).toBe(1);
      expect(result.needsRedirect).toBe(true);
    });
  });
});
