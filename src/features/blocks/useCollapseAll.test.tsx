import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import type { BlockRecord } from '../../lib/pbClient';

const mutate = vi.fn();
vi.mock('./blockBatchApi', () => ({ useSetToggles: () => ({ mutate }) }));

import { useCollapseAll } from './useCollapseAll';

const mk = (id: string, type: string, collapsed = false): BlockRecord =>
  ({ id, type, collapsed }) as unknown as BlockRecord;

describe('useCollapseAll', () => {
  it('reports no toggles for a plain page', () => {
    const { result } = renderHook(() => useCollapseAll('p', [mk('a', 'text')]));
    expect(result.current.hasToggles).toBe(false);
  });

  it('collapses the open toggles in one batch mutation', () => {
    mutate.mockClear();
    const blocks = [mk('t1', 'toggle', false), mk('t2', 'toggle', true)];
    const { result } = renderHook(() => useCollapseAll('p', blocks));
    expect(result.current.willCollapse).toBe(true);
    result.current.collapseAll();
    expect(mutate).toHaveBeenCalledWith([{ id: 't1', collapsed: true }]);
  });

  it('expands an all-collapsed page in one batch', () => {
    mutate.mockClear();
    const { result } = renderHook(() => useCollapseAll('p', [mk('t', 'toggle', true)]));
    expect(result.current.willCollapse).toBe(false);
    result.current.collapseAll();
    expect(mutate).toHaveBeenCalledWith([{ id: 't', collapsed: false }]);
  });

  it('does not mutate when there are no toggles', () => {
    mutate.mockClear();
    const { result } = renderHook(() => useCollapseAll('p', [mk('a', 'text')]));
    result.current.collapseAll();
    expect(mutate).not.toHaveBeenCalled();
  });
});
