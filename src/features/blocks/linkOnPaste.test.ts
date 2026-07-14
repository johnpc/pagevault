import { describe, it, expect } from 'vitest';
import { linkOnPaste } from './linkOnPaste';

describe('linkOnPaste', () => {
  it('wraps a selection as a markdown link when a URL is pasted over it', () => {
    // "click here" selected in "see click here now", paste https://ex.com
    const value = 'see click here now';
    const r = linkOnPaste(value, 4, 14, 'https://ex.com');
    expect(r).toEqual({
      value: 'see [click here](https://ex.com) now',
      caret: 4 + '[click here](https://ex.com)'.length,
    });
  });

  it('trims surrounding whitespace from the pasted URL', () => {
    const r = linkOnPaste('word', 0, 4, '  https://ex.com/x  ');
    expect(r?.value).toBe('[word](https://ex.com/x)');
  });

  it('returns null when there is no selection (caret only)', () => {
    expect(linkOnPaste('word', 2, 2, 'https://ex.com')).toBeNull();
  });

  it('returns null when the pasted text is not a lone URL', () => {
    expect(linkOnPaste('word', 0, 4, 'not a url')).toBeNull();
    expect(linkOnPaste('word', 0, 4, 'https://ex.com and more')).toBeNull();
    expect(linkOnPaste('word', 0, 4, 'ftp://ex.com')).toBeNull();
  });
});
