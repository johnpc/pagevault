import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ImageBlock } from './ImageBlock';
import type { BlockRecord } from '../../lib/pbClient';

vi.mock('../../lib/pbClient', () => ({
  pb: { files: { getURL: (_r: unknown, f: string) => `https://pb.local/files/${f}` } },
}));

const mk = (over: Partial<BlockRecord> = {}): BlockRecord =>
  ({
    id: 'b1',
    page: 'p1',
    type: 'image',
    content: '',
    file: '',
    checked: false,
    collapsed: false,
    sort: 0,
    owner: 'u1',
    created: '',
    updated: '',
    collectionId: 'c',
    collectionName: 'blocks',
    ...over,
  }) as BlockRecord;

describe('ImageBlock', () => {
  it('shows a URL input when empty and saves the entered URL', async () => {
    const onEdit = vi.fn();
    render(<ImageBlock block={mk()} onEdit={onEdit} onUpload={vi.fn()} />);
    const input = screen.getByLabelText('Image URL');
    await userEvent.type(input, 'https://example.com/pic.png');
    await userEvent.tab();
    expect(onEdit).toHaveBeenCalledWith('b1', { content: 'https://example.com/pic.png' });
  });

  it('renders the image when a URL is set', () => {
    render(
      <ImageBlock
        block={mk({ content: 'https://example.com/pic.png' })}
        onEdit={vi.fn()}
        onUpload={vi.fn()}
      />,
    );
    expect(screen.getByRole('img')).toHaveAttribute('src', 'https://example.com/pic.png');
  });

  it('renders an uploaded file via the served file URL', () => {
    render(<ImageBlock block={mk({ file: 'photo.png' })} onEdit={vi.fn()} onUpload={vi.fn()} />);
    expect(screen.getByRole('img')).toHaveAttribute('src', 'https://pb.local/files/photo.png');
  });

  it('re-opens the editor when the image is clicked', async () => {
    render(
      <ImageBlock
        block={mk({ content: 'https://example.com/pic.png' })}
        onEdit={vi.fn()}
        onUpload={vi.fn()}
      />,
    );
    await userEvent.click(screen.getByRole('img'));
    expect(screen.getByLabelText('Image URL')).toBeInTheDocument();
  });

  it('uploads a picked file', async () => {
    const onUpload = vi.fn();
    render(<ImageBlock block={mk()} onEdit={vi.fn()} onUpload={onUpload} />);
    const file = new File(['x'], 'cat.png', { type: 'image/png' });
    await userEvent.upload(screen.getByLabelText('Upload image file'), file);
    expect(onUpload).toHaveBeenCalledWith('b1', file);
  });
});
