import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SelectCell } from './SelectCell';

const opts = ['Open', 'Done'];
const base = {
  options: opts,
  label: 'Status',
  onChange: vi.fn(),
  onAddOption: vi.fn(),
  onRemoveOption: vi.fn(),
  onRenameOption: vi.fn(),
};

describe('SelectCell', () => {
  it('summarizes the chosen value (or a dash when none)', () => {
    const { rerender } = render(<SelectCell {...base} value="Open" />);
    expect(screen.getByLabelText('Status')).toHaveTextContent('Open');
    rerender(<SelectCell {...base} value="" />);
    expect(screen.getByLabelText('Status')).toHaveTextContent('—');
  });

  it('picks an option and reports it', async () => {
    const onChange = vi.fn();
    render(<SelectCell {...base} value="" onChange={onChange} />);
    await userEvent.click(screen.getByLabelText('Status'));
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    expect(onChange).toHaveBeenCalledWith('Open');
  });

  it('picking the already-chosen option clears the cell', async () => {
    const onChange = vi.fn();
    render(<SelectCell {...base} value="Open" onChange={onChange} />);
    await userEvent.click(screen.getByLabelText('Status'));
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    expect(onChange).toHaveBeenCalledWith('');
  });

  it('creates a new option inline on Enter (trimmed), then clears the input', async () => {
    const onAddOption = vi.fn();
    render(<SelectCell {...base} value="" onAddOption={onAddOption} />);
    await userEvent.click(screen.getByLabelText('Status'));
    const input = screen.getByLabelText('Add an option to Status');
    await userEvent.type(input, '  Blocked  {Enter}');
    expect(onAddOption).toHaveBeenCalledWith('Blocked');
    expect(input).toHaveValue('');
  });

  it('does not create a blank or duplicate option', async () => {
    const onAddOption = vi.fn();
    render(<SelectCell {...base} value="" onAddOption={onAddOption} />);
    await userEvent.click(screen.getByLabelText('Status'));
    const input = screen.getByLabelText('Add an option to Status');
    await userEvent.type(input, '   {Enter}');
    await userEvent.type(input, 'Open{Enter}');
    expect(onAddOption).not.toHaveBeenCalled();
  });

  it('removes an option via its ✕', async () => {
    const onRemoveOption = vi.fn();
    render(<SelectCell {...base} value="" onRemoveOption={onRemoveOption} />);
    await userEvent.click(screen.getByLabelText('Status'));
    await userEvent.click(screen.getByLabelText('Remove option Open'));
    expect(onRemoveOption).toHaveBeenCalledWith('Open');
  });

  it('renames an option via its ✎ (Enter commits the new name)', async () => {
    const onRenameOption = vi.fn();
    render(<SelectCell {...base} value="" onRenameOption={onRenameOption} />);
    await userEvent.click(screen.getByLabelText('Status'));
    await userEvent.click(screen.getByLabelText('Rename option Open'));
    const input = screen.getByLabelText('New name for Open');
    await userEvent.clear(input);
    await userEvent.type(input, 'Active{Enter}');
    expect(onRenameOption).toHaveBeenCalledWith('Open', 'Active');
  });

  it('Escape cancels a rename without reporting it', async () => {
    const onRenameOption = vi.fn();
    render(<SelectCell {...base} value="" onRenameOption={onRenameOption} />);
    await userEvent.click(screen.getByLabelText('Status'));
    await userEvent.click(screen.getByLabelText('Rename option Open'));
    await userEvent.type(screen.getByLabelText('New name for Open'), 'X{Escape}');
    expect(onRenameOption).not.toHaveBeenCalled();
    // The option button is back (no longer editing).
    expect(screen.getByRole('button', { name: 'Open' })).toBeInTheDocument();
  });

  it('closes on Escape (shared popover behavior)', async () => {
    render(<SelectCell {...base} value="" />);
    await userEvent.click(screen.getByLabelText('Status'));
    fireEvent.keyDown(screen.getByLabelText('Status options'), { key: 'Escape' });
    expect(screen.queryByLabelText('Status options')).not.toBeInTheDocument();
  });
});
