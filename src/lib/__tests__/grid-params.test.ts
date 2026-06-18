import { canonicalizeGridParams, setGridFilter } from '@/lib/grid-params';

import { describe, expect, it } from 'vitest';

describe('canonicalizeGridParams', () => {
  describe('defaults', () => {
    it('defaults missing s and page to empty search and page 1, without redirecting', () => {
      const result = canonicalizeGridParams(undefined, undefined);
      expect(result).toEqual({
        searchTerm: '',
        pageNumber: 1,
        canonical: '/?page=1',
        needsRedirect: false
      });
    });

    it('treats explicit empty s as empty string without redirecting', () => {
      const result = canonicalizeGridParams('', undefined);
      expect(result.searchTerm).toBe('');
      expect(result.needsRedirect).toBe(false);
    });

    it('defaults whitespace-only s to empty string and flags a redirect', () => {
      const result = canonicalizeGridParams('   ', undefined);
      expect(result.searchTerm).toBe('');
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
        needsRedirect: false
      });
    });

    it('treats canonical "list" page 1 as no redirect', () => {
      const result = canonicalizeGridParams('list', '1');
      expect(result.needsRedirect).toBe(false);
      expect(result.canonical).toBe('/?s=list&page=1');
    });

    it('treats bare "/" with no params as no redirect', () => {
      const result = canonicalizeGridParams(undefined, undefined);
      expect(result.needsRedirect).toBe(false);
      expect(result.canonical).toBe('/?page=1');
    });
  });

  describe('normalization', () => {
    it('trims whitespace from s and flags a redirect', () => {
      const result = canonicalizeGridParams(' batman ', '1');
      expect(result.searchTerm).toBe('batman');
      expect(result.canonical).toBe('/?s=batman&page=1');
      expect(result.needsRedirect).toBe(true);
    });

    it('fills missing page with default 1 without redirecting', () => {
      const result = canonicalizeGridParams('batman', undefined);
      expect(result.pageNumber).toBe(1);
      expect(result.canonical).toBe('/?s=batman&page=1');
      expect(result.needsRedirect).toBe(false);
    });

    it('fills missing s with empty string while preserving a provided page', () => {
      const result = canonicalizeGridParams(undefined, '3');
      expect(result.searchTerm).toBe('');
      expect(result.canonical).toBe('/?page=3');
      expect(result.needsRedirect).toBe(false);
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

    it('accepts high page numbers without clamping', () => {
      const result = canonicalizeGridParams('list', '999');
      expect(result.pageNumber).toBe(999);
      expect(result.canonical).toBe('/?s=list&page=999');
      expect(result.needsRedirect).toBe(false);
    });

    it('treats non-numeric page as default 1', () => {
      const result = canonicalizeGridParams('list', 'abc');
      expect(result.pageNumber).toBe(1);
      expect(result.canonical).toBe('/?s=list&page=1');
      expect(result.needsRedirect).toBe(true);
    });

    it('accepts page 100 without redirect', () => {
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

    it('treats empty string page as default 1 without redirecting', () => {
      const result = canonicalizeGridParams('list', '');
      expect(result.pageNumber).toBe(1);
      expect(result.needsRedirect).toBe(false);
    });

    it('accepts page numbers well above 100 (real totalResults can exceed 1000)', () => {
      const result = canonicalizeGridParams('test', '500');
      expect(result.pageNumber).toBe(500);
      expect(result.canonical).toBe('/?s=test&page=500');
      expect(result.needsRedirect).toBe(false);
    });
  });

  describe('year filter', () => {
    it('passes a valid 4-digit year through and includes it in the canonical URL', () => {
      const result = canonicalizeGridParams('batman', '2', undefined, '2008');
      expect(result.year).toBe(2008);
      expect(result.canonical).toBe('/?s=batman&y=2008&page=2');
      expect(result.needsRedirect).toBe(false);
    });

    it('omits year from the canonical URL when absent', () => {
      const result = canonicalizeGridParams('batman', '2');
      expect(result.year).toBeUndefined();
      expect(result.canonical).toBe('/?s=batman&page=2');
    });

    it('drops an out-of-range year (too low) and flags a redirect', () => {
      const result = canonicalizeGridParams('list', '1', undefined, '1899');
      expect(result.year).toBeUndefined();
      expect(result.needsRedirect).toBe(true);
    });

    it('drops an out-of-range year (future) and flags a redirect', () => {
      const result = canonicalizeGridParams('list', '1', undefined, '2099');
      expect(result.year).toBeUndefined();
      expect(result.needsRedirect).toBe(true);
    });

    it('drops a non-numeric year and flags a redirect', () => {
      const result = canonicalizeGridParams('list', '1', undefined, 'abc');
      expect(result.year).toBeUndefined();
      expect(result.needsRedirect).toBe(true);
    });

    it('drops an empty year without redirecting', () => {
      const result = canonicalizeGridParams('list', '1', undefined, '');
      expect(result.year).toBeUndefined();
      expect(result.needsRedirect).toBe(false);
    });

    it('accepts the minimum year (1900)', () => {
      const result = canonicalizeGridParams('list', '1', undefined, '1900');
      expect(result.year).toBe(1900);
    });

    it('accepts the current year', () => {
      const currentYear = new Date().getFullYear();
      const result = canonicalizeGridParams('list', '1', undefined, String(currentYear));
      expect(result.year).toBe(currentYear);
    });
  });

  describe('combined year and type in canonical URL', () => {
    it('orders as s, type, y, page', () => {
      const result = canonicalizeGridParams('batman', '1', 'movie', '2008');
      expect(result.canonical).toBe('/?s=batman&type=movie&y=2008&page=1');
    });

    it('includes only type when year is absent', () => {
      const result = canonicalizeGridParams('batman', '1', 'series');
      expect(result.canonical).toBe('/?s=batman&type=series&page=1');
    });

    it('includes only year when type is absent', () => {
      const result = canonicalizeGridParams('batman', '1', undefined, '2005');
      expect(result.canonical).toBe('/?s=batman&y=2005&page=1');
    });
  });

  describe('type filter', () => {
    it('passes a valid type through and includes it in the canonical URL', () => {
      const result = canonicalizeGridParams('batman', '2', 'series');
      expect(result.type).toBe('series');
      expect(result.canonical).toBe('/?s=batman&type=series&page=2');
      expect(result.needsRedirect).toBe(false);
    });

    it('accepts movie and episode types', () => {
      expect(canonicalizeGridParams('list', '1', 'movie').type).toBe('movie');
      expect(canonicalizeGridParams('list', '1', 'episode').type).toBe('episode');
    });

    it('omits type from the canonical URL when absent', () => {
      const result = canonicalizeGridParams('batman', '2');
      expect(result.type).toBeUndefined();
      expect(result.canonical).toBe('/?s=batman&page=2');
    });

    it('drops an invalid type and flags a redirect', () => {
      const result = canonicalizeGridParams('list', '1', 'bogus');
      expect(result.type).toBeUndefined();
      expect(result.canonical).toBe('/?s=list&page=1');
      expect(result.needsRedirect).toBe(true);
    });

    it('drops an empty type without redirecting', () => {
      const result = canonicalizeGridParams('list', '1', '');
      expect(result.type).toBeUndefined();
      expect(result.needsRedirect).toBe(false);
    });
  });
});

describe('setGridFilter', () => {
  it('sets the key and resets paging by dropping page', () => {
    const next = setGridFilter(new URLSearchParams('s=batman&page=5'), 'type', 'movie');
    expect(next.get('type')).toBe('movie');
    expect(next.has('page')).toBe(false);
    expect(next.get('s')).toBe('batman');
  });

  it('removes the key when the value is null', () => {
    const next = setGridFilter(new URLSearchParams('s=batman&type=movie&page=3'), 'type', null);
    expect(next.has('type')).toBe(false);
    expect(next.has('page')).toBe(false);
    expect(next.get('s')).toBe('batman');
  });

  it('removes the key when the value is an empty string', () => {
    const next = setGridFilter(new URLSearchParams('type=movie'), 'type', '');
    expect(next.has('type')).toBe(false);
  });

  it('does not mutate the input params', () => {
    const input = new URLSearchParams('type=movie&page=2');
    setGridFilter(input, 'type', 'series');
    expect(input.get('type')).toBe('movie');
    expect(input.get('page')).toBe('2');
  });
});
