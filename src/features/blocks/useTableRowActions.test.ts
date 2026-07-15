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

  const selectGrid = (): TableData => ({
    columns: [{ name: 'Tags', type: 'multiselect', options: ['Red'] }],
    rows: [['Red']],
  });

  it('onAddOption creates the option AND assigns it to the cell (multiselect toggles in)', () => {
    const save = vi.fn();
    const { result } = renderHook(() => useTableRowActions(selectGrid(), save));
    result.current.onAddOption(0, 0, 'Blue');
    const next = save.mock.calls[0][0] as TableData;
    expect(next.columns[0].options).toEqual(['Red', 'Blue']);
    expect(next.rows[0][0]).toBe('Red,Blue'); // added to the existing tags
  });

  it('onAddOption on a select column sets the cell to the new option', () => {
    const save = vi.fn();
    const data: TableData = {
      columns: [{ name: 'Status', type: 'select', options: [] }],
      rows: [['']],
    };
    const { result } = renderHook(() => useTableRowActions(data, save));
    result.current.onAddOption(0, 0, 'Open');
    const next = save.mock.calls[0][0] as TableData;
    expect(next.columns[0].options).toEqual(['Open']);
    expect(next.rows[0][0]).toBe('Open');
  });

  it('onRemoveOption drops the option from the column and cells', () => {
    const save = vi.fn();
    const data: TableData = {
      columns: [{ name: 'Tags', type: 'multiselect', options: ['Red', 'Blue'] }],
      rows: [['Red,Blue']],
    };
    const { result } = renderHook(() => useTableRowActions(data, save));
    result.current.onRemoveOption(0, 'Red');
    const next = save.mock.calls[0][0] as TableData;
    expect(next.columns[0].options).toEqual(['Blue']);
    expect(next.rows[0][0]).toBe('Blue');
  });

  it('onRenameOption renames the option in the column and every cell', () => {
    const save = vi.fn();
    const data: TableData = {
      columns: [{ name: 'Tags', type: 'multiselect', options: ['Red', 'Blue'] }],
      rows: [['Red,Blue']],
    };
    const { result } = renderHook(() => useTableRowActions(data, save));
    result.current.onRenameOption(0, 'Red', 'Crimson');
    const next = save.mock.calls[0][0] as TableData;
    expect(next.columns[0].options).toEqual(['Crimson', 'Blue']);
    expect(next.rows[0][0]).toBe('Crimson,Blue');
  });

  it('onRenameOption is a no-op (no save) when the rename does not apply', () => {
    const save = vi.fn();
    const data: TableData = {
      columns: [{ name: 'Tags', type: 'multiselect', options: ['Red', 'Blue'] }],
      rows: [['Red']],
    };
    const { result } = renderHook(() => useTableRowActions(data, save));
    result.current.onRenameOption(0, 'Red', 'Blue'); // collides with existing
    expect(save).not.toHaveBeenCalled();
  });

  it('onPasteGrid spreads a TSV grid and reports true; single-value returns false', () => {
    const save = vi.fn();
    const { result } = renderHook(() => useTableRowActions(grid(), save));
    // A real grid paste spreads + saves + reports handled.
    expect(result.current.onPasteGrid(0, 0, 'X\tY')).toBe(true);
    expect(save.mock.calls[0][0].rows[0]).toEqual(['X', 'Y']);
    save.mockClear();
    // A single value isn't a grid — no save, returns false (browser pastes it).
    expect(result.current.onPasteGrid(0, 0, 'plain')).toBe(false);
    expect(save).not.toHaveBeenCalled();
  });
});
