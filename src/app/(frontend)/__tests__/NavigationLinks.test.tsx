import NavigationLinks from '@/app/(frontend)/NavigationLinks';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

let mockPathname = '/';

vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname
}));

afterEach(() => {
  cleanup();
  mockPathname = '/';
});

describe('NavigationLinks', () => {
  it('marks the Home link as current when on /', () => {
    render(<NavigationLinks />);
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('aria-current', 'page');
  });

  it('does not mark the Home link as current on other routes', () => {
    mockPathname = '/tt1234567';
    render(<NavigationLinks />);
    expect(screen.getByRole('link', { name: 'Home' })).not.toHaveAttribute('aria-current');
  });
});
