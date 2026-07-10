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
  favorite: false,
  sort: 0,
  parent: '',
  owner: 'u1',
  created: '',
  updated: '',
  collectionId: 'c',
  collectionName: 'pages',
} as PageRecord;

const props = {
  page,
  onTitle: vi.fn(),
  onIcon: vi.fn(),
  onDelete: vi.fn(),
  onToggleFavorite: vi.fn(),
  onExport: vi.fn(),
  onDuplicate: vi.fn(),
};

describe('PageHeader', () => {
  it('saves the title on blur', async () => {
    const onTitle = vi.fn();
    render(<PageHeader {...props} onTitle={onTitle} />);
    const input = screen.getByLabelText('Page title');
    await userEvent.clear(input);
    await userEvent.type(input, 'Q3 plan');
    await userEvent.tab();
    expect(onTitle).toHaveBeenCalledWith('Q3 plan');
  });

  it('picks an icon', async () => {
    const onIcon = vi.fn();
    render(<PageHeader {...props} onIcon={onIcon} />);
    await userEvent.click(screen.getByLabelText('Set icon 🚀'));
    expect(onIcon).toHaveBeenCalledWith('🚀');
  });

  it('moves the page to trash', async () => {
    const onDelete = vi.fn();
    render(<PageHeader {...props} onDelete={onDelete} />);
    await userEvent.click(screen.getByText('Move to trash'));
    expect(onDelete).toHaveBeenCalled();
  });

  it('duplicates the page', async () => {
    const onDuplicate = vi.fn();
    render(<PageHeader {...props} onDuplicate={onDuplicate} />);
    await userEvent.click(screen.getByText('Duplicate'));
    expect(onDuplicate).toHaveBeenCalled();
  });

  it('exports the page', async () => {
    const onExport = vi.fn();
    render(<PageHeader {...props} onExport={onExport} />);
    await userEvent.click(screen.getByText('Export Markdown'));
    expect(onExport).toHaveBeenCalled();
  });

  it('toggles favorite on', async () => {
    const onToggleFavorite = vi.fn();
    render(<PageHeader {...props} onToggleFavorite={onToggleFavorite} />);
    await userEvent.click(screen.getByRole('button', { name: 'Add to favorites' }));
    expect(onToggleFavorite).toHaveBeenCalledWith(true);
  });

  it('toggles favorite off when already favorited', async () => {
    const onToggleFavorite = vi.fn();
    render(
      <PageHeader
        {...props}
        page={{ ...page, favorite: true }}
        onToggleFavorite={onToggleFavorite}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Remove from favorites' }));
    expect(onToggleFavorite).toHaveBeenCalledWith(false);
  });
});
