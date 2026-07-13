import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CalloutIcon, DEFAULT_CALLOUT_EMOJI } from './CalloutIcon';

describe('CalloutIcon', () => {
  it('shows the default icon when none is set', () => {
    render(<CalloutIcon value="" onPick={vi.fn()} />);
    expect(screen.getByLabelText('Callout icon')).toHaveTextContent(DEFAULT_CALLOUT_EMOJI);
  });

  it('shows the chosen icon', () => {
    render(<CalloutIcon value="⚠️" onPick={vi.fn()} />);
    expect(screen.getByLabelText('Callout icon')).toHaveTextContent('⚠️');
  });

  it('opens the grid and picks a new icon', async () => {
    const onPick = vi.fn();
    render(<CalloutIcon value="" onPick={onPick} />);
    expect(screen.queryByRole('listbox', { name: 'Callout icon' })).not.toBeInTheDocument();
    await userEvent.click(screen.getByLabelText('Callout icon'));
    await userEvent.click(screen.getByRole('option', { name: 'Icon ⚠️' }));
    expect(onPick).toHaveBeenCalledWith('⚠️');
    expect(screen.queryByRole('listbox', { name: 'Callout icon' })).not.toBeInTheDocument();
  });

  it('marks the current icon selected', async () => {
    render(<CalloutIcon value="📌" onPick={vi.fn()} />);
    await userEvent.click(screen.getByLabelText('Callout icon'));
    expect(screen.getByRole('option', { name: 'Icon 📌' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });
});
