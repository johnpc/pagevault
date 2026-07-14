import { useCallback, type KeyboardEvent } from 'react';
import { gridNavTarget, cellPosOf, caretEdges } from './tableGridNav';

/**
 * Spreadsheet keyboard navigation for a table body: Enter/↓ move down a row,
 * Shift+Enter/↑ up, ←/→ across at the text edge. Returns a keydown handler for
 * the <tbody>. It reads the focused cell's data-cell coords, asks gridNavTarget
 * where to go, then focuses that cell's control (via its data-cell td). Lives at
 * the body level so rows stay memoized (no new per-cell props).
 */
export function useTableGridNav(container: { rows: number; cols: number }) {
  return useCallback(
    (e: KeyboardEvent<HTMLTableSectionElement>) => {
      const el = e.target as HTMLElement;
      const pos = cellPosOf(el);
      if (!pos) return;
      const target = gridNavTarget(e, pos, container, caretEdges(el));
      if (!target) return;
      const td = e.currentTarget.querySelector(`td[data-cell="${target.r}-${target.c}"]`);
      const control = td?.querySelector<HTMLElement>('input, textarea, select, button');
      if (!control) return;
      e.preventDefault();
      control.focus();
      if (control instanceof HTMLInputElement && control.type === 'text') control.select();
    },
    [container],
  );
}
