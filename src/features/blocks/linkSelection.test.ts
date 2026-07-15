import { describe, it, expect } from 'vitest';
import { linkSelection } from './linkSelection';

describe('linkSelection', () => {
  it('wraps the selection as a markdown link, normalizing the url', () => {
    const r = linkSelection('see docs here', 4, 8, 'example.com');
    expect(r.value).toBe('see [docs](https://example.com) here');
    expect(r.caret).toBe(4 + '[docs](https://example.com)'.length);
  });

  it('keeps an explicit scheme as-is', () => {
    expect(linkSelection('x', 0, 1, 'http://a.b').value).toBe('[x](http://a.b)');
  });

  it('uses the url as the label when there is no selection', () => {
    expect(linkSelection('', 0, 0, 'https://x.dev').value).toBe('[https://x.dev](https://x.dev)');
  });
});
