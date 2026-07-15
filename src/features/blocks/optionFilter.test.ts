import { describe, it, expect } from 'vitest';
import { filterOptions, creatableOption } from './optionFilter';

const opts = ['Todo', 'In Progress', 'Done'];

describe('filterOptions', () => {
  it('keeps every option (in order) for a blank query', () => {
    expect(filterOptions(opts, '')).toEqual(opts);
    expect(filterOptions(opts, '   ')).toEqual(opts);
  });

  it('narrows to options containing the query, case-insensitively', () => {
    expect(filterOptions(opts, 'o')).toEqual(['Todo', 'In Progress', 'Done']);
    expect(filterOptions(opts, 'do')).toEqual(['Todo', 'Done']);
    expect(filterOptions(opts, 'PROG')).toEqual(['In Progress']);
  });

  it('returns nothing when no option matches', () => {
    expect(filterOptions(opts, 'zzz')).toEqual([]);
  });
});

describe('creatableOption', () => {
  it('offers the trimmed query when it is genuinely new', () => {
    expect(creatableOption(opts, '  Blocked ')).toBe('Blocked');
  });

  it('offers nothing for a blank query', () => {
    expect(creatableOption(opts, '   ')).toBe('');
  });

  it('offers nothing when the query already exists (ignoring case + spaces)', () => {
    expect(creatableOption(opts, 'done')).toBe('');
    expect(creatableOption(opts, '  Done ')).toBe('');
  });
});
