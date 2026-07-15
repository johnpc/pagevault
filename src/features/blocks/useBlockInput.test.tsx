import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { ChangeEvent } from 'react';
import { useBlockInput, type BlockEdits } from './useBlockInput';
import type { BlockRecord } from '../../lib/pbClient';

const mk = (over: Partial<BlockRecord> = {}): BlockRecord =>
  ({
    id: 'b1',
    page: 'p1',
    type: 'text',
    content: 'hello',
    checked: false,
    sort: 0,
    owner: 'u1',
    created: '',
    updated: '',
    collectionId: 'c',
    collectionName: 'blocks',
    ...over,
  }) as BlockRecord;

const edits: BlockEdits = {
  onEnter: () => false,
  onIndent: () => {},
  onMerge: () => false,
  onMergeForward: () => false,
};

const changeEvent = (value: string) => ({ target: { value } }) as ChangeEvent<HTMLTextAreaElement>;

const setup = (block = mk()) => {
  const onEdit = vi.fn();
  const onRemove = vi.fn();
  const { result } = renderHook(() => useBlockInput(block, onEdit, onRemove, edits));
  return { result, onEdit, onRemove };
};

describe('useBlockInput — buffer-locally, commit-on-blur (the per-keystroke perf contract)', () => {
  it('typing updates local value WITHOUT calling onEdit (no per-keystroke cache write)', () => {
    const { result, onEdit } = setup();
    act(() => result.current.change(changeEvent('hello w')));
    act(() => result.current.change(changeEvent('hello wo')));
    act(() => result.current.change(changeEvent('hello wor')));
    expect(result.current.value).toBe('hello wor'); // local state tracks each keystroke
    expect(onEdit).not.toHaveBeenCalled(); // …but the shared cache is untouched
  });

  it('blur (save) commits the buffered value exactly once', () => {
    const { result, onEdit } = setup();
    act(() => result.current.change(changeEvent('edited')));
    expect(onEdit).not.toHaveBeenCalled();
    act(() => result.current.save());
    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(onEdit).toHaveBeenCalledWith('b1', { content: 'edited' });
  });

  it('a markdown-shortcut prefix is the one immediate commit (it changes block TYPE)', () => {
    const { result, onEdit } = setup();
    act(() => result.current.change(changeEvent('# ')));
    // "# " converts to a heading — a type change must persist immediately, not wait for blur.
    expect(onEdit).toHaveBeenCalledWith('b1', { type: 'heading', content: '' });
  });

  it('focus/blur toggles the focused flag (gates realtime adoption)', () => {
    const { result } = setup();
    expect(result.current.focused).toBe(false);
    act(() => result.current.focus());
    expect(result.current.focused).toBe(true);
    act(() => result.current.save());
    expect(result.current.focused).toBe(false);
  });
});
