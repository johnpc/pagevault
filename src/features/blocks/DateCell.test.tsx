import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DateCell } from './DateCell';

// Pin the clock so the relative format is deterministic (today = 2026-01-05).
beforeAll(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-01-05T12:00:00Z'));
});
afterAll(() => {
  vi.useRealTimers();
});

describe('DateCell', () => {
  it('shows the formatted value when idle', () => {
    render(<DateCell value="2026-01-05" format="medium" label="Due" onChange={vi.fn()} />);
    const input = screen.getByLabelText('Due');
    expect(input).toHaveAttribute('type', 'text');
    expect(input).toHaveValue('Jan 5, 2026');
  });

  it('renders relative against the real clock', () => {
    render(<DateCell value="2026-01-06" format="relative" label="Due" onChange={vi.fn()} />);
    expect(screen.getByLabelText('Due')).toHaveValue('Tomorrow');
  });

  it('is a native date input for iso / empty / while editing', () => {
    render(<DateCell value="2026-01-05" format="iso" label="Due" onChange={vi.fn()} />);
    expect(screen.getByLabelText('Due')).toHaveAttribute('type', 'date');
  });

  it('an empty cell shows the date input even when formatted', () => {
    render(<DateCell value="" format="medium" label="Due" onChange={vi.fn()} />);
    expect(screen.getByLabelText('Due')).toHaveAttribute('type', 'date');
  });

  it('swaps to the date input on focus and edits the ISO value', () => {
    const onChange = vi.fn();
    render(<DateCell value="2026-01-05" format="long" label="Due" onChange={onChange} />);
    fireEvent.focus(screen.getByLabelText('Due'));
    const input = screen.getByLabelText('Due');
    expect(input).toHaveAttribute('type', 'date');
    fireEvent.change(input, { target: { value: '2026-02-01' } });
    expect(onChange).toHaveBeenCalledWith('2026-02-01');
  });
});
