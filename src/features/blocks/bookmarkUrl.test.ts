import { describe, it, expect } from 'vitest';
import { normalizeUrl, urlDomain } from './bookmarkUrl';

describe('normalizeUrl', () => {
  it('prepends https:// when no scheme is given', () => {
    expect(normalizeUrl('notion.so')).toBe('https://notion.so');
    expect(normalizeUrl('  example.com/x ')).toBe('https://example.com/x');
  });

  it('leaves an existing scheme intact', () => {
    expect(normalizeUrl('http://foo.dev')).toBe('http://foo.dev');
    expect(normalizeUrl('https://a.b')).toBe('https://a.b');
  });

  it('is empty for blank input', () => {
    expect(normalizeUrl('   ')).toBe('');
  });
});

describe('urlDomain', () => {
  it('returns the host without a leading www.', () => {
    expect(urlDomain('https://www.notion.so/page')).toBe('notion.so');
    expect(urlDomain('example.com/x')).toBe('example.com');
  });

  it('falls back to the raw string when unparseable', () => {
    expect(urlDomain('::::')).toBe('::::');
  });
});
