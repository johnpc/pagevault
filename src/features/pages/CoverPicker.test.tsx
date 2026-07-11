import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { PageRecord } from '../../lib/pbClient';

vi.mock('../../lib/pbClient', () => ({
  pb: { files: { getURL: (_r: unknown, f: string) => `https://pb.local/files/${f}` } },
}));

import { CoverPicker } from './CoverPicker';

const pg = (over: Partial<PageRecord> = {}): PageRecord =>
  ({ id: 'p1', cover: '', coverImage: '', ...over }) as PageRecord;

describe('CoverPicker', () => {
  it('renders no strip when no cover is set', () => {
    render(<CoverPicker page={pg()} onCover={vi.fn()} onUpload={vi.fn()} />);
    expect(screen.queryByTestId('cover-strip')).not.toBeInTheDocument();
  });

  it('renders the gradient strip when a gradient cover is set', () => {
    render(<CoverPicker page={pg({ cover: 'ocean' })} onCover={vi.fn()} onUpload={vi.fn()} />);
    expect(screen.getByTestId('cover-strip')).toBeInTheDocument();
  });

  it('renders a cover strip for an uploaded image (URL resolution is covered in coverSource)', () => {
    render(
      <CoverPicker page={pg({ coverImage: 'banner.png' })} onCover={vi.fn()} onUpload={vi.fn()} />,
    );
    // jsdom won't reflect a background:url() shorthand in .style; the served-URL
    // resolution itself is asserted in coverSource.test. Here we just confirm the
    // strip renders for an uploaded image (not only for gradients).
    expect(screen.getByTestId('cover-strip')).toBeInTheDocument();
  });

  it('picks a cover on swatch click', async () => {
    const onCover = vi.fn();
    render(<CoverPicker page={pg()} onCover={onCover} onUpload={vi.fn()} />);
    await userEvent.click(screen.getByLabelText('Cover Ocean'));
    expect(onCover).toHaveBeenCalledWith('ocean');
  });

  it('clears the cover when the active swatch is clicked again', async () => {
    const onCover = vi.fn();
    render(<CoverPicker page={pg({ cover: 'ocean' })} onCover={onCover} onUpload={vi.fn()} />);
    await userEvent.click(screen.getByLabelText('Cover Ocean'));
    expect(onCover).toHaveBeenCalledWith('');
  });

  it('uploads a chosen cover file', async () => {
    const onUpload = vi.fn();
    render(<CoverPicker page={pg()} onCover={vi.fn()} onUpload={onUpload} />);
    const file = new File(['x'], 'banner.png', { type: 'image/png' });
    await userEvent.upload(screen.getByLabelText('Upload cover image'), file);
    expect(onUpload).toHaveBeenCalledWith(file);
  });
});
