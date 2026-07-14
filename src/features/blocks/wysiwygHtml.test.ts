import { describe, it, expect } from 'vitest';
import { contentToEditableHtml } from './wysiwygHtml';

describe('contentToEditableHtml', () => {
  it('is empty for empty content (browser shows the placeholder)', () => {
    expect(contentToEditableHtml('')).toBe('');
  });

  it('wraps each mark in the matching editable inline tag', () => {
    expect(contentToEditableHtml('**b**')).toBe('<strong>b</strong>');
    expect(contentToEditableHtml('*i*')).toBe('<em>i</em>');
    expect(contentToEditableHtml('`c`')).toBe('<code>c</code>');
    expect(contentToEditableHtml('~~s~~')).toBe('<del>s</del>');
    expect(contentToEditableHtml('__u__')).toBe('<u>u</u>');
  });

  it('renders a mention as an editable styled span carrying its page id', () => {
    expect(contentToEditableHtml('@[Trip](p1)')).toBe(
      '<span class="pv-w-mention" data-mention="p1">@Trip</span>',
    );
  });

  it('renders a safe link as a styled span with its href in data-href', () => {
    expect(contentToEditableHtml('[docs](https://ex.com)')).toBe(
      '<span class="pv-w-link" data-href="https://ex.com">docs</span>',
    );
  });

  it('drops an unsafe link href (javascript:) to a plain span (XSS guard)', () => {
    expect(contentToEditableHtml('[x](javascript:alert(1))')).toBe('<span>x</span>');
  });

  it('escapes HTML special characters in text so content can never inject markup', () => {
    expect(contentToEditableHtml('a <b> & "c"')).toBe(
      '<span>a &lt;b&gt; &amp; &quot;c&quot;</span>',
    );
  });

  it('concatenates mixed segments in order', () => {
    expect(contentToEditableHtml('see **bold** ok')).toBe(
      '<span>see </span><strong>bold</strong><span> ok</span>',
    );
  });
});
