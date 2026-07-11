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
      <BlockRow
        block={mk()}
        onEdit={onEdit}
        onRemove={vi.fn()}
        onEnter={vi.fn()}
        onDuplicate={vi.fn()}
        onIndent={vi.fn()}
        onPasteMarkdown={vi.fn()}
        dnd={noopDnd}
      />,
    );
    const input = screen.getByLabelText('Block content');
    await userEvent.clear(input);
    await userEvent.type(input, 'world');
    // Blur directly — Tab is now captured for indent, so it no longer blurs.
    input.blur();
    expect(onEdit).toHaveBeenCalledWith('b1', { content: 'world' });
  });

  it('Enter saves and requests a new block', async () => {
    const onEnter = vi.fn();
    const onEdit = vi.fn();
    render(
      <BlockRow
        block={mk()}
        onEdit={onEdit}
        onRemove={vi.fn()}
        onEnter={onEnter}
        onDuplicate={vi.fn()}
        onIndent={vi.fn()}
        onPasteMarkdown={vi.fn()}
        dnd={noopDnd}
      />,
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
        onDuplicate={vi.fn()}
        onIndent={vi.fn()}
        onPasteMarkdown={vi.fn()}
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
      <BlockRow
        block={mk()}
        onEdit={onEdit}
        onRemove={vi.fn()}
        onEnter={vi.fn()}
        onDuplicate={vi.fn()}
        onIndent={vi.fn()}
        onPasteMarkdown={vi.fn()}
        dnd={noopDnd}
      />,
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
        onDuplicate={vi.fn()}
        onIndent={vi.fn()}
        onPasteMarkdown={vi.fn()}
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
        onDuplicate={vi.fn()}
        onIndent={vi.fn()}
        onPasteMarkdown={vi.fn()}
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
        onDuplicate={vi.fn()}
        onIndent={vi.fn()}
        onPasteMarkdown={vi.fn()}
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

  it('imports markdown on paste into an empty block', () => {
    const onPasteMarkdown = vi.fn();
    render(
      <BlockRow
        block={mk({ content: '' })}
        onEdit={vi.fn()}
        onRemove={vi.fn()}
        onEnter={vi.fn()}
        onDuplicate={vi.fn()}
        onIndent={vi.fn()}
        onPasteMarkdown={onPasteMarkdown}
        dnd={noopDnd}
      />,
    );
    fireEvent.paste(screen.getByLabelText('Block content'), {
      clipboardData: { getData: () => '# Title\n- item' },
    });
    expect(onPasteMarkdown).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'b1' }),
      '# Title\n- item',
    );
  });

  it('does not hijack a plain-text paste', () => {
    const onPasteMarkdown = vi.fn();
    render(
      <BlockRow
        block={mk({ content: '' })}
        onEdit={vi.fn()}
        onRemove={vi.fn()}
        onEnter={vi.fn()}
        onDuplicate={vi.fn()}
        onIndent={vi.fn()}
        onPasteMarkdown={onPasteMarkdown}
        dnd={noopDnd}
      />,
    );
    fireEvent.paste(screen.getByLabelText('Block content'), {
      clipboardData: { getData: () => 'just a word' },
    });
    expect(onPasteMarkdown).not.toHaveBeenCalled();
  });

  it('indents on Tab and outdents on Shift-Tab', async () => {
    const onIndent = vi.fn();
    render(
      <BlockRow
        block={mk({ content: 'item' })}
        onEdit={vi.fn()}
        onRemove={vi.fn()}
        onEnter={vi.fn()}
        onDuplicate={vi.fn()}
        onIndent={onIndent}
        onPasteMarkdown={vi.fn()}
        dnd={noopDnd}
      />,
    );
    const input = screen.getByLabelText('Block content');
    input.focus();
    await userEvent.keyboard('{Tab}');
    expect(onIndent).toHaveBeenLastCalledWith('b1', 'in');
    input.focus();
    await userEvent.keyboard('{Shift>}{Tab}{/Shift}');
    expect(onIndent).toHaveBeenLastCalledWith('b1', 'out');
  });

  it('renders the block indented by its depth', () => {
    const { container } = render(
      <BlockRow
        block={mk({ depth: 2 })}
        onEdit={vi.fn()}
        onRemove={vi.fn()}
        onEnter={vi.fn()}
        onDuplicate={vi.fn()}
        onIndent={vi.fn()}
        onPasteMarkdown={vi.fn()}
        dnd={noopDnd}
      />,
    );
    expect((container.querySelector('.pv-block') as HTMLElement).style.marginLeft).toBe('48px');
  });

  it('starts a drag from the handle and drops onto another block', () => {
    const dnd: BlockDndHandlers = { ...noopDnd, onDragStart: vi.fn(), onDrop: vi.fn() };
    render(
      <BlockRow
        block={mk()}
        onEdit={vi.fn()}
        onRemove={vi.fn()}
        onEnter={vi.fn()}
        onDuplicate={vi.fn()}
        onIndent={vi.fn()}
        onPasteMarkdown={vi.fn()}
        dnd={dnd}
      />,
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
        onDuplicate={vi.fn()}
        onIndent={vi.fn()}
        onPasteMarkdown={vi.fn()}
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
        onDuplicate={vi.fn()}
        onIndent={vi.fn()}
        onPasteMarkdown={vi.fn()}
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
        onDuplicate={vi.fn()}
        onIndent={vi.fn()}
        onPasteMarkdown={vi.fn()}
        dnd={noopDnd}
      />,
    );
    const input = screen.getByLabelText('Block content');
    await userEvent.type(input, '/');
    // First item is Text; ArrowDown → Heading, Enter picks it.
    await userEvent.keyboard('{ArrowDown}{Enter}');
    expect(onEdit).toHaveBeenCalledWith('b1', { type: 'heading', content: '' });
  });

  it('shows a formatted preview for a block with inline markup, editable on click', async () => {
    render(
      <BlockRow
        block={mk({ content: 'hello **world**' })}
        onEdit={vi.fn()}
        onRemove={vi.fn()}
        onEnter={vi.fn()}
        onDuplicate={vi.fn()}
        onIndent={vi.fn()}
        onPasteMarkdown={vi.fn()}
        dnd={noopDnd}
      />,
    );
    // Idle block with markup renders a preview (bold span), not a raw textarea.
    expect(screen.queryByLabelText('Block content')).not.toBeInTheDocument();
    expect(screen.getByText('world').tagName).toBe('STRONG');
    // Clicking the preview switches to the editable textarea.
    await userEvent.click(screen.getByText('world'));
    expect(screen.getByLabelText('Block content')).toHaveValue('hello **world**');
  });

  it('duplicates the block via the duplicate control', async () => {
    const onDuplicate = vi.fn();
    const block = mk({ content: 'copy me' });
    render(
      <BlockRow
        block={block}
        onEdit={vi.fn()}
        onRemove={vi.fn()}
        onEnter={vi.fn()}
        onDuplicate={onDuplicate}
        onIndent={vi.fn()}
        onPasteMarkdown={vi.fn()}
        dnd={noopDnd}
      />,
    );
    await userEvent.click(screen.getByLabelText('Duplicate block'));
    expect(onDuplicate).toHaveBeenCalledWith(block);
  });

  it('renders a callout with its icon and editable body', () => {
    render(
      <BlockRow
        block={mk({ type: 'callout', content: 'Note this' })}
        onEdit={vi.fn()}
        onRemove={vi.fn()}
        onEnter={vi.fn()}
        onDuplicate={vi.fn()}
        onIndent={vi.fn()}
        onPasteMarkdown={vi.fn()}
        dnd={noopDnd}
      />,
    );
    expect(screen.getByText('💡')).toBeInTheDocument();
    expect(screen.getByLabelText('Block content')).toHaveValue('Note this');
  });

  it('renders a divider with a delete control', async () => {
    const onRemove = vi.fn();
    render(
      <BlockRow
        block={mk({ type: 'divider' })}
        onEdit={vi.fn()}
        onRemove={onRemove}
        onEnter={vi.fn()}
        onDuplicate={vi.fn()}
        onIndent={vi.fn()}
        onPasteMarkdown={vi.fn()}
        dnd={noopDnd}
      />,
    );
    await userEvent.click(screen.getByLabelText('Delete block'));
    expect(onRemove).toHaveBeenCalledWith('b1');
  });
});
