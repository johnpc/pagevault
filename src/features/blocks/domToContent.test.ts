import { describe, it, expect } from 'vitest';
import { domToSegments, domToContent } from './domToContent';
import { contentToEditableHtml } from './wysiwygHtml';

/** Build a detached div with the given inner HTML (jsdom). */
const div = (html: string) => {
  const el = document.createElement('div');
  el.innerHTML = html;
  return el;
};

describe('domToSegments', () => {
  it('reads text and styled tags back into segments', () => {
    const el = div('see <strong>bold</strong> and <em>it</em> and <code>c</code>');
    expect(domToSegments(el)).toEqual([
      { text: 'see ' },
      { text: 'bold', bold: true },
      { text: ' and ' },
      { text: 'it', italic: true },
      { text: ' and ' },
      { text: 'c', code: true },
    ]);
  });

  it('maps browser-native B/I/S tags too', () => {
    expect(domToSegments(div('<b>x</b><i>y</i><s>z</s>'))).toEqual([
      { text: 'x', bold: true },
      { text: 'y', italic: true },
      { text: 'z', strike: true },
    ]);
  });

  it('reads mention and link spans via their data-* attributes', () => {
    const el = div('<span data-mention="p1">@Trip</span> <span data-href="https://x">docs</span>');
    expect(domToSegments(el)).toEqual([
      { text: 'Trip', mentionId: 'p1' },
      { text: ' ' },
      { text: 'docs', href: 'https://x' },
    ]);
  });

  it('turns a <br> into a newline', () => {
    expect(domToSegments(div('a<br>b'))).toEqual([{ text: 'a' }, { text: '\n' }, { text: 'b' }]);
  });
});

describe('domToContent round-trips with contentToEditableHtml', () => {
  const strings = [
    'plain text',
    'a **bold** b',
    'has *italic* and `code`',
    '~~gone~~ and __under__',
    'see @[Trip](p1) today',
    'read [docs](https://ex.com) now',
  ];
  it('content → editable HTML → DOM → content is identity', () => {
    for (const s of strings) {
      expect(domToContent(div(contentToEditableHtml(s)))).toBe(s);
    }
  });
});
