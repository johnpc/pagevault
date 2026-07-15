import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MultiSelectCell } from './MultiSelectCell';

const opts = ['Red', 'Green', 'Blue'];

describe('MultiSelectCell', () => {
  it('summarizes the chosen tags (or a dash when none)', () => {
    const { rerender } = render(
      <MultiSelectCell
        value="Red,Blue"
        options={opts}
        label="Tags"
        onChange={vi.fn()}
        onAddOption={vi.fn()}
        onRemoveOption={vi.fn()}
      />,
    );
    // Each chosen tag renders as its own colored pill (no comma join).
    expect(screen.getByLabelText('Tags')).toHaveTextContent('Red');
    expect(screen.getByLabelText('Tags')).toHaveTextContent('Blue');
    rerender(
      <MultiSelectCell
        value=""
        options={opts}
        label="Tags"
        onChange={vi.fn()}
        onAddOption={vi.fn()}
        onRemoveOption={vi.fn()}
      />,
    );
    expect(screen.getByLabelText('Tags')).toHaveTextContent('—');
  });

  it('opens a checklist reflecting current membership', async () => {
    render(
      <MultiSelectCell
        value="Green"
        options={opts}
        label="Tags"
        onChange={vi.fn()}
        onAddOption={vi.fn()}
        onRemoveOption={vi.fn()}
      />,
    );
    await userEvent.click(screen.getByLabelText('Tags'));
    expect(screen.getByLabelText('Green')).toBeChecked();
    expect(screen.getByLabelText('Red')).not.toBeChecked();
  });

  it('adds an option in column order when toggled on', async () => {
    const onChange = vi.fn();
    render(
      <MultiSelectCell
        value="Blue"
        options={opts}
        label="Tags"
        onChange={onChange}
        onAddOption={vi.fn()}
        onRemoveOption={vi.fn()}
      />,
    );
    await userEvent.click(screen.getByLabelText('Tags'));
    await userEvent.click(screen.getByLabelText('Red'));
    expect(onChange).toHaveBeenCalledWith('Red,Blue');
  });

  it('removes an option when toggled off', async () => {
    const onChange = vi.fn();
    render(
      <MultiSelectCell
        value="Red,Blue"
        options={opts}
        label="Tags"
        onChange={onChange}
        onAddOption={vi.fn()}
        onRemoveOption={vi.fn()}
      />,
    );
    await userEvent.click(screen.getByLabelText('Tags'));
    await userEvent.click(screen.getByLabelText('Red'));
    expect(onChange).toHaveBeenCalledWith('Blue');
  });

  it('creates a new option inline on Enter (trimmed), then clears the input', async () => {
    const onAddOption = vi.fn();
    render(
      <MultiSelectCell
        value=""
        options={opts}
        label="Tags"
        onChange={vi.fn()}
        onAddOption={onAddOption}
        onRemoveOption={vi.fn()}
      />,
    );
    await userEvent.click(screen.getByLabelText('Tags'));
    const input = screen.getByLabelText('Add an option to Tags');
    await userEvent.type(input, '  Yellow  {Enter}');
    expect(onAddOption).toHaveBeenCalledWith('Yellow');
    expect(input).toHaveValue('');
  });

  it('does not create a blank or duplicate option', async () => {
    const onAddOption = vi.fn();
    render(
      <MultiSelectCell
        value=""
        options={opts}
        label="Tags"
        onChange={vi.fn()}
        onAddOption={onAddOption}
        onRemoveOption={vi.fn()}
      />,
    );
    await userEvent.click(screen.getByLabelText('Tags'));
    const input = screen.getByLabelText('Add an option to Tags');
    await userEvent.type(input, '   {Enter}'); // blank
    await userEvent.type(input, 'Red{Enter}'); // duplicate
    expect(onAddOption).not.toHaveBeenCalled();
  });

  it('removes an option via its ✕', async () => {
    const onRemoveOption = vi.fn();
    render(
      <MultiSelectCell
        value=""
        options={opts}
        label="Tags"
        onChange={vi.fn()}
        onAddOption={vi.fn()}
        onRemoveOption={onRemoveOption}
      />,
    );
    await userEvent.click(screen.getByLabelText('Tags'));
    await userEvent.click(screen.getByLabelText('Remove option Green'));
    expect(onRemoveOption).toHaveBeenCalledWith('Green');
  });

  it('closes on Escape (shared popover behavior)', async () => {
    render(
      <MultiSelectCell
        value=""
        options={opts}
        label="Tags"
        onChange={vi.fn()}
        onAddOption={vi.fn()}
        onRemoveOption={vi.fn()}
      />,
    );
    await userEvent.click(screen.getByLabelText('Tags'));
    fireEvent.keyDown(screen.getByLabelText('Tags options'), { key: 'Escape' });
    expect(screen.queryByLabelText('Tags options')).not.toBeInTheDocument();
  });
});
