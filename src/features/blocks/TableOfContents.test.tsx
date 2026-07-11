import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { BlockRecord } from '../../lib/pbClient';
import type { BlockType } from '../../lib/pbTypes';

let blocks: BlockRecord[] = [];
vi.mock('./blocksApi', () => ({ useBlocks: () => ({ data: blocks }) }));

import { TableOfContents } from './TableOfContents';
import { blockAnchorId } from './tocData';

const b = (id: string, type: BlockType, content: string): BlockRecord =>
  ({ id, type, content }) as unknown as BlockRecord;

describe('TableOfContents', () => {
  beforeEach(() => {
    blocks = [];
    vi.restoreAllMocks();
  });

  it('shows a hint when the page has no headings', () => {
    render(<TableOfContents pageId="p1" />);
    expect(screen.getByText(/Add headings/)).toBeInTheDocument();
  });

  it('lists heading entries with indentation classes', () => {
    blocks = [b('h1', 'heading', 'Intro'), b('s1', 'subheading', 'Details')];
    render(<TableOfContents pageId="p1" />);
    expect(screen.getByRole('button', { name: 'Intro' })).toHaveClass('pv-toc-item--l1');
    expect(screen.getByRole('button', { name: 'Details' })).toHaveClass('pv-toc-item--l2');
  });

  it('scrolls to the heading anchor on click', async () => {
    blocks = [b('h1', 'heading', 'Intro')];
    const target = document.createElement('div');
    target.id = blockAnchorId('h1');
    const scroll = vi.fn();
    target.scrollIntoView = scroll;
    document.body.appendChild(target);
    render(<TableOfContents pageId="p1" />);
    await userEvent.click(screen.getByRole('button', { name: 'Intro' }));
    expect(scroll).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
    target.remove();
  });
});
