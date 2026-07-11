import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { CopyButton } from './CopyButton';

describe('CopyButton', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('copies the text and shows "Copied!"', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    render(<CopyButton text="const x = 1" />);
    fireEvent.click(screen.getByRole('button', { name: 'Copy code' }));
    expect(writeText).toHaveBeenCalledWith('const x = 1');
    await waitFor(() => expect(screen.getByRole('button')).toHaveTextContent('Copied!'));
  });

  it('does not throw when the clipboard write fails', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('no clipboard'));
    Object.assign(navigator, { clipboard: { writeText } });
    render(<CopyButton text="x" />);
    fireEvent.click(screen.getByRole('button', { name: 'Copy code' }));
    // The rejection is swallowed; the label stays 'Copy'.
    await waitFor(() => expect(writeText).toHaveBeenCalled());
    expect(screen.getByRole('button')).toHaveTextContent('Copy');
  });
});
