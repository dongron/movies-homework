import MoviePagination from '@/components/movies/MoviePagination';
import { cleanup, render } from '@testing-library/react';

import { afterEach, describe, expect, it } from 'vitest';

afterEach(cleanup);

describe('MoviePagination', () => {
  const baseProps = {
    searchTerm: 'batman',
    pageNumber: 1,
    totalResults: 42
  };

  it('renders page links for totalResults=42 (5 pages)', () => {
    const { getAllByRole } = render(<MoviePagination {...baseProps} />);
    const links = getAllByRole('link');
    // page 1 (page 1, active) + page 2 + page 5 + next = 4
    // prev is disabled (no href, not a link); ellipsis is a span
    expect(links.length).toBe(4);
  });

  it('marks the current page with aria-current="page"', () => {
    const { getByRole } = render(<MoviePagination {...baseProps} pageNumber={3} />);
    const current = getByRole('link', { current: 'page' });
    expect(current).toHaveTextContent('3');
  });

  it('caps at 100 pages even when totalResults implies more', () => {
    const { getAllByRole } = render(<MoviePagination {...baseProps} totalResults={5000} pageNumber={1} />);
    const links = getAllByRole('link');
    // With 500 pages capped to 100, pagination will show a windowed subset
    // but the last numbered link should be "100"
    const lastNumberedLink = links[links.length - 2]; // before "next"
    expect(lastNumberedLink).toHaveTextContent('100');
  });

  it('preserves search, type and year in page hrefs', () => {
    const { getByRole } = render(
      <MoviePagination searchTerm='batman' pageNumber={1} totalResults={30} type='movie' year={2008} />
    );
    const page2Link = getByRole('link', { name: '2' });
    expect(page2Link).toHaveAttribute('href', expect.stringContaining('s=batman'));
    expect(page2Link).toHaveAttribute('href', expect.stringContaining('type=movie'));
    expect(page2Link).toHaveAttribute('href', expect.stringContaining('y=2008'));
    expect(page2Link).toHaveAttribute('href', expect.stringContaining('page=2'));
  });

  it('renders nothing when totalPages is 1', () => {
    const { container } = render(<MoviePagination {...baseProps} totalResults={10} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders nothing when totalResults is 0', () => {
    const { container } = render(<MoviePagination {...baseProps} totalResults={0} />);
    expect(container.innerHTML).toBe('');
  });

  it('disables Previous on page 1', () => {
    const { getByLabelText } = render(<MoviePagination {...baseProps} />);
    const prev = getByLabelText('Go to previous page');
    expect(prev).toHaveAttribute('aria-disabled', 'true');
  });

  it('disables Next on the last page', () => {
    const { getByLabelText } = render(<MoviePagination {...baseProps} pageNumber={5} />);
    const next = getByLabelText('Go to next page');
    expect(next).toHaveAttribute('aria-disabled', 'true');
  });

  it('enables Previous and Next on a middle page', () => {
    const { getByLabelText } = render(<MoviePagination {...baseProps} pageNumber={3} />);
    expect(getByLabelText('Go to previous page')).not.toHaveAttribute('aria-disabled');
    expect(getByLabelText('Go to next page')).not.toHaveAttribute('aria-disabled');
  });
});
