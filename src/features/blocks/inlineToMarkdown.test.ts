import { describe, it, expect } from 'vitest';
import { inlineToMarkdown } from './inlineToMarkdown';

describe('inlineToMarkdown', () => {
  it('rewrites a page mention token to a relative Markdown link', () => {
    expect(inlineToMarkdown('see @[Trip plan](abc123) today')).toBe(
      'see [Trip plan](/page/abc123) today',
    );
  });

  it('rewrites every mention in the line', () => {
    expect(inlineToMarkdown('@[A](1) and @[B](2)')).toBe('[A](/page/1) and [B](/page/2)');
  });

  it('leaves ordinary text and standard markdown untouched', () => {
    expect(inlineToMarkdown('**bold** and [link](https://x)')).toBe(
      '**bold** and [link](https://x)',
    );
    expect(inlineToMarkdown('no tokens here')).toBe('no tokens here');
  });
});
