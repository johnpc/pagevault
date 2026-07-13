import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NumberCell } from './NumberCell';

describe('NumberCell', () => {
  it('shows the formatted value when idle', () => {
    render(<NumberCell value="1000" format="usd" label="Amount" onChange={vi.fn()} />);
    expect(screen.getByLabelText('Amount')).toHaveValue('$1,000.00');
  });

  it('is a plain number input when the format is plain/absent', () => {
    render(<NumberCell value="42" format={undefined} label="Amount" onChange={vi.fn()} />);
    const input = screen.getByLabelText('Amount');
    expect(input).toHaveAttribute('type', 'number');
    expect(input).toHaveValue(42);
  });

  it('swaps to a raw numeric input on focus and edits the stored value', async () => {
    const onChange = vi.fn();
    render(<NumberCell value="1000" format="comma" label="Amount" onChange={onChange} />);
    // Idle shows formatted text; focusing swaps to the raw number editor.
    fireEvent.focus(screen.getByLabelText('Amount'));
    const input = screen.getByLabelText('Amount');
    expect(input).toHaveAttribute('type', 'number');
    expect(input).toHaveValue(1000);
    await userEvent.type(input, '5');
    expect(onChange).toHaveBeenCalledWith('10005');
  });

  it('returns to the formatted view on blur', () => {
    render(<NumberCell value="1000" format="comma" label="Amount" onChange={vi.fn()} />);
    fireEvent.focus(screen.getByLabelText('Amount'));
    fireEvent.blur(screen.getByLabelText('Amount'));
    expect(screen.getByLabelText('Amount')).toHaveValue('1,000');
  });
});
