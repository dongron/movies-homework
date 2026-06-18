import ThemeSwitch from '@/app/(frontend)/ThemeSwitch';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const mockSetTheme = vi.fn();
let mockTheme = 'system';

vi.mock('next-themes', () => ({
  useTheme: () => ({ theme: mockTheme, setTheme: mockSetTheme })
}));

afterEach(() => {
  cleanup();
  mockSetTheme.mockClear();
  mockTheme = 'system';
});

describe('ThemeSwitch', () => {
  it('renders three theme buttons with accessible names', () => {
    render(<ThemeSwitch />);
    expect(screen.getByRole('button', { name: 'System' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Light' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Dark' })).toBeInTheDocument();
  });

  it('exposes aria-pressed on the active theme button', async () => {
    mockTheme = 'dark';
    render(<ThemeSwitch />);

    // Wait for the mounted useEffect
    await vi.waitFor(() => {
      expect(screen.getByRole('button', { name: 'Dark' })).toHaveAttribute('aria-pressed', 'true');
    });

    expect(screen.getByRole('button', { name: 'System' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: 'Light' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('wraps buttons in a group with "Theme" label', () => {
    render(<ThemeSwitch />);
    expect(screen.getByRole('group', { name: 'Theme' })).toBeInTheDocument();
  });

  it('does not render any heading elements', () => {
    render(<ThemeSwitch />);
    expect(screen.queryByRole('heading')).toBeNull();
  });
});
