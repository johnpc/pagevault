import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useActiveSelectionKeys } from './useActiveSelectionKeys';
import type { BlockSelection } from './blockSelection';

const ids = ['a', 'b', 'c', 'd'];
const sel: BlockSelection = { anchor: 1, focus: 2 }; // selects b,c

const press = (key: string, mods: Partial<KeyboardEvent> = {}) =>
  document.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, ...mods }));

function mount(actions: Parameters<typeof useActiveSelectionKeys>[3], setSel = vi.fn()) {
  renderHook(() => useActiveSelectionKeys(sel, ids, setSel, actions));
  return setSel;
}

describe('useActiveSelectionKeys', () => {
  it('Cmd/Ctrl+D duplicates the selected ids', () => {
    const onDuplicateMany = vi.fn();
    mount({ onDeleteMany: vi.fn(), onIndentMany: vi.fn(), onDuplicateMany });
    press('d', { metaKey: true });
    expect(onDuplicateMany).toHaveBeenCalledWith(['b', 'c']);
  });

  it('Cmd/Ctrl+C copies the selected ids and keeps the selection', () => {
    const onCopyMany = vi.fn();
    const setSel = mount({ onDeleteMany: vi.fn(), onIndentMany: vi.fn(), onCopyMany });
    press('c', { metaKey: true });
    expect(onCopyMany).toHaveBeenCalledWith(['b', 'c']);
    expect(setSel).not.toHaveBeenCalledWith(null); // copy doesn't clear
  });

  it('Backspace deletes the selected ids and clears', () => {
    const onDeleteMany = vi.fn();
    const setSel = mount({ onDeleteMany, onIndentMany: vi.fn() });
    press('Backspace');
    expect(onDeleteMany).toHaveBeenCalledWith(['b', 'c']);
    expect(setSel).toHaveBeenCalledWith(null);
  });

  it('Tab indents the selection, Shift+Tab outdents', () => {
    const onIndentMany = vi.fn();
    mount({ onDeleteMany: vi.fn(), onIndentMany });
    press('Tab');
    expect(onIndentMany).toHaveBeenLastCalledWith(['b', 'c'], 'in');
    press('Tab', { shiftKey: true });
    expect(onIndentMany).toHaveBeenLastCalledWith(['b', 'c'], 'out');
  });

  it('Cmd/Ctrl+A selects every block', () => {
    const setSel = mount({ onDeleteMany: vi.fn(), onIndentMany: vi.fn() });
    press('a', { ctrlKey: true });
    expect(setSel).toHaveBeenCalledWith({ anchor: 0, focus: 3 });
  });
});
