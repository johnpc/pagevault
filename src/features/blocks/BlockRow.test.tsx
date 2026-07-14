import { describe, it, expect, vi } from 'vitest';
import { render as rtlRender, screen, fireEvent, type RenderResult } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import type { ReactElement } from 'react';
import { BlockRow, type BlockDndHandlers } from './BlockRow';
import type { BlockRecord } from '../../lib/pbClient';

// The block editor now uses usePages() (for @-mentions) and react-router Links,
// so every BlockRow render needs those providers.
vi.mock('../pages/pagesApi', () => ({ usePages: () => ({ data: [] }) }));

const render = (ui: ReactElement): RenderResult =>
  rtlRender(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>,
  );

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
        onSplit={vi.fn()}
        onMerge={vi.fn()}
        onDuplicate={vi.fn()}
        onIndent={vi.fn()}
        onPasteMarkdown={vi.fn()}
        onUpload={vi.fn()}
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

  it('Enter splits the block at the caret (passes block + caret + value)', async () => {
    const onSplit = vi.fn().mockReturnValue(true);
    const block = mk();
    render(
      <BlockRow
        block={block}
        onEdit={vi.fn()}
        onRemove={vi.fn()}
        onSplit={onSplit}
        onMerge={vi.fn()}
        onDuplicate={vi.fn()}
        onIndent={vi.fn()}
        onPasteMarkdown={vi.fn()}
        onUpload={vi.fn()}
        dnd={noopDnd}
      />,
    );
    const input = screen.getByLabelText('Block content') as HTMLTextAreaElement;
    input.focus();
    input.setSelectionRange(2, 2); // caret after "he" in "hello"
    await userEvent.keyboard('{Enter}');
    expect(onSplit).toHaveBeenCalledWith(block, 2, 'hello');
  });

  it('lets Enter insert a real newline when onSplit declines (code block)', async () => {
    // onSplit returns false → the block keeps the default newline (code behavior).
    const onSplit = vi.fn().mockReturnValue(false);
    const block = mk({ type: 'code', content: 'a' });
    render(
      <BlockRow
        block={block}
        onEdit={vi.fn()}
        onRemove={vi.fn()}
        onSplit={onSplit}
        onMerge={vi.fn()}
        onDuplicate={vi.fn()}
        onIndent={vi.fn()}
        onPasteMarkdown={vi.fn()}
        onUpload={vi.fn()}
        dnd={noopDnd}
      />,
    );
    const input = screen.getByLabelText('Block content') as HTMLTextAreaElement;
    input.focus();
    input.setSelectionRange(1, 1);
    await userEvent.keyboard('{Enter}');
    expect(onSplit).toHaveBeenCalledWith(block, 1, 'a');
  });

  it('Backspace on an empty block removes it', async () => {
    const onRemove = vi.fn();
    render(
      <BlockRow
        block={mk({ content: '' })}
        onEdit={vi.fn()}
        onRemove={onRemove}
        onSplit={vi.fn()}
        onMerge={vi.fn()}
        onDuplicate={vi.fn()}
        onIndent={vi.fn()}
        onPasteMarkdown={vi.fn()}
        onUpload={vi.fn()}
        dnd={noopDnd}
      />,
    );
    screen.getByLabelText('Block content').focus();
    await userEvent.keyboard('{Backspace}');
    expect(onRemove).toHaveBeenCalledWith('b1');
  });

  it('Backspace at the start of a non-empty block merges it with the live value', async () => {
    const onMerge = vi.fn().mockReturnValue(true);
    render(
      <BlockRow
        block={mk({ id: 'b2', content: 'World' })}
        onEdit={vi.fn()}
        onRemove={vi.fn()}
        onSplit={vi.fn()}
        onMerge={onMerge}
        onDuplicate={vi.fn()}
        onIndent={vi.fn()}
        onPasteMarkdown={vi.fn()}
        onUpload={vi.fn()}
        dnd={noopDnd}
      />,
    );
    const input = screen.getByLabelText('Block content') as HTMLTextAreaElement;
    input.focus();
    input.setSelectionRange(0, 0);
    await userEvent.keyboard('{Backspace}');
    expect(onMerge).toHaveBeenCalledWith('b2', 'World');
  });

  it('Backspace mid-text does not merge (lets the textarea delete a char)', async () => {
    const onMerge = vi.fn();
    render(
      <BlockRow
        block={mk({ content: 'World' })}
        onEdit={vi.fn()}
        onRemove={vi.fn()}
        onSplit={vi.fn()}
        onMerge={onMerge}
        onDuplicate={vi.fn()}
        onIndent={vi.fn()}
        onPasteMarkdown={vi.fn()}
        onUpload={vi.fn()}
        dnd={noopDnd}
      />,
    );
    const input = screen.getByLabelText('Block content') as HTMLTextAreaElement;
    input.focus();
    input.setSelectionRange(3, 3);
    await userEvent.keyboard('{Backspace}');
    expect(onMerge).not.toHaveBeenCalled();
  });

  it('cycles the block type via the style button', async () => {
    const onEdit = vi.fn();
    render(
      <BlockRow
        block={mk()}
        onEdit={onEdit}
        onRemove={vi.fn()}
        onSplit={vi.fn()}
        onMerge={vi.fn()}
        onDuplicate={vi.fn()}
        onIndent={vi.fn()}
        onPasteMarkdown={vi.fn()}
        onUpload={vi.fn()}
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
        onSplit={vi.fn()}
        onMerge={vi.fn()}
        onDuplicate={vi.fn()}
        onIndent={vi.fn()}
        onPasteMarkdown={vi.fn()}
        onUpload={vi.fn()}
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
        onSplit={vi.fn()}
        onMerge={vi.fn()}
        onDuplicate={vi.fn()}
        onIndent={vi.fn()}
        onPasteMarkdown={vi.fn()}
        onUpload={vi.fn()}
        dnd={noopDnd}
      />,
    );
    // Typing "- " turns the block into a bullet and consumes the prefix.
    await userEvent.type(screen.getByLabelText('Block content'), '- ');
    expect(onEdit).toHaveBeenCalledWith('b1', { type: 'bullet', content: '' });
  });

  it('wraps the selection in bold on Cmd/Ctrl+B', async () => {
    const onEdit = vi.fn();
    render(
      <BlockRow
        block={mk({ content: 'hello' })}
        onEdit={onEdit}
        onRemove={vi.fn()}
        onSplit={vi.fn()}
        onMerge={vi.fn()}
        onDuplicate={vi.fn()}
        onIndent={vi.fn()}
        onPasteMarkdown={vi.fn()}
        onUpload={vi.fn()}
        dnd={noopDnd}
      />,
    );
    const input = screen.getByLabelText('Block content') as HTMLTextAreaElement;
    input.focus();
    input.setSelectionRange(0, 5); // select "hello"
    await userEvent.keyboard('{Control>}b{/Control}');
    // The wrap updates the field; blur then saves the bolded content.
    input.blur();
    expect(onEdit).toHaveBeenCalledWith('b1', { content: '**hello**' });
  });

  it('does not treat a prefix in a non-text block as a shortcut', async () => {
    const onEdit = vi.fn();
    render(
      <BlockRow
        block={mk({ type: 'heading', content: '' })}
        onEdit={onEdit}
        onRemove={vi.fn()}
        onSplit={vi.fn()}
        onMerge={vi.fn()}
        onDuplicate={vi.fn()}
        onIndent={vi.fn()}
        onPasteMarkdown={vi.fn()}
        onUpload={vi.fn()}
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
        onSplit={vi.fn()}
        onMerge={vi.fn()}
        onDuplicate={vi.fn()}
        onIndent={vi.fn()}
        onPasteMarkdown={onPasteMarkdown}
        onUpload={vi.fn()}
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
        onSplit={vi.fn()}
        onMerge={vi.fn()}
        onDuplicate={vi.fn()}
        onIndent={vi.fn()}
        onPasteMarkdown={onPasteMarkdown}
        onUpload={vi.fn()}
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
        onSplit={vi.fn()}
        onMerge={vi.fn()}
        onDuplicate={vi.fn()}
        onIndent={onIndent}
        onPasteMarkdown={vi.fn()}
        onUpload={vi.fn()}
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
        onSplit={vi.fn()}
        onMerge={vi.fn()}
        onDuplicate={vi.fn()}
        onIndent={vi.fn()}
        onPasteMarkdown={vi.fn()}
        onUpload={vi.fn()}
        dnd={noopDnd}
      />,
    );
    expect((container.querySelector('.pv-block') as HTMLElement).style.marginLeft).toBe('48px');
  });

  it('applies the block color as a tint class on the row', () => {
    const { container } = render(
      <BlockRow
        block={mk({ color: 'yellow-bg' })}
        onEdit={vi.fn()}
        onRemove={vi.fn()}
        onSplit={vi.fn()}
        onMerge={vi.fn()}
        onDuplicate={vi.fn()}
        onIndent={vi.fn()}
        onPasteMarkdown={vi.fn()}
        onUpload={vi.fn()}
        dnd={noopDnd}
      />,
    );
    expect(container.querySelector('.pv-block')).toHaveClass('pv-color--yellow-bg');
  });

  it('sets a block color from the color menu', async () => {
    const onEdit = vi.fn();
    render(
      <BlockRow
        block={mk()}
        onEdit={onEdit}
        onRemove={vi.fn()}
        onSplit={vi.fn()}
        onMerge={vi.fn()}
        onDuplicate={vi.fn()}
        onIndent={vi.fn()}
        onPasteMarkdown={vi.fn()}
        onUpload={vi.fn()}
        dnd={noopDnd}
      />,
    );
    await userEvent.click(screen.getByLabelText('Block color'));
    await userEvent.click(screen.getByRole('option', { name: 'Blue' }));
    expect(onEdit).toHaveBeenCalledWith('b1', { color: 'blue' });
  });

  it('sets a block alignment from the align menu', async () => {
    const onEdit = vi.fn();
    render(
      <BlockRow
        block={mk()}
        onEdit={onEdit}
        onRemove={vi.fn()}
        onSplit={vi.fn()}
        onMerge={vi.fn()}
        onDuplicate={vi.fn()}
        onIndent={vi.fn()}
        onPasteMarkdown={vi.fn()}
        onUpload={vi.fn()}
        dnd={noopDnd}
      />,
    );
    await userEvent.click(screen.getByLabelText('Text alignment'));
    await userEvent.click(screen.getByRole('option', { name: /Center/ }));
    expect(onEdit).toHaveBeenCalledWith('b1', { align: 'center' });
  });

  it('starts a drag from the handle and drops onto another block', () => {
    const dnd: BlockDndHandlers = { ...noopDnd, onDragStart: vi.fn(), onDrop: vi.fn() };
    render(
      <BlockRow
        block={mk()}
        onEdit={vi.fn()}
        onRemove={vi.fn()}
        onSplit={vi.fn()}
        onMerge={vi.fn()}
        onDuplicate={vi.fn()}
        onIndent={vi.fn()}
        onPasteMarkdown={vi.fn()}
        onUpload={vi.fn()}
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
        onSplit={vi.fn()}
        onMerge={vi.fn()}
        onDuplicate={vi.fn()}
        onIndent={vi.fn()}
        onPasteMarkdown={vi.fn()}
        onUpload={vi.fn()}
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
        onSplit={vi.fn()}
        onMerge={vi.fn()}
        onDuplicate={vi.fn()}
        onIndent={vi.fn()}
        onPasteMarkdown={vi.fn()}
        onUpload={vi.fn()}
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
        onSplit={vi.fn()}
        onMerge={vi.fn()}
        onDuplicate={vi.fn()}
        onIndent={vi.fn()}
        onPasteMarkdown={vi.fn()}
        onUpload={vi.fn()}
        dnd={noopDnd}
      />,
    );
    const input = screen.getByLabelText('Block content');
    await userEvent.type(input, '/');
    // First item is Text; ArrowDown → Heading, Enter picks it.
    await userEvent.keyboard('{ArrowDown}{Enter}');
    expect(onEdit).toHaveBeenCalledWith('b1', { type: 'heading', content: '' });
  });

  it('wraps to the last slash command with ArrowUp', async () => {
    const onEdit = vi.fn();
    render(
      <BlockRow
        block={mk({ content: '' })}
        onEdit={onEdit}
        onRemove={vi.fn()}
        onSplit={vi.fn()}
        onMerge={vi.fn()}
        onDuplicate={vi.fn()}
        onIndent={vi.fn()}
        onPasteMarkdown={vi.fn()}
        onUpload={vi.fn()}
        dnd={noopDnd}
      />,
    );
    const input = screen.getByLabelText('Block content');
    await userEvent.type(input, '/');
    // From the first item, ArrowUp wraps to the last command (Divider).
    await userEvent.keyboard('{ArrowUp}{Enter}');
    expect(onEdit).toHaveBeenCalledWith('b1', { type: 'divider', content: '' });
  });

  it('Escape closes the slash menu', async () => {
    render(
      <BlockRow
        block={mk({ content: '' })}
        onEdit={vi.fn()}
        onRemove={vi.fn()}
        onSplit={vi.fn()}
        onMerge={vi.fn()}
        onDuplicate={vi.fn()}
        onIndent={vi.fn()}
        onPasteMarkdown={vi.fn()}
        onUpload={vi.fn()}
        dnd={noopDnd}
      />,
    );
    const input = screen.getByLabelText('Block content');
    await userEvent.type(input, '/');
    expect(screen.getByRole('listbox', { name: 'Block types' })).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('listbox', { name: 'Block types' })).not.toBeInTheDocument();
  });

  it('shows a formatted preview for a block with inline markup, editable on click', async () => {
    render(
      <BlockRow
        block={mk({ content: 'hello **world**' })}
        onEdit={vi.fn()}
        onRemove={vi.fn()}
        onSplit={vi.fn()}
        onMerge={vi.fn()}
        onDuplicate={vi.fn()}
        onIndent={vi.fn()}
        onPasteMarkdown={vi.fn()}
        onUpload={vi.fn()}
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
        onSplit={vi.fn()}
        onMerge={vi.fn()}
        onDuplicate={onDuplicate}
        onIndent={vi.fn()}
        onPasteMarkdown={vi.fn()}
        onUpload={vi.fn()}
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
        onSplit={vi.fn()}
        onMerge={vi.fn()}
        onDuplicate={vi.fn()}
        onIndent={vi.fn()}
        onPasteMarkdown={vi.fn()}
        onUpload={vi.fn()}
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
        onSplit={vi.fn()}
        onMerge={vi.fn()}
        onDuplicate={vi.fn()}
        onIndent={vi.fn()}
        onPasteMarkdown={vi.fn()}
        onUpload={vi.fn()}
        dnd={noopDnd}
      />,
    );
    await userEvent.click(screen.getByLabelText('Delete block'));
    expect(onRemove).toHaveBeenCalledWith('b1');
  });

  it('collapses a toggle from its chevron', async () => {
    const onEdit = vi.fn();
    render(
      <BlockRow
        block={mk({ type: 'toggle', content: 'Details', collapsed: false })}
        onEdit={onEdit}
        onRemove={vi.fn()}
        onSplit={vi.fn()}
        onMerge={vi.fn()}
        onDuplicate={vi.fn()}
        onIndent={vi.fn()}
        onPasteMarkdown={vi.fn()}
        onUpload={vi.fn()}
        dnd={noopDnd}
      />,
    );
    await userEvent.click(screen.getByLabelText('Collapse toggle'));
    expect(onEdit).toHaveBeenCalledWith('b1', { collapsed: true });
  });

  it('expands a collapsed toggle from its chevron', async () => {
    const onEdit = vi.fn();
    render(
      <BlockRow
        block={mk({ type: 'toggle', content: 'Details', collapsed: true })}
        onEdit={onEdit}
        onRemove={vi.fn()}
        onSplit={vi.fn()}
        onMerge={vi.fn()}
        onDuplicate={vi.fn()}
        onIndent={vi.fn()}
        onPasteMarkdown={vi.fn()}
        onUpload={vi.fn()}
        dnd={noopDnd}
      />,
    );
    await userEvent.click(screen.getByLabelText('Expand toggle'));
    expect(onEdit).toHaveBeenCalledWith('b1', { collapsed: false });
  });

  it('shows a copy button on a non-empty code block, not on an empty one', () => {
    const { rerender } = render(
      <BlockRow
        block={mk({ type: 'code', content: 'npm run build' })}
        onEdit={vi.fn()}
        onRemove={vi.fn()}
        onSplit={vi.fn()}
        onMerge={vi.fn()}
        onDuplicate={vi.fn()}
        onIndent={vi.fn()}
        onPasteMarkdown={vi.fn()}
        onUpload={vi.fn()}
        dnd={noopDnd}
      />,
    );
    expect(screen.getByRole('button', { name: 'Copy code' })).toBeInTheDocument();
    rerender(
      <BlockRow
        block={mk({ type: 'code', content: '' })}
        onEdit={vi.fn()}
        onRemove={vi.fn()}
        onSplit={vi.fn()}
        onMerge={vi.fn()}
        onDuplicate={vi.fn()}
        onIndent={vi.fn()}
        onPasteMarkdown={vi.fn()}
        onUpload={vi.fn()}
        dnd={noopDnd}
      />,
    );
    expect(screen.queryByRole('button', { name: 'Copy code' })).not.toBeInTheDocument();
  });
});
