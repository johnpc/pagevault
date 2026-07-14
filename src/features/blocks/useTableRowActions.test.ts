import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useTableRowActions } from './useTableRowActions';
import type { TableData } from '../../lib/pbTypes';

const grid = (): TableData => ({
  columns: [
    { name: 'A', type: 'text' },
    { name: 'B', type: 'text' },
  ],
  rows: [
    ['1', '2'],
    ['3', '4'],
  ],
});

describe('useTableRowActions', () => {
  it('onCell edits the right cell', () => {
    const save = vi.fn();
    const { result } = renderHook(() => useTableRowActions(grid(), save));
    result.current.onCell(1, 0, 'X');
    expect(save.mock.calls[0][0].rows).toEqual([
      ['1', '2'],
      ['X', '4'],
    ]);
  });

  it('onDuplicate inserts a copy below and onDelete removes a row', () => {
    const save = vi.fn();
    const { result } = renderHook(() => useTableRowActions(grid(), save));
    result.current.onDuplicate(0);
    expect(save.mock.calls[0][0].rows).toHaveLength(3);
    result.current.onDelete(1);
    expect(save.mock.calls[1][0].rows).toEqual([['1', '2']]);
  });

  it('moveTo reorders rows (no-op for same index)', () => {
    const save = vi.fn();
    const { result } = renderHook(() => useTableRowActions(grid(), save));
    result.current.moveTo(0, 0);
    expect(save).not.toHaveBeenCalled();
    result.current.moveTo(0, 1);
    expect(save.mock.calls[0][0].rows).toEqual([
      ['3', '4'],
      ['1', '2'],
    ]);
  });

  it('callbacks stay referentially stable across re-renders (so a memo row holds)', () => {
    const { result, rerender } = renderHook(({ d }) => useTableRowActions(d, vi.fn()), {
      initialProps: { d: grid() },
    });
    const first = result.current.onCell;
    rerender({ d: grid() }); // new data object, same actions
    expect(result.current.onCell).toBe(first);
  });
});
