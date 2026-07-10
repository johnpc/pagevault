import { describe, it, expect } from 'vitest';
import { slashMatches, SLASH_COMMANDS } from './slashCommands';

describe('slashMatches', () => {
  it('returns null when the value is not a slash query', () => {
    expect(slashMatches('hello')).toBeNull();
    expect(slashMatches('')).toBeNull();
  });

  it('returns every command for a bare slash', () => {
    expect(slashMatches('/')).toHaveLength(SLASH_COMMANDS.length);
  });

  it('filters by label substring', () => {
    const matches = slashMatches('/quote');
    expect(matches?.map((c) => c.type)).toEqual(['quote']);
  });

  it('filters by keyword prefix', () => {
    const matches = slashMatches('/task');
    expect(matches?.map((c) => c.type)).toContain('todo');
  });

  it('matches headings by h1/h2 keywords', () => {
    expect(slashMatches('/h1')?.map((c) => c.type)).toEqual(['heading']);
    expect(slashMatches('/h2')?.map((c) => c.type)).toEqual(['subheading']);
  });

  it('returns an empty list for an unknown query', () => {
    expect(slashMatches('/zzz')).toEqual([]);
  });
});
