import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ShortcutHelp } from './ShortcutHelp';

describe('ShortcutHelp', () => {
  it('lists shortcuts including quick find', () => {
    render(<ShortcutHelp onClose={vi.fn()} />);
    expect(screen.getByRole('dialog', { name: 'Keyboard shortcuts' })).toBeInTheDocument();
    expect(screen.getByText(/Open quick find/)).toBeInTheDocument();
  });

  it('closes via the Close button and the backdrop', async () => {
    const onClose = vi.fn();
    render(<ShortcutHelp onClose={onClose} />);
    await userEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
