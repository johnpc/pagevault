import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MultiSelectCell } from './MultiSelectCell';

const opts = ['Red', 'Green', 'Blue'];

describe('MultiSelectCell', () => {
  it('summarizes the chosen tags (or a dash when none)', () => {
    const { rerender } = render(
      <MultiSelectCell value="Red,Blue" options={opts} label="Tags" onChange={vi.fn()} />,
    );
    expect(screen.getByLabelText('Tags')).toHaveTextContent('Red, Blue');
    rerender(<MultiSelectCell value="" options={opts} label="Tags" onChange={vi.fn()} />);
    expect(screen.getByLabelText('Tags')).toHaveTextContent('—');
  });

  it('opens a checklist reflecting current membership', async () => {
    render(<MultiSelectCell value="Green" options={opts} label="Tags" onChange={vi.fn()} />);
    await userEvent.click(screen.getByLabelText('Tags'));
    expect(screen.getByLabelText('Green')).toBeChecked();
    expect(screen.getByLabelText('Red')).not.toBeChecked();
  });

  it('adds an option in column order when toggled on', async () => {
    const onChange = vi.fn();
    render(<MultiSelectCell value="Blue" options={opts} label="Tags" onChange={onChange} />);
    await userEvent.click(screen.getByLabelText('Tags'));
    await userEvent.click(screen.getByLabelText('Red'));
    expect(onChange).toHaveBeenCalledWith('Red,Blue');
  });

  it('removes an option when toggled off', async () => {
    const onChange = vi.fn();
    render(<MultiSelectCell value="Red,Blue" options={opts} label="Tags" onChange={onChange} />);
    await userEvent.click(screen.getByLabelText('Tags'));
    await userEvent.click(screen.getByLabelText('Red'));
    expect(onChange).toHaveBeenCalledWith('Blue');
  });

  it('closes on Escape (shared popover behavior)', async () => {
    render(<MultiSelectCell value="" options={opts} label="Tags" onChange={vi.fn()} />);
    await userEvent.click(screen.getByLabelText('Tags'));
    fireEvent.keyDown(screen.getByLabelText('Tags options'), { key: 'Escape' });
    expect(screen.queryByLabelText('Tags options')).not.toBeInTheDocument();
  });
});
