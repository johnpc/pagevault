import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OptionRow } from './OptionRow';

const setup = (over: Partial<Parameters<typeof OptionRow>[0]> = {}) => {
  const onRename = vi.fn();
  const onRemove = vi.fn();
  render(
    <ul>
      <OptionRow option="Red" onRename={onRename} onRemove={onRemove} {...over}>
        <span>Red</span>
      </OptionRow>
    </ul>,
  );
  return { onRename, onRemove };
};

describe('OptionRow', () => {
  it('shows the child control plus rename + remove affordances', () => {
    setup();
    expect(screen.getByText('Red')).toBeInTheDocument();
    expect(screen.getByLabelText('Rename option Red')).toBeInTheDocument();
    expect(screen.getByLabelText('Remove option Red')).toBeInTheDocument();
  });

  it('remove fires onRemove', async () => {
    const { onRemove } = setup();
    await userEvent.click(screen.getByLabelText('Remove option Red'));
    expect(onRemove).toHaveBeenCalledOnce();
  });

  it('✎ opens an inline input; Enter commits the new name', async () => {
    const { onRename } = setup();
    await userEvent.click(screen.getByLabelText('Rename option Red'));
    const input = screen.getByLabelText('New name for Red');
    await userEvent.clear(input);
    await userEvent.type(input, 'Crimson{Enter}');
    expect(onRename).toHaveBeenCalledWith('Crimson');
    // Back to display mode.
    expect(screen.getByText('Red')).toBeInTheDocument();
  });

  it('Escape cancels without renaming', async () => {
    const { onRename } = setup();
    await userEvent.click(screen.getByLabelText('Rename option Red'));
    await userEvent.type(screen.getByLabelText('New name for Red'), 'X{Escape}');
    expect(onRename).not.toHaveBeenCalled();
    expect(screen.getByText('Red')).toBeInTheDocument();
  });

  it('blur cancels the rename', async () => {
    const { onRename } = setup();
    await userEvent.click(screen.getByLabelText('Rename option Red'));
    screen.getByLabelText('New name for Red').blur();
    expect(onRename).not.toHaveBeenCalled();
  });
});
