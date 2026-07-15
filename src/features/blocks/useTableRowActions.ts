import { useCallback, useRef } from 'react';
import type { TableData } from '../../lib/pbTypes';
import { setCell, removeRow } from './tableData';
import { addColumnOption } from './tableColumns';
import { toggleValue } from './multiSelect';
import { duplicateRow } from './tableRowOps';
import { moveRow } from './tableSort';

/**
 * Row-scoped table actions (edit a cell, delete/duplicate a row, drop-reorder)
 * as REFERENTIALLY STABLE callbacks: they read the latest data/save through a
 * ref, so passing them to a memoized TableRow doesn't bust its memo on every
 * edit. Each takes the real row index. Drag state stays with the caller.
 */
export function useTableRowActions(data: TableData, save: (next: TableData) => void) {
  const ref = useRef({ data, save });
  ref.current = { data, save };

  const onCell = useCallback((r: number, c: number, value: string) => {
    const { data: d, save: s } = ref.current;
    s(setCell(d, r, c, value));
  }, []);

  const onDelete = useCallback((r: number) => {
    const { data: d, save: s } = ref.current;
    s(removeRow(d, r));
  }, []);

  const onDuplicate = useCallback((r: number) => {
    const { data: d, save: s } = ref.current;
    s(duplicateRow(d, r));
  }, []);

  const moveTo = useCallback((from: number, to: number) => {
    if (from === to) return;
    const { data: d, save: s } = ref.current;
    s(moveRow(d, from, to));
  }, []);

  // Create a new (multi)select option inline and assign it to the cell in one
  // save: select → set to it; multiselect → add it to the chosen tags.
  const onAddOption = useCallback((r: number, c: number, option: string) => {
    const { data: d, save: s } = ref.current;
    const withOpt = addColumnOption(d, c, option);
    if (withOpt === d) return; // blank / duplicate / not a (multi)select
    const opts = withOpt.columns[c].options ?? [];
    const value =
      withOpt.columns[c].type === 'multiselect'
        ? toggleValue(d.rows[r]?.[c] ?? '', option.trim(), opts)
        : option.trim();
    s(setCell(withOpt, r, c, value));
  }, []);

  return { onCell, onDelete, onDuplicate, moveTo, onAddOption };
}
