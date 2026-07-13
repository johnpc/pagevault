import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AlignMenu } from './AlignMenu';

describe('AlignMenu', () => {
  it('opens the alignment options and marks the current one', async () => {
    render(<AlignMenu current="center" onPick={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: 'Text alignment' }));
    const center = screen.getByRole('option', { name: /Center/ });
    expect(center).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('option', { name: /Left/ })).toHaveAttribute('aria-selected', 'false');
  });

  it('picks an alignment and closes', async () => {
    const onPick = vi.fn();
    render(<AlignMenu current="" onPick={onPick} />);
    await userEvent.click(screen.getByRole('button', { name: 'Text alignment' }));
    await userEvent.click(screen.getByRole('option', { name: /Right/ }));
    expect(onPick).toHaveBeenCalledWith('right');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('closes on Escape (shared popover behavior)', async () => {
    render(<AlignMenu current="" onPick={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: 'Text alignment' }));
    fireEvent.keyDown(screen.getByRole('listbox'), { key: 'Escape' });
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
});
