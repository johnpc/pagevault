import { describe, it, expect } from 'vitest';
import { parseClipboardGrid, isGridPaste, pasteGrid } from './tablePaste';
import type { TableData } from '../../lib/pbTypes';

const grid = (): TableData => ({
  columns: [
    { name: 'A', type: 'text' },
    { name: 'B', type: 'text' },
  ],
  rows: [
    ['a1', 'b1'],
    ['a2', 'b2'],
  ],
});

describe('parseClipboardGrid', () => {
  it('splits rows on newline and cells on tab', () => {
    expect(parseClipboardGrid('x\ty\nz\tw')).toEqual([
      ['x', 'y'],
      ['z', 'w'],
    ]);
  });
  it('normalizes CRLF and drops a single trailing blank line', () => {
    expect(parseClipboardGrid('x\ty\r\nz\tw\r\n')).toEqual([
      ['x', 'y'],
      ['z', 'w'],
    ]);
  });
});

describe('isGridPaste', () => {
  it('true for tab- or newline-bearing text', () => {
    expect(isGridPaste('x\ty')).toBe(true);
    expect(isGridPaste('x\ny')).toBe(true);
  });
  it('false for a single value (trailing newline ignored)', () => {
    expect(isGridPaste('hello')).toBe(false);
    expect(isGridPaste('hello\n')).toBe(false);
  });
});

describe('pasteGrid', () => {
  it('spreads a grid across cells from the target, filling right + down', () => {
    const next = pasteGrid(grid(), 0, 0, 'X\tY\nZ\tW');
    expect(next.rows).toEqual([
      ['X', 'Y'],
      ['Z', 'W'],
    ]);
  });

  it('appends rows when the paste extends past the bottom', () => {
    const next = pasteGrid(grid(), 1, 0, 'p\tq\nr\ts'); // starts on the last row
    expect(next.rows).toEqual([
      ['a1', 'b1'],
      ['p', 'q'],
      ['r', 's'],
    ]);
  });

  it('clips columns past the table width (never widens the schema)', () => {
    const next = pasteGrid(grid(), 0, 1, 'X\tY'); // 2 cells starting at col 1 (only col 1 exists)
    expect(next.rows[0]).toEqual(['a1', 'X']); // Y dropped (no 3rd column)
  });

  it('is a no-op for a single-value paste (browser handles the one cell)', () => {
    const base = grid();
    expect(pasteGrid(base, 0, 0, 'just text')).toBe(base);
  });

  it('does not mutate the input grid', () => {
    const base = grid();
    pasteGrid(base, 0, 0, 'X\tY');
    expect(base.rows[0]).toEqual(['a1', 'b1']);
  });
});
