import { describe, it, expect, vi } from 'vitest';
import { makeEditKey } from './blockEditKey';

// A minimal fake keyboard event over a textarea with a caret/selection.
function evt(key: string, over: Record<string, unknown> = {}, ta: Record<string, unknown> = {}) {
  return {
    key,
    shiftKey: false,
    preventDefault: vi.fn(),
    currentTarget: { selectionStart: 0, selectionEnd: 0, setSelectionRange: vi.fn(), ...ta },
    ...over,
  };
}

const deps = (over: Record<string, unknown> = {}) => ({
  value: '',
  isCode: false,
  onIndent: vi.fn(),
  onEnter: vi.fn(() => true),
  onRemove: vi.fn(),
  onMerge: vi.fn(() => false),
  onMergeForward: vi.fn(() => false),
  setValue: vi.fn(),
  ...over,
});

describe('makeEditKey — Tab', () => {
  it('indents / outdents a non-code block', () => {
    const d = deps();
    makeEditKey(d)(evt('Tab') as never);
    expect(d.onIndent).toHaveBeenCalledWith('in');
    makeEditKey(d)(evt('Tab', { shiftKey: true }) as never);
    expect(d.onIndent).toHaveBeenCalledWith('out');
  });

  it('inserts two spaces at the caret in a code block (no indent)', () => {
    const d = deps({ isCode: true, value: 'ab' });
    const e = evt('Tab', {}, { selectionStart: 1, selectionEnd: 1 });
    makeEditKey(d)(e as never);
    expect(e.preventDefault).toHaveBeenCalled();
    expect(d.onIndent).not.toHaveBeenCalled();
    expect(d.setValue).toHaveBeenCalledWith('a  b');
  });

  it('replaces a selection with two spaces in a code block', () => {
    const d = deps({ isCode: true, value: 'axxb' });
    const e = evt('Tab', {}, { selectionStart: 1, selectionEnd: 3 });
    makeEditKey(d)(e as never);
    expect(d.setValue).toHaveBeenCalledWith('a  b');
  });

  it('leaves Shift+Tab in a code block to the browser (no indent, no insert)', () => {
    const d = deps({ isCode: true, value: 'ab' });
    const e = evt('Tab', { shiftKey: true }, { selectionStart: 1, selectionEnd: 1 });
    makeEditKey(d)(e as never);
    expect(d.onIndent).not.toHaveBeenCalled();
    expect(d.setValue).not.toHaveBeenCalled();
    expect(e.preventDefault).not.toHaveBeenCalled();
  });
});

describe('makeEditKey — other keys', () => {
  it('Enter delegates to onEnter and trims local value on a split', () => {
    const d = deps({ value: 'HelloWorld' });
    const e = evt('Enter', {}, { selectionStart: 5, selectionEnd: 5 });
    makeEditKey(d)(e as never);
    expect(d.onEnter).toHaveBeenCalledWith(5, 'HelloWorld');
    expect(d.setValue).toHaveBeenCalledWith('Hello');
  });

  it('Backspace on an empty block removes it', () => {
    const d = deps({ value: '' });
    makeEditKey(d)(evt('Backspace') as never);
    expect(d.onRemove).toHaveBeenCalled();
  });
});
