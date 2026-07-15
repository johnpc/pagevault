import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { createRef } from 'react';
import { BlockPreview } from './BlockPreview';

const renderPreview = (value: string) => {
  const onEdit = vi.fn();
  const ref = createRef<HTMLTextAreaElement>();
  render(
    <MemoryRouter>
      <BlockPreview value={value} onEdit={onEdit} inputRef={ref} />
    </MemoryRouter>,
  );
  return { onEdit };
};

describe('BlockPreview', () => {
  it('clicking the text enters edit mode', async () => {
    const { onEdit } = renderPreview('plain **bold** text');
    await userEvent.click(screen.getByText('bold'));
    // clicking the bold <strong> (not a link) still edits
    expect(onEdit).toHaveBeenCalled();
  });

  it('clicking a rendered external link does NOT enter edit mode (it navigates)', async () => {
    const { onEdit } = renderPreview('see [docs](https://example.com)');
    await userEvent.click(screen.getByRole('link', { name: 'docs' }));
    expect(onEdit).not.toHaveBeenCalled();
  });

  it('clicking an @mention link does NOT enter edit mode', async () => {
    const { onEdit } = renderPreview('ping @[Roadmap](page123)');
    await userEvent.click(screen.getByRole('link', { name: '@Roadmap' }));
    expect(onEdit).not.toHaveBeenCalled();
  });

  it('Enter and Space on the preview enter edit mode', async () => {
    const { onEdit } = renderPreview('**bold**');
    const preview = screen.getByRole('button');
    preview.focus();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    expect(onEdit).toHaveBeenCalledTimes(2);
  });
});
