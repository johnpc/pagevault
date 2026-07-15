import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAddChildPage } from './useAddChildPage';
import type { PageRecord } from '../../lib/pbClient';

const pg = (id: string, parent = ''): PageRecord => ({ id, parent }) as PageRecord;

describe('useAddChildPage', () => {
  beforeEach(() => localStorage.clear());

  it('creates a child under the parent (sort among its existing children) and opens it', async () => {
    const pages = [pg('p'), pg('c1', 'p'), pg('other')];
    const mutateAsync = vi.fn().mockResolvedValue(pg('new', 'p'));
    const push = vi.fn();
    const setCollapsed = vi.fn();
    const { result } = renderHook(() =>
      useAddChildPage(pages, { mutateAsync }, { push } as never, setCollapsed),
    );
    await result.current('p');
    // Only the parent's existing children are passed as siblings (for sort).
    expect(mutateAsync).toHaveBeenCalledWith({
      parent: 'p',
      siblings: [{ id: 'c1', parent: 'p' }],
    });
    expect(push).toHaveBeenCalledWith('/page/new');
  });

  it('expands the parent so the new child is visible', async () => {
    const mutateAsync = vi.fn().mockResolvedValue(pg('new', 'p'));
    const setCollapsed = vi.fn();
    const { result } = renderHook(() =>
      useAddChildPage([pg('p')], { mutateAsync }, { push: vi.fn() } as never, setCollapsed),
    );
    await result.current('p');
    // The updater deletes the parent id from the collapsed set (present=collapsed).
    const updater = setCollapsed.mock.calls[0][0] as (s: Set<string>) => Set<string>;
    expect(updater(new Set(['p', 'q'])).has('p')).toBe(false);
  });

  it('keeps a stable identity across re-renders (memoized SidebarRow)', () => {
    const { result, rerender } = renderHook(
      ({ pages }) =>
        useAddChildPage(pages, { mutateAsync: vi.fn() }, { push: vi.fn() } as never, vi.fn()),
      { initialProps: { pages: [pg('a')] } },
    );
    const first = result.current;
    rerender({ pages: [pg('a'), pg('b')] }); // new pages array
    expect(result.current).toBe(first);
  });
});
