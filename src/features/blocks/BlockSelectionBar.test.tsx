import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BlockSelectionBar } from './BlockSelectionBar';

describe('BlockSelectionBar', () => {
  it('renders nothing when no blocks are selected', () => {
    const { container } = render(
      <BlockSelectionBar
        count={0}
        onColor={vi.fn()}
        onTurnInto={vi.fn()}
        onDuplicate={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('shows the selected count and colors the selection on a swatch mousedown', () => {
    const onColor = vi.fn();
    render(
      <BlockSelectionBar
        count={3}
        onColor={onColor}
        onTurnInto={vi.fn()}
        onDuplicate={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    expect(screen.getByText('3 selected')).toBeInTheDocument();
    fireEvent.mouseDown(screen.getByLabelText('Color Red'));
    expect(onColor).toHaveBeenCalledWith('red');
    fireEvent.mouseDown(screen.getByLabelText('Color Yellow background'));
    expect(onColor).toHaveBeenCalledWith('yellow-bg');
  });

  it('duplicates the selection on the duplicate mousedown', () => {
    const onDuplicate = vi.fn();
    render(
      <BlockSelectionBar
        count={2}
        onColor={vi.fn()}
        onTurnInto={vi.fn()}
        onDuplicate={onDuplicate}
        onDelete={vi.fn()}
      />,
    );
    fireEvent.mouseDown(screen.getByLabelText('Duplicate selected blocks'));
    expect(onDuplicate).toHaveBeenCalled();
  });

  it('turns the selection into another type via the Turn into menu', async () => {
    const onTurnInto = vi.fn();
    render(
      <BlockSelectionBar
        count={2}
        onColor={vi.fn()}
        onTurnInto={onTurnInto}
        onDuplicate={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByLabelText('Turn into'));
    fireEvent.click(screen.getByRole('option', { name: /Heading/ }));
    expect(onTurnInto).toHaveBeenCalledWith('heading');
  });

  it('deletes the selection on the trash mousedown', () => {
    const onDelete = vi.fn();
    render(
      <BlockSelectionBar
        count={2}
        onColor={vi.fn()}
        onTurnInto={vi.fn()}
        onDuplicate={vi.fn()}
        onDelete={onDelete}
      />,
    );
    fireEvent.mouseDown(screen.getByLabelText('Delete selected blocks'));
    expect(onDelete).toHaveBeenCalled();
  });

  it('prevents default on mousedown so the block selection is not cleared', () => {
    render(
      <BlockSelectionBar
        count={2}
        onColor={vi.fn()}
        onTurnInto={vi.fn()}
        onDuplicate={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    const evt = fireEvent.mouseDown(screen.getByLabelText('Delete selected blocks'));
    expect(evt).toBe(false); // a handler called preventDefault
  });
});
