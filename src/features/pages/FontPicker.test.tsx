import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FontPicker } from './FontPicker';

describe('FontPicker', () => {
  it('shows the current font on the button', () => {
    render(<FontPicker current="serif" onPick={vi.fn()} />);
    expect(screen.getByLabelText('Page font')).toHaveTextContent('Serif');
  });

  it('shows Default when no font is set', () => {
    render(<FontPicker current="" onPick={vi.fn()} />);
    expect(screen.getByLabelText('Page font')).toHaveTextContent('Default');
  });

  it('marks the current font selected, treating empty as default', async () => {
    render(<FontPicker current="" onPick={vi.fn()} />);
    await userEvent.click(screen.getByLabelText('Page font'));
    expect(screen.getByRole('option', { name: 'Default' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  it('picks a font and closes the menu', async () => {
    const onPick = vi.fn();
    render(<FontPicker current="" onPick={onPick} />);
    await userEvent.click(screen.getByLabelText('Page font'));
    await userEvent.click(screen.getByRole('option', { name: 'Mono' }));
    expect(onPick).toHaveBeenCalledWith('mono');
    expect(screen.queryByRole('listbox', { name: 'Page font' })).not.toBeInTheDocument();
  });
});
