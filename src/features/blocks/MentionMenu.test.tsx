import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MentionMenu } from './MentionMenu';
import type { PageRecord } from '../../lib/pbClient';

const pg = (id: string, title: string, icon = ''): PageRecord =>
  ({ id, title, icon, archived: false }) as PageRecord;

describe('MentionMenu', () => {
  it('renders nothing when there are no pages', () => {
    const { container } = render(<MentionMenu pages={[]} active={0} onPick={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('lists pages and marks the active one', () => {
    render(<MentionMenu pages={[pg('1', 'Trip'), pg('2', 'Notes')]} active={1} onPick={vi.fn()} />);
    const opts = screen.getAllByRole('option');
    expect(opts).toHaveLength(2);
    expect(opts[1]).toHaveAttribute('aria-selected', 'true');
  });

  it('picks a page on mousedown', () => {
    const onPick = vi.fn();
    render(<MentionMenu pages={[pg('1', 'Trip')]} active={0} onPick={onPick} />);
    fireEvent.mouseDown(screen.getByRole('option', { name: /Trip/ }));
    expect(onPick).toHaveBeenCalledWith(expect.objectContaining({ id: '1' }));
  });

  it('falls back to Untitled + default icon', () => {
    render(<MentionMenu pages={[pg('1', '')]} active={0} onPick={vi.fn()} />);
    expect(screen.getByText('Untitled')).toBeInTheDocument();
    expect(screen.getByText('📄')).toBeInTheDocument();
  });
});
