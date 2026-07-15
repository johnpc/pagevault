import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChoiceCell } from './ChoiceCell';
import type { TableColumn } from '../../lib/pbTypes';

const col = (type: 'select' | 'multiselect'): TableColumn => ({
  name: 'C',
  type,
  options: ['a', 'b'],
});
const base = {
  label: 'cell',
  onChange: vi.fn(),
  onAddOption: vi.fn(),
  onRemoveOption: vi.fn(),
  onRenameOption: vi.fn(),
};

describe('ChoiceCell', () => {
  it('renders a single-select picker and reports the chosen value', async () => {
    const onChange = vi.fn();
    render(<ChoiceCell {...base} column={col('select')} value="" onChange={onChange} />);
    await userEvent.click(screen.getByLabelText('cell'));
    await userEvent.click(screen.getByRole('button', { name: 'b' }));
    expect(onChange).toHaveBeenCalledWith('b');
  });

  it('renders a multiselect picker that toggles tags into a comma-joined value', async () => {
    const onChange = vi.fn();
    render(<ChoiceCell {...base} column={col('multiselect')} value="b" onChange={onChange} />);
    await userEvent.click(screen.getByLabelText('cell'));
    await userEvent.click(screen.getByLabelText('a'));
    expect(onChange).toHaveBeenCalledWith('a,b');
  });
});
