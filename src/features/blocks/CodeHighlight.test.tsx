import { describe, it, expect, vi } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { CodeHighlight } from './CodeHighlight';

vi.mock('./highlightCode', () => ({
  highlightCode: (code: string, lang: string) =>
    Promise.resolve(lang ? `<span class="hljs-keyword">${code}</span>` : null),
}));

describe('CodeHighlight', () => {
  it('renders plain code until highlighting resolves, then the highlighted HTML', async () => {
    const { container } = render(<CodeHighlight code="const x" lang="js" />);
    // Plain text first (no spans).
    expect(container.querySelector('span.hljs-keyword')).toBeNull();
    await waitFor(() => expect(container.querySelector('span.hljs-keyword')).not.toBeNull());
    expect(container.querySelector('code')?.textContent).toContain('const x');
  });

  it('stays plain text for an unknown/plain language', async () => {
    const { container } = render(<CodeHighlight code="hello" lang="" />);
    await waitFor(() => expect(container.querySelector('code')?.textContent).toBe('hello'));
    expect(container.querySelector('span.hljs-keyword')).toBeNull();
  });

  it('keeps the last line height by padding a trailing newline', () => {
    const { container } = render(<CodeHighlight code={'a\n'} lang="" />);
    // The rendered plain text appends a space after a trailing newline.
    expect(container.querySelector('code')?.textContent).toBe('a\n ');
  });
});
