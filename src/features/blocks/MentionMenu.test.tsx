import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MentionMenu } from './MentionMenu';
import type { MentionItem } from './useMention';
import type { PageRecord } from '../../lib/pbClient';

const page = (id: string, title: string, icon = ''): MentionItem => ({
  kind: 'page',
  page: { id, title, icon, archived: false } as PageRecord,
});
const date = (key: string, label: string, insert: string): MentionItem => ({
  kind: 'date',
  date: { key, label, insert },
});

describe('MentionMenu', () => {
  it('renders nothing when there are no items', () => {
    const { container } = render(<MentionMenu items={[]} active={0} onPick={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('lists items and marks the active one', () => {
    render(
      <MentionMenu items={[page('1', 'Trip'), page('2', 'Notes')]} active={1} onPick={vi.fn()} />,
    );
    const opts = screen.getAllByRole('option');
    expect(opts).toHaveLength(2);
    expect(opts[1]).toHaveAttribute('aria-selected', 'true');
  });

  it('picks a page item on mousedown', () => {
    const onPick = vi.fn();
    render(<MentionMenu items={[page('1', 'Trip')]} active={0} onPick={onPick} />);
    fireEvent.mouseDown(screen.getByRole('option', { name: /Trip/ }));
    expect(onPick).toHaveBeenCalledWith(expect.objectContaining({ kind: 'page' }));
  });

  it('renders a date mention with its label and 📅 icon, and picks it', () => {
    const onPick = vi.fn();
    render(
      <MentionMenu items={[date('today', 'Today', 'Jul 14, 2026')]} active={0} onPick={onPick} />,
    );
    expect(screen.getByText('Today')).toBeInTheDocument();
    expect(screen.getByText('📅')).toBeInTheDocument();
    fireEvent.mouseDown(screen.getByRole('option', { name: /Today/ }));
    expect(onPick).toHaveBeenCalledWith(expect.objectContaining({ kind: 'date' }));
  });

  it('falls back to Untitled + default icon for a titleless page', () => {
    render(<MentionMenu items={[page('1', '')]} active={0} onPick={vi.fn()} />);
    expect(screen.getByText('Untitled')).toBeInTheDocument();
    expect(screen.getByText('📄')).toBeInTheDocument();
  });
});
