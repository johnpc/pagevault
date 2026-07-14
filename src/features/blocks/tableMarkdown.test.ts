import { describe, it, expect } from 'vitest';
import { gfmCell, tableToMarkdown } from './tableMarkdown';
import type { TableData } from '../../lib/pbTypes';

describe('gfmCell', () => {
  it('escapes a pipe so it does not start a new column', () => {
    expect(gfmCell('a|b')).toBe('a\\|b');
  });
  it('turns newlines into <br> so they do not break the row', () => {
    expect(gfmCell('line1\nline2')).toBe('line1<br>line2');
    expect(gfmCell('crlf\r\nhere')).toBe('crlf<br>here');
  });
  it('escapes backslashes before pipes (no double-unescape)', () => {
    expect(gfmCell('a\\b')).toBe('a\\\\b');
  });
  it('leaves ordinary text untouched', () => {
    expect(gfmCell('plain text 42')).toBe('plain text 42');
  });
});

describe('tableToMarkdown', () => {
  it('escapes pipes and newlines in cells and headers (no corruption)', () => {
    const data = {
      columns: [
        { name: 'a|b', type: 'text' },
        { name: 'notes', type: 'text' },
      ],
      rows: [['x|y', 'line1\nline2']],
    } as unknown as TableData;
    expect(tableToMarkdown(data)).toBe(
      '| a\\|b | notes |\n| --- | --- |\n| x\\|y | line1<br>line2 |',
    );
  });
});
