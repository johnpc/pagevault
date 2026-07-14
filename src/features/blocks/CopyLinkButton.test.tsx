import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const toasts: string[] = [];
vi.mock('../shell/toastBus', () => ({ showToast: (m: string) => toasts.push(m) }));

import { CopyLinkButton } from './CopyLinkButton';

describe('CopyLinkButton', () => {
  beforeEach(() => {
    toasts.length = 0;
  });

  it('copies the block deep link and toasts on success', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    render(<CopyLinkButton pageId="pageA" blockId="blk1" />);
    await userEvent.click(screen.getByLabelText('Copy link to block'));
    await waitFor(() =>
      expect(writeText).toHaveBeenCalledWith(`${window.location.origin}/page/pageA#pv-block-blk1`),
    );
    expect(toasts).toContain('Link to block copied.');
  });

  it('toasts a failure when the clipboard is unavailable', async () => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockRejectedValue(new Error('x')) },
    });
    render(<CopyLinkButton pageId="p" blockId="b" />);
    await userEvent.click(screen.getByLabelText('Copy link to block'));
    await waitFor(() => expect(toasts).toContain('Could not copy the link.'));
  });
});
