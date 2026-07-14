import { describe, it, expect, vi } from 'vitest';
import { wrapSelection, applyFormatKey, FORMAT_MARKERS, markerFor } from './wrapSelection';

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
  it('maps b/i/e/u to bold/italic/code/underline markers', () => {
    expect(FORMAT_MARKERS).toEqual({ b: '**', i: '*', e: '`', u: '__' });
  });
});

describe('markerFor', () => {
  it('resolves plain and Shift markers, and is empty for unknown keys', () => {
    expect(markerFor('b', false)).toBe('**');
    expect(markerFor('U', false)).toBe('__'); // case-insensitive
    expect(markerFor('s', true)).toBe('~~'); // Shift+S = strikethrough
    expect(markerFor('s', false)).toBe(''); // S without Shift isn't a shortcut
    expect(markerFor('z', false)).toBe('');
  });
});

describe('applyFormatKey', () => {
  const evt = (key: string, over = {}) => ({
    key,
    metaKey: true,
    ctrlKey: false,
    shiftKey: false,
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

  it('wraps in underline for Cmd+U', () => {
    const setValue = vi.fn();
    expect(applyFormatKey(evt('u') as never, 'abc', false, setValue)).toBe(true);
    expect(setValue).toHaveBeenCalledWith('__abc__');
  });

  it('wraps in strikethrough for Cmd+Shift+S', () => {
    const setValue = vi.fn();
    expect(applyFormatKey(evt('s', { shiftKey: true }) as never, 'abc', false, setValue)).toBe(
      true,
    );
    expect(setValue).toHaveBeenCalledWith('~~abc~~');
  });

  it('does not treat plain Cmd+S (no Shift) as strikethrough', () => {
    const setValue = vi.fn();
    expect(applyFormatKey(evt('s') as never, 'abc', false, setValue)).toBe(false);
    expect(setValue).not.toHaveBeenCalled();
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
