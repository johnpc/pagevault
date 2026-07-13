import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EmbedBlock } from './EmbedBlock';
import type { BlockRecord } from '../../lib/pbClient';

const mk = (content: string): BlockRecord =>
  ({ id: 'b1', type: 'embed', content }) as unknown as BlockRecord;

describe('EmbedBlock', () => {
  it('shows a URL input when empty and saves the pasted URL', async () => {
    const onEdit = vi.fn();
    render(<EmbedBlock block={mk('')} onEdit={onEdit} />);
    await userEvent.type(screen.getByLabelText('Embed URL'), 'https://x/v.mp4');
    await userEvent.tab();
    expect(onEdit).toHaveBeenCalledWith('b1', { content: 'https://x/v.mp4' });
  });

  it('renders a native video for a direct media file', () => {
    const { container } = render(<EmbedBlock block={mk('https://x/v.mp4')} onEdit={vi.fn()} />);
    const video = container.querySelector('video');
    expect(video).toHaveAttribute('src', 'https://x/v.mp4');
  });

  it('renders an iframe with the YouTube embed URL', () => {
    const { container } = render(
      <EmbedBlock block={mk('https://youtu.be/abc')} onEdit={vi.fn()} />,
    );
    expect(container.querySelector('iframe')).toHaveAttribute(
      'src',
      'https://www.youtube.com/embed/abc',
    );
  });

  it('shows the URL input for an unrecognized link', () => {
    render(<EmbedBlock block={mk('https://example.com/post')} onEdit={vi.fn()} />);
    expect(screen.getByLabelText('Embed URL')).toBeInTheDocument();
  });

  it('re-opens the editor from a rendered embed', async () => {
    render(<EmbedBlock block={mk('https://x/v.mp4')} onEdit={vi.fn()} />);
    expect(screen.queryByLabelText('Embed URL')).not.toBeInTheDocument();
    await userEvent.click(screen.getByLabelText('Edit embed'));
    expect(screen.getByLabelText('Embed URL')).toBeInTheDocument();
  });
});
