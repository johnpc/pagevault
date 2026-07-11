import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ColorMenu } from './ColorMenu';

describe('ColorMenu', () => {
  it('is closed until the paint button is clicked', async () => {
    render(<ColorMenu current="" onPick={vi.fn()} />);
    expect(screen.queryByRole('listbox', { name: 'Block color' })).not.toBeInTheDocument();
    await userEvent.click(screen.getByLabelText('Block color'));
    expect(screen.getByRole('listbox', { name: 'Block color' })).toBeInTheDocument();
  });

  it('marks the current color as selected', async () => {
    render(<ColorMenu current="red" onPick={vi.fn()} />);
    await userEvent.click(screen.getByLabelText('Block color'));
    expect(screen.getByRole('option', { name: 'Red' })).toHaveAttribute('aria-selected', 'true');
  });

  it('picks a color and closes the menu', async () => {
    const onPick = vi.fn();
    render(<ColorMenu current="" onPick={onPick} />);
    await userEvent.click(screen.getByLabelText('Block color'));
    await userEvent.click(screen.getByRole('option', { name: 'Yellow background' }));
    expect(onPick).toHaveBeenCalledWith('yellow-bg');
    expect(screen.queryByRole('listbox', { name: 'Block color' })).not.toBeInTheDocument();
  });

  it('picks the default (empty token) to clear the color', async () => {
    const onPick = vi.fn();
    render(<ColorMenu current="red" onPick={onPick} />);
    await userEvent.click(screen.getByLabelText('Block color'));
    await userEvent.click(screen.getByRole('option', { name: 'Default' }));
    expect(onPick).toHaveBeenCalledWith('');
  });
});
