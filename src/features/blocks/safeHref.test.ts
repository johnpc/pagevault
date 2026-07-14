import { describe, it, expect } from 'vitest';
import { safeHref } from './safeHref';

describe('safeHref', () => {
  it('allows http, https, mailto and tel', () => {
    expect(safeHref('https://ex.com')).toBe('https://ex.com');
    expect(safeHref('http://ex.com/x')).toBe('http://ex.com/x');
    expect(safeHref('mailto:a@b.com')).toBe('mailto:a@b.com');
    expect(safeHref('tel:+15551234')).toBe('tel:+15551234');
  });

  it('allows schemeless, relative, anchor and query URLs', () => {
    expect(safeHref('example.com/x')).toBe('example.com/x');
    expect(safeHref('/page/1')).toBe('/page/1');
    expect(safeHref('#section')).toBe('#section');
    expect(safeHref('?q=1')).toBe('?q=1');
  });

  it('rejects javascript:, data: and vbscript: (XSS vectors)', () => {
    expect(safeHref('javascript:alert(1)')).toBeNull();
    expect(safeHref('JavaScript:alert(1)')).toBeNull(); // case-insensitive
    expect(safeHref('  javascript:alert(1)')).toBeNull(); // leading whitespace
    expect(safeHref('data:text/html,<script>alert(1)</script>')).toBeNull();
    expect(safeHref('vbscript:msgbox(1)')).toBeNull();
  });

  it('is null for an empty/whitespace URL', () => {
    expect(safeHref('')).toBeNull();
    expect(safeHref('   ')).toBeNull();
  });
});
