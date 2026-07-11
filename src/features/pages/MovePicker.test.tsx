import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MovePicker } from './MovePicker';
import type { PageRecord } from '../../lib/pbClient';

const mk = (id: string, over: Partial<PageRecord> = {}): PageRecord =>
  ({
    id,
    title: id,
    icon: '',
    archived: false,
    favorite: false,
    cover: '',
    sort: 0,
    parent: '',
    owner: 'u1',
    created: '',
    updated: '',
    collectionId: 'c',
    collectionName: 'pages',
    ...over,
  }) as PageRecord;

// a > b ; c separate
const pages = [mk('a'), mk('b', { parent: 'a' }), mk('c')];

describe('MovePicker', () => {
  it('offers Top level plus valid targets (not self or descendants)', () => {
    render(<MovePicker page={pages[0]} pages={pages} onMove={vi.fn()} />);
    const options = screen.getAllByRole('option').map((o) => o.textContent);
    expect(options[0]).toBe('Top level');
    // Moving "a": b is a descendant (excluded), only c is a valid target.
    expect(options.some((o) => o?.includes('c'))).toBe(true);
    expect(options.some((o) => o?.includes('b'))).toBe(false);
  });

  it('calls onMove with the chosen parent id', async () => {
    const onMove = vi.fn();
    render(<MovePicker page={pages[2]} pages={pages} onMove={onMove} />);
    await userEvent.selectOptions(screen.getByLabelText('Move page under'), 'a');
    expect(onMove).toHaveBeenCalledWith('a');
  });

  it('reflects the current parent', () => {
    render(<MovePicker page={pages[1]} pages={pages} onMove={vi.fn()} />);
    expect(screen.getByLabelText('Move page under')).toHaveValue('a');
  });
});
