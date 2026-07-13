import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ColumnFormatPicker } from './ColumnFormatPicker';
import type { TableData } from '../../lib/pbTypes';

const data: TableData = {
  columns: [{ name: 'Amount', type: 'number' }],
  rows: [['1000']],
};

describe('ColumnFormatPicker', () => {
  it('reflects the current format (defaulting to plain)', () => {
    render(<ColumnFormatPicker data={data} c={0} format={undefined} save={vi.fn()} />);
    expect(screen.getByLabelText('Column 1 format')).toHaveValue('plain');
  });

  it('patches the column format on change', async () => {
    const save = vi.fn();
    render(<ColumnFormatPicker data={data} c={0} format={undefined} save={save} />);
    await userEvent.selectOptions(screen.getByLabelText('Column 1 format'), 'usd');
    const saved = save.mock.calls.at(-1)![0] as TableData;
    expect(saved.columns[0].format).toBe('usd');
  });
});
