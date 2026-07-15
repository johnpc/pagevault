import { describe, it, expect } from 'vitest';
import { filterCommands, SLASH_COMMANDS } from './slashCommands';

describe('filterCommands', () => {
  it('returns every command for an empty query', () => {
    expect(filterCommands('')).toHaveLength(SLASH_COMMANDS.length);
    expect(filterCommands('   ')).toHaveLength(SLASH_COMMANDS.length);
  });

  it('filters by label substring', () => {
    expect(filterCommands('quote').map((c) => c.type)).toEqual(['quote']);
  });

  it('filters by keyword prefix', () => {
    expect(filterCommands('task').map((c) => c.type)).toContain('todo');
  });

  it('matches headings by h1/h2 keywords', () => {
    expect(filterCommands('h1').map((c) => c.type)).toEqual(['heading']);
    expect(filterCommands('h2').map((c) => c.type)).toEqual(['subheading']);
  });

  it('returns an empty list for an unknown query', () => {
    expect(filterCommands('zzz')).toEqual([]);
  });
});
