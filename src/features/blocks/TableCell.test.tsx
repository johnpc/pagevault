import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TableCell } from './TableCell';
import type { TableColumn } from '../../lib/pbTypes';

const col = (type: TableColumn['type'], options?: string[]): TableColumn => ({
  name: 'C',
  type,
  ...(options ? { options } : {}),
});

describe('TableCell', () => {
  it('renders a text input and reports typed text', async () => {
    const onChange = vi.fn();
    render(<TableCell column={col('text')} value="" label="cell" onChange={onChange} />);
    await userEvent.type(screen.getByLabelText('cell'), 'hi');
    expect(onChange).toHaveBeenLastCalledWith('i');
  });

  it('renders a number input for a number column', () => {
    render(<TableCell column={col('number')} value="3" label="cell" onChange={vi.fn()} />);
    expect(screen.getByLabelText('cell')).toHaveProperty('type', 'number');
  });

  it('renders a checkbox that maps checked to "true"', async () => {
    const onChange = vi.fn();
    render(<TableCell column={col('checkbox')} value="" label="cell" onChange={onChange} />);
    await userEvent.click(screen.getByLabelText('cell'));
    expect(onChange).toHaveBeenCalledWith('true');
  });

  it('unchecking a checkbox reports empty string', async () => {
    const onChange = vi.fn();
    render(<TableCell column={col('checkbox')} value="true" label="cell" onChange={onChange} />);
    await userEvent.click(screen.getByLabelText('cell'));
    expect(onChange).toHaveBeenCalledWith('');
  });

  it('renders a select with options and reports the chosen value', async () => {
    const onChange = vi.fn();
    render(
      <TableCell column={col('select', ['a', 'b'])} value="" label="cell" onChange={onChange} />,
    );
    await userEvent.selectOptions(screen.getByLabelText('cell'), 'b');
    expect(onChange).toHaveBeenCalledWith('b');
  });
});
