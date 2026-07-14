import { describe, it, expect, vi } from 'vitest';

// Mock the lazy highlight.js/lib/common import with a tiny stub.
vi.mock('highlight.js/lib/common', () => ({
  default: {
    getLanguage: (l: string) => (l === 'js' || l === 'python' ? {} : undefined),
    highlight: (code: string, { language }: { language: string }) => ({
      value: `<span class="hljs-lang-${language}">${code}</span>`,
    }),
  },
}));

import { highlightCode } from './highlightCode';

describe('highlightCode', () => {
  it('returns highlighted HTML for a known language', async () => {
    const html = await highlightCode('const x = 1', 'js');
    expect(html).toBe('<span class="hljs-lang-js">const x = 1</span>');
  });

  it('returns null for an empty language (plain text)', async () => {
    expect(await highlightCode('const x = 1', '')).toBeNull();
  });

  it('returns null for empty code', async () => {
    expect(await highlightCode('', 'js')).toBeNull();
  });

  it('returns null for a language not in the common bundle', async () => {
    expect(await highlightCode('x', 'brainfuck')).toBeNull();
  });
});
