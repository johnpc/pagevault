import { describe, it, expect } from 'vitest';
import { removeColumnOption } from './tableColumnOptions';
import type { TableData } from '../../lib/pbTypes';

const multi = (): TableData => ({
  columns: [{ name: 'Tags', type: 'multiselect', options: ['Red', 'Blue'] }],
  rows: [['Red,Blue'], ['Blue'], ['']],
});
const single = (): TableData => ({
  columns: [{ name: 'Status', type: 'select', options: ['Open', 'Done'] }],
  rows: [['Open'], ['Done'], ['']],
});

describe('removeColumnOption', () => {
  it('drops the option from a multiselect column AND strips it from every cell', () => {
    const next = removeColumnOption(multi(), 0, 'Red');
    expect(next.columns[0].options).toEqual(['Blue']);
    expect(next.rows.map((r) => r[0])).toEqual(['Blue', 'Blue', '']);
  });

  it('clears select cells equal to the removed option', () => {
    const next = removeColumnOption(single(), 0, 'Open');
    expect(next.columns[0].options).toEqual(['Done']);
    expect(next.rows.map((r) => r[0])).toEqual(['', 'Done', '']);
  });

  it('is a no-op for an unknown option or a non-(multi)select column', () => {
    const base = multi();
    expect(removeColumnOption(base, 0, 'Nope')).toBe(base);
    const text: TableData = { columns: [{ name: 'A', type: 'text' }], rows: [['x']] };
    expect(removeColumnOption(text, 0, 'x')).toBe(text);
  });
});
