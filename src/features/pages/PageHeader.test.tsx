import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PageHeader } from './PageHeader';
import type { PageRecord } from '../../lib/pbClient';

const page = {
  id: 'p1',
  title: 'Roadmap',
  icon: '📄',
  archived: false,
  sort: 0,
  parent: '',
  owner: 'u1',
  created: '',
  updated: '',
  collectionId: 'c',
  collectionName: 'pages',
} as PageRecord;

describe('PageHeader', () => {
  it('saves the title on blur', async () => {
    const onTitle = vi.fn();
    render(<PageHeader page={page} onTitle={onTitle} onIcon={vi.fn()} onDelete={vi.fn()} />);
    const input = screen.getByLabelText('Page title');
    await userEvent.clear(input);
    await userEvent.type(input, 'Q3 plan');
    await userEvent.tab();
    expect(onTitle).toHaveBeenCalledWith('Q3 plan');
  });

  it('picks an icon', async () => {
    const onIcon = vi.fn();
    render(<PageHeader page={page} onTitle={vi.fn()} onIcon={onIcon} onDelete={vi.fn()} />);
    await userEvent.click(screen.getByLabelText('Set icon 🚀'));
    expect(onIcon).toHaveBeenCalledWith('🚀');
  });

  it('deletes the page', async () => {
    const onDelete = vi.fn();
    render(<PageHeader page={page} onTitle={vi.fn()} onIcon={vi.fn()} onDelete={onDelete} />);
    await userEvent.click(screen.getByText('Delete page'));
    expect(onDelete).toHaveBeenCalled();
  });
});
