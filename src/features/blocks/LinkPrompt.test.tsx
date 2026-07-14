import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LinkPrompt } from './LinkPrompt';

describe('LinkPrompt', () => {
  it('submits the typed URL on Enter', async () => {
    const onSubmit = vi.fn();
    render(<LinkPrompt onSubmit={onSubmit} onCancel={vi.fn()} />);
    await userEvent.type(screen.getByLabelText('Link URL'), 'example.com{Enter}');
    expect(onSubmit).toHaveBeenCalledWith('example.com');
  });

  it('submits via the ✓ button', async () => {
    const onSubmit = vi.fn();
    render(<LinkPrompt onSubmit={onSubmit} onCancel={vi.fn()} />);
    await userEvent.type(screen.getByLabelText('Link URL'), 'https://x.dev');
    await userEvent.click(screen.getByLabelText('Apply link'));
    expect(onSubmit).toHaveBeenCalledWith('https://x.dev');
  });

  it('cancels on Escape', async () => {
    const onCancel = vi.fn();
    render(<LinkPrompt onSubmit={vi.fn()} onCancel={onCancel} />);
    await userEvent.type(screen.getByLabelText('Link URL'), '{Escape}');
    expect(onCancel).toHaveBeenCalled();
  });
});
