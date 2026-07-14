import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Skeleton } from './Skeleton';

describe('Skeleton', () => {
  it('renders the requested number of shimmer rows', () => {
    const { container } = render(<Skeleton rows={7} />);
    expect(container.querySelectorAll('.pv-skeleton-row')).toHaveLength(7);
  });

  it('defaults to 5 rows and marks the region busy', () => {
    render(<Skeleton />);
    const region = screen.getByLabelText('Loading');
    expect(region).toHaveAttribute('aria-busy', 'true');
    expect(region.querySelectorAll('.pv-skeleton-row')).toHaveLength(5);
  });
});
