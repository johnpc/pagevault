import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BlockRow, type BlockDndHandlers } from './BlockRow';
import type { BlockRecord } from '../../lib/pbClient';

const noopDnd: BlockDndHandlers = {
  draggingId: null,
  overId: null,
  onDragStart: () => {},
  onDragOver: () => {},
  onDrop: () => {},
  onDragEnd: () => {},
};

const mk = (over: Partial<BlockRecord> = {}): BlockRecord =>
  ({
    id: 'b1',
    page: 'p1',
    type: 'text',
    content: 'hello',
    checked: false,
    sort: 0,
    owner: 'u1',
    created: '',
    updated: '',
    collectionId: 'c',
    collectionName: 'blocks',
    ...over,
  }) as BlockRecord;

describe('BlockRow', () => {
  it('saves content on blur', async () => {
    const onEdit = vi.fn();
    render(
      <BlockRow block={mk()} onEdit={onEdit} onRemove={vi.fn()} onEnter={vi.fn()} dnd={noopDnd} />,
    );
    const input = screen.getByLabelText('Block content');
    await userEvent.clear(input);
    await userEvent.type(input, 'world');
    await userEvent.tab();
    expect(onEdit).toHaveBeenCalledWith('b1', { content: 'world' });
  });

  it('Enter saves and requests a new block', async () => {
    const onEnter = vi.fn();
    const onEdit = vi.fn();
    render(
      <BlockRow block={mk()} onEdit={onEdit} onRemove={vi.fn()} onEnter={onEnter} dnd={noopDnd} />,
    );
    screen.getByLabelText('Block content').focus();
    await userEvent.keyboard('{Enter}');
    expect(onEnter).toHaveBeenCalled();
    expect(onEdit).toHaveBeenCalled();
  });

  it('Backspace on an empty block removes it', async () => {
    const onRemove = vi.fn();
    render(
      <BlockRow
        block={mk({ content: '' })}
        onEdit={vi.fn()}
        onRemove={onRemove}
        onEnter={vi.fn()}
        dnd={noopDnd}
      />,
    );
    screen.getByLabelText('Block content').focus();
    await userEvent.keyboard('{Backspace}');
    expect(onRemove).toHaveBeenCalledWith('b1');
  });

  it('cycles the block type via the style button', async () => {
    const onEdit = vi.fn();
    render(
      <BlockRow block={mk()} onEdit={onEdit} onRemove={vi.fn()} onEnter={vi.fn()} dnd={noopDnd} />,
    );
    await userEvent.click(screen.getByLabelText(/change block type/i));
    expect(onEdit).toHaveBeenCalledWith('b1', { type: 'heading' });
  });

  it('toggles a todo checkbox', async () => {
    const onEdit = vi.fn();
    render(
      <BlockRow
        block={mk({ type: 'todo' })}
        onEdit={onEdit}
        onRemove={vi.fn()}
        onEnter={vi.fn()}
        dnd={noopDnd}
      />,
    );
    await userEvent.click(screen.getByLabelText('Toggle to-do'));
    expect(onEdit).toHaveBeenCalledWith('b1', { checked: true });
  });

  it('converts a text block when a markdown prefix is typed', async () => {
    const onEdit = vi.fn();
    render(
      <BlockRow
        block={mk({ content: '' })}
        onEdit={onEdit}
        onRemove={vi.fn()}
        onEnter={vi.fn()}
        dnd={noopDnd}
      />,
    );
    // Typing "- " turns the block into a bullet and consumes the prefix.
    await userEvent.type(screen.getByLabelText('Block content'), '- ');
    expect(onEdit).toHaveBeenCalledWith('b1', { type: 'bullet', content: '' });
  });

  it('does not treat a prefix in a non-text block as a shortcut', async () => {
    const onEdit = vi.fn();
    render(
      <BlockRow
        block={mk({ type: 'heading', content: '' })}
        onEdit={onEdit}
        onRemove={vi.fn()}
        onEnter={vi.fn()}
        dnd={noopDnd}
      />,
    );
    await userEvent.type(screen.getByLabelText('Block content'), '- ');
    // No type-conversion call fired (only a possible blur save later).
    expect(onEdit).not.toHaveBeenCalledWith(
      'b1',
      expect.objectContaining({ type: expect.anything() }),
    );
  });

  it('starts a drag from the handle and drops onto another block', () => {
    const dnd: BlockDndHandlers = { ...noopDnd, onDragStart: vi.fn(), onDrop: vi.fn() };
    render(
      <BlockRow block={mk()} onEdit={vi.fn()} onRemove={vi.fn()} onEnter={vi.fn()} dnd={dnd} />,
    );
    const handle = screen.getByLabelText(/drag to reorder/i);
    fireEvent.dragStart(handle);
    expect(dnd.onDragStart).toHaveBeenCalledWith('b1');
    fireEvent.drop(screen.getByLabelText('Block content').closest('.pv-block')!);
    expect(dnd.onDrop).toHaveBeenCalledWith('b1');
  });

  it('opens the slash menu and converts the block on selection', async () => {
    const onEdit = vi.fn();
    render(
      <BlockRow
        block={mk({ content: '' })}
        onEdit={onEdit}
        onRemove={vi.fn()}
        onEnter={vi.fn()}
        dnd={noopDnd}
      />,
    );
    await userEvent.type(screen.getByLabelText('Block content'), '/');
    expect(screen.getByRole('listbox', { name: 'Block types' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('option', { name: /Quote/ }));
    expect(onEdit).toHaveBeenCalledWith('b1', { type: 'quote', content: '' });
  });

  it('filters the slash menu as you type', async () => {
    render(
      <BlockRow
        block={mk({ content: '' })}
        onEdit={vi.fn()}
        onRemove={vi.fn()}
        onEnter={vi.fn()}
        dnd={noopDnd}
      />,
    );
    await userEvent.type(screen.getByLabelText('Block content'), '/code');
    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(1);
    expect(options[0]).toHaveTextContent('Code');
  });

  it('selects a slash command with arrow keys + Enter', async () => {
    const onEdit = vi.fn();
    render(
      <BlockRow
        block={mk({ content: '' })}
        onEdit={onEdit}
        onRemove={vi.fn()}
        onEnter={vi.fn()}
        dnd={noopDnd}
      />,
    );
    const input = screen.getByLabelText('Block content');
    await userEvent.type(input, '/');
    // First item is Text; ArrowDown → Heading, Enter picks it.
    await userEvent.keyboard('{ArrowDown}{Enter}');
    expect(onEdit).toHaveBeenCalledWith('b1', { type: 'heading', content: '' });
  });

  it('renders a divider with a delete control', async () => {
    const onRemove = vi.fn();
    render(
      <BlockRow
        block={mk({ type: 'divider' })}
        onEdit={vi.fn()}
        onRemove={onRemove}
        onEnter={vi.fn()}
        dnd={noopDnd}
      />,
    );
    await userEvent.click(screen.getByLabelText('Delete block'));
    expect(onRemove).toHaveBeenCalledWith('b1');
  });
});
