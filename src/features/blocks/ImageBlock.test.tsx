import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ImageBlock } from './ImageBlock';
import type { BlockRecord } from '../../lib/pbClient';

const mk = (content: string): BlockRecord =>
  ({
    id: 'b1',
    page: 'p1',
    type: 'image',
    content,
    checked: false,
    sort: 0,
    owner: 'u1',
    created: '',
    updated: '',
    collectionId: 'c',
    collectionName: 'blocks',
  }) as BlockRecord;

describe('ImageBlock', () => {
  it('shows a URL input when empty and saves the entered URL', async () => {
    const onEdit = vi.fn();
    render(<ImageBlock block={mk('')} onEdit={onEdit} />);
    const input = screen.getByLabelText('Image URL');
    await userEvent.type(input, 'https://example.com/pic.png');
    await userEvent.tab();
    expect(onEdit).toHaveBeenCalledWith('b1', { content: 'https://example.com/pic.png' });
  });

  it('renders the image when a URL is set', () => {
    render(<ImageBlock block={mk('https://example.com/pic.png')} onEdit={vi.fn()} />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'https://example.com/pic.png');
  });

  it('re-opens the URL input when the image is clicked', async () => {
    render(<ImageBlock block={mk('https://example.com/pic.png')} onEdit={vi.fn()} />);
    await userEvent.click(screen.getByRole('img'));
    expect(screen.getByLabelText('Image URL')).toBeInTheDocument();
  });
});
