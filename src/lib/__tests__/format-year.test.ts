import { formatYear } from '@/lib/format-year';

import { describe, expect, it } from 'vitest';

describe('formatYear', () => {
  it('appends "now" to an ongoing series year with a trailing en dash', () => {
    expect(formatYear('2022–')).toBe('2022–now');
  });

  it('leaves a single year unchanged', () => {
    expect(formatYear('1994')).toBe('1994');
  });

  it('leaves a closed range unchanged', () => {
    expect(formatYear('2011–2015')).toBe('2011–2015');
  });

  it('leaves an empty string unchanged', () => {
    expect(formatYear('')).toBe('');
  });

  it('does not treat a hyphen-minus as a trailing en dash', () => {
    expect(formatYear('2022-')).toBe('2022-');
  });
});
