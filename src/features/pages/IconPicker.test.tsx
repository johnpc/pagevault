import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IconPicker } from './IconPicker';

describe('IconPicker', () => {
  it('shows the current icon on the trigger', () => {
    render(<IconPicker icon="🚀" onPick={vi.fn()} />);
    expect(screen.getByLabelText('Page icon')).toHaveTextContent('🚀');
  });

  it('opens the grid and picks an emoji, then closes', async () => {
    const onPick = vi.fn();
    render(<IconPicker icon="" onPick={onPick} />);
    await userEvent.click(screen.getByLabelText('Page icon'));
    await userEvent.click(screen.getByLabelText('Set icon 📅'));
    expect(onPick).toHaveBeenCalledWith('📅');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('filters the grid by the search query', async () => {
    render(<IconPicker icon="" onPick={vi.fn()} />);
    await userEvent.click(screen.getByLabelText('Page icon'));
    await userEvent.type(screen.getByLabelText('Search icons'), 'money');
    expect(screen.getByLabelText('Set icon 💰')).toBeInTheDocument();
    expect(screen.queryByLabelText('Set icon 🚀')).not.toBeInTheDocument();
  });

  it('shows a no-matches note for an unknown query', async () => {
    render(<IconPicker icon="" onPick={vi.fn()} />);
    await userEvent.click(screen.getByLabelText('Page icon'));
    await userEvent.type(screen.getByLabelText('Search icons'), 'zzzz');
    expect(screen.getByText('No matches')).toBeInTheDocument();
  });

  it('removes the icon via Remove', async () => {
    const onPick = vi.fn();
    render(<IconPicker icon="🚀" onPick={onPick} />);
    await userEvent.click(screen.getByLabelText('Page icon'));
    await userEvent.click(screen.getByRole('button', { name: 'Remove icon' }));
    expect(onPick).toHaveBeenCalledWith('');
  });

  it('closes on Escape (shared popover behavior)', async () => {
    render(<IconPicker icon="" onPick={vi.fn()} />);
    await userEvent.click(screen.getByLabelText('Page icon'));
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
