import { describe, it, expect } from 'vitest';
import {
  selectionBounds,
  selectedIds,
  isSelected,
  moveSelection,
  indexAfterDelete,
  selectionFromShiftClick,
} from './blockSelection';

const ids = ['a', 'b', 'c', 'd', 'e'];

describe('selectionBounds', () => {
  it('orders anchor/focus low→high regardless of direction', () => {
    expect(selectionBounds({ anchor: 1, focus: 3 })).toEqual([1, 3]);
    expect(selectionBounds({ anchor: 3, focus: 1 })).toEqual([1, 3]);
  });
});

describe('selectedIds', () => {
  it('returns the inclusive range of ids in list order', () => {
    expect(selectedIds({ anchor: 1, focus: 3 }, ids)).toEqual(['b', 'c', 'd']);
    expect(selectedIds({ anchor: 3, focus: 1 }, ids)).toEqual(['b', 'c', 'd']);
    expect(selectedIds({ anchor: 2, focus: 2 }, ids)).toEqual(['c']);
  });
  it('clamps to the list bounds', () => {
    expect(selectedIds({ anchor: 0, focus: 99 }, ids)).toEqual(ids);
  });
});

describe('isSelected', () => {
  it('is true inside the range and false outside', () => {
    const sel = { anchor: 1, focus: 3 };
    expect(isSelected(sel, 0)).toBe(false);
    expect(isSelected(sel, 1)).toBe(true);
    expect(isSelected(sel, 3)).toBe(true);
    expect(isSelected(sel, 4)).toBe(false);
  });
});

describe('moveSelection', () => {
  it('extend grows only the focus end', () => {
    expect(moveSelection({ anchor: 1, focus: 1 }, 1, true, 5)).toEqual({ anchor: 1, focus: 2 });
    expect(moveSelection({ anchor: 1, focus: 3 }, -1, true, 5)).toEqual({ anchor: 1, focus: 2 });
  });
  it('non-extend collapses to a single block at the new index', () => {
    expect(moveSelection({ anchor: 1, focus: 3 }, 1, false, 5)).toEqual({ anchor: 4, focus: 4 });
  });
  it('clamps focus to the list bounds', () => {
    expect(moveSelection({ anchor: 4, focus: 4 }, 1, true, 5)).toEqual({ anchor: 4, focus: 4 });
    expect(moveSelection({ anchor: 0, focus: 0 }, -1, true, 5)).toEqual({ anchor: 0, focus: 0 });
  });
  it('is a no-op on an empty list', () => {
    expect(moveSelection({ anchor: 0, focus: 0 }, 1, true, 0)).toEqual({ anchor: 0, focus: 0 });
  });
});

describe('indexAfterDelete', () => {
  it('returns the block just above the selection (min 0)', () => {
    expect(indexAfterDelete({ anchor: 2, focus: 4 })).toBe(1);
    expect(indexAfterDelete({ anchor: 0, focus: 2 })).toBe(0);
  });
});

describe('selectionFromShiftClick', () => {
  it('with no selection, anchors at the focused block and focuses the clicked one', () => {
    expect(selectionFromShiftClick(null, 3, 0)).toEqual({ anchor: 0, focus: 3 });
  });

  it('with no selection and no focused block, anchors at the clicked block', () => {
    expect(selectionFromShiftClick(null, 3, null)).toEqual({ anchor: 3, focus: 3 });
  });

  it('with an existing selection, keeps the anchor and moves the focus (extend)', () => {
    expect(selectionFromShiftClick({ anchor: 1, focus: 2 }, 4, 0)).toEqual({ anchor: 1, focus: 4 });
  });
});
