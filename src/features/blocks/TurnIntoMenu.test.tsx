import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TurnIntoMenu } from './TurnIntoMenu';

describe('TurnIntoMenu', () => {
  it('is closed until the turn-into button is clicked', async () => {
    render(<TurnIntoMenu current="text" onPick={vi.fn()} />);
    expect(screen.queryByRole('listbox', { name: 'Turn into' })).not.toBeInTheDocument();
    await userEvent.click(screen.getByLabelText('Turn into'));
    expect(screen.getByRole('listbox', { name: 'Turn into' })).toBeInTheDocument();
  });

  it('marks the current type as selected', async () => {
    render(<TurnIntoMenu current="quote" onPick={vi.fn()} />);
    await userEvent.click(screen.getByLabelText('Turn into'));
    expect(screen.getByRole('option', { name: /Quote/ })).toHaveAttribute('aria-selected', 'true');
  });

  it('picks a target type and closes the menu', async () => {
    const onPick = vi.fn();
    render(<TurnIntoMenu current="text" onPick={onPick} />);
    await userEvent.click(screen.getByLabelText('Turn into'));
    await userEvent.click(screen.getByRole('option', { name: /Heading/ }));
    expect(onPick).toHaveBeenCalledWith('heading');
    expect(screen.queryByRole('listbox', { name: 'Turn into' })).not.toBeInTheDocument();
  });
});
