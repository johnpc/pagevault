import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QuickFindResult } from './QuickFindResult';
import type { SearchResult } from './searchResults';

const result: SearchResult = {
  pageId: 'p1',
  title: 'Roadmap',
  icon: '📄',
  snippet: 'ship the roadmap',
  kind: 'block',
};

describe('QuickFindResult', () => {
  it('renders the title + snippet and opens its page on click', async () => {
    const onOpen = vi.fn();
    render(<QuickFindResult result={result} query="road" active={false} onOpen={onOpen} />);
    expect(screen.getByRole('option')).toHaveTextContent('Roadmap');
    expect(screen.getByRole('option')).toHaveTextContent('ship the roadmap');
    await userEvent.click(screen.getByRole('option'));
    expect(onOpen).toHaveBeenCalledWith('p1');
  });

  it('marks itself selected and scrolls into view when active', () => {
    const spy = vi.spyOn(Element.prototype, 'scrollIntoView');
    render(<QuickFindResult result={result} query="road" active onOpen={vi.fn()} />);
    expect(screen.getByRole('option')).toHaveAttribute('aria-selected', 'true');
    expect(spy).toHaveBeenCalledWith({ block: 'nearest' });
    spy.mockRestore();
  });

  it('does not scroll into view while inactive', () => {
    const spy = vi.spyOn(Element.prototype, 'scrollIntoView');
    render(<QuickFindResult result={result} query="road" active={false} onOpen={vi.fn()} />);
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});
