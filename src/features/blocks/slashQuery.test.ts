import { describe, it, expect } from 'vitest';
import { slashQuery } from './slashQuery';

describe('slashQuery', () => {
  it('detects a slash at the start of the block', () => {
    expect(slashQuery('/', 1)).toEqual({ query: '', start: 0, end: 1 });
    expect(slashQuery('/quo', 4)).toEqual({ query: 'quo', start: 0, end: 4 });
  });

  it('detects a slash MID-LINE after whitespace', () => {
    expect(slashQuery('hello /quo', 10)).toEqual({ query: 'quo', start: 6, end: 10 });
  });

  it('returns null when there is no slash before the caret', () => {
    expect(slashQuery('hello', 5)).toBeNull();
  });

  it('does not fire inside a URL (slash not preceded by whitespace)', () => {
    expect(slashQuery('http://x', 7)).toBeNull();
    expect(slashQuery('a/b', 3)).toBeNull();
  });

  it('ends the query at a space after the slash', () => {
    expect(slashQuery('/quote then more', 16)).toBeNull();
  });

  it('uses the slash nearest the caret', () => {
    // caret is right after the second slash → empty query starting there.
    expect(slashQuery('one /two /', 10)).toEqual({ query: '', start: 9, end: 10 });
  });

  it('only considers text before the caret', () => {
    expect(slashQuery('/quote', 3)).toEqual({ query: 'qu', start: 0, end: 3 });
  });
});
