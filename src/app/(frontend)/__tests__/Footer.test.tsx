import Footer from '@/app/(frontend)/Footer';
import { SITE_NAME } from '@/lib/site';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/navigation', () => ({
  usePathname: () => '/'
}));

afterEach(() => {
  cleanup();
});

describe('Footer', () => {
  it('renders a footer landmark', () => {
    render(<Footer />);
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('renders a footer navigation landmark', () => {
    render(<Footer />);
    expect(screen.getByRole('navigation', { name: 'Footer' })).toBeInTheDocument();
  });

  it('renders copyright text with the current year and site name', () => {
    render(<Footer />);
    const year = new Date().getFullYear();
    expect(screen.getByText(`© ${year} ${SITE_NAME}`)).toBeInTheDocument();
  });
});
