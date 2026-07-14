import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoadState } from './LoadState';

describe('LoadState', () => {
  it('shows children when ready', () => {
    render(
      <LoadState loading={false} error={false} empty={false}>
        <p>content</p>
      </LoadState>,
    );
    expect(screen.getByText('content')).toBeInTheDocument();
  });

  it('shows a busy spinner while loading', () => {
    const { container } = render(
      <LoadState loading error={false} empty={false}>
        <p>content</p>
      </LoadState>,
    );
    expect(container.querySelector('[aria-busy="true"]')).toBeInTheDocument();
    expect(screen.queryByText('content')).not.toBeInTheDocument();
  });

  it('shows skeleton rows while loading when skeletonRows is set', () => {
    const { container } = render(
      <LoadState loading error={false} empty={false} skeletonRows={4}>
        <p>content</p>
      </LoadState>,
    );
    expect(container.querySelectorAll('.pv-skeleton-row')).toHaveLength(4);
    expect(screen.queryByText('content')).not.toBeInTheDocument();
  });

  it('shows a titled empty state', () => {
    render(
      <LoadState loading={false} error={false} empty emptyTitle="No pages">
        <p>content</p>
      </LoadState>,
    );
    expect(screen.getByText('No pages')).toBeInTheDocument();
  });

  it('prioritizes error over empty and offers retry', async () => {
    const onRetry = vi.fn();
    render(
      <LoadState loading={false} error empty onRetry={onRetry}>
        <p>content</p>
      </LoadState>,
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(onRetry).toHaveBeenCalledOnce();
  });
});
