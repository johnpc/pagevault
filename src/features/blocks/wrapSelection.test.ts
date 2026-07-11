import { describe, it, expect, vi } from 'vitest';
import { wrapSelection, applyFormatKey, FORMAT_MARKERS } from './wrapSelection';

describe('wrapSelection', () => {
  it('wraps a selection and returns the shifted selection range', () => {
    const r = wrapSelection('hello world', 6, 11, '**');
    expect(r.value).toBe('hello **world**');
    expect([r.start, r.end]).toEqual([8, 13]);
  });

  it('inserts an empty pair with the caret between when nothing is selected', () => {
    const r = wrapSelection('ab', 1, 1, '`');
    expect(r.value).toBe('a``b');
    expect([r.start, r.end]).toEqual([2, 2]);
  });
});

describe('FORMAT_MARKERS', () => {
  it('maps b/i/e to bold/italic/code markers', () => {
    expect(FORMAT_MARKERS).toEqual({ b: '**', i: '*', e: '`' });
  });
});

describe('applyFormatKey', () => {
  const evt = (key: string, over = {}) => ({
    key,
    metaKey: true,
    ctrlKey: false,
    preventDefault: vi.fn(),
    currentTarget: { selectionStart: 0, selectionEnd: 3, setSelectionRange: vi.fn() },
    ...over,
  });

  it('wraps the selection for Cmd+B and reports handled', () => {
    const setValue = vi.fn();
    const e = evt('b');
    expect(applyFormatKey(e as never, 'abc', false, setValue)).toBe(true);
    expect(e.preventDefault).toHaveBeenCalled();
    expect(setValue).toHaveBeenCalledWith('**abc**');
  });

  it('is a no-op without a modifier key', () => {
    const setValue = vi.fn();
    expect(applyFormatKey(evt('b', { metaKey: false }) as never, 'abc', false, setValue)).toBe(
      false,
    );
    expect(setValue).not.toHaveBeenCalled();
  });

  it('is a no-op for a non-format key', () => {
    const setValue = vi.fn();
    expect(applyFormatKey(evt('z') as never, 'abc', false, setValue)).toBe(false);
  });

  it('is skipped inside a code block', () => {
    const setValue = vi.fn();
    expect(applyFormatKey(evt('b') as never, 'abc', true, setValue)).toBe(false);
    expect(setValue).not.toHaveBeenCalled();
  });
});
