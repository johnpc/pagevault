import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BlockRow } from './BlockRow';
import type { BlockRecord } from '../../lib/pbClient';

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
    render(<BlockRow block={mk()} onEdit={onEdit} onRemove={vi.fn()} onEnter={vi.fn()} />);
    const input = screen.getByLabelText('Block content');
    await userEvent.clear(input);
    await userEvent.type(input, 'world');
    await userEvent.tab();
    expect(onEdit).toHaveBeenCalledWith('b1', { content: 'world' });
  });

  it('Enter saves and requests a new block', async () => {
    const onEnter = vi.fn();
    const onEdit = vi.fn();
    render(<BlockRow block={mk()} onEdit={onEdit} onRemove={vi.fn()} onEnter={onEnter} />);
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
      />,
    );
    screen.getByLabelText('Block content').focus();
    await userEvent.keyboard('{Backspace}');
    expect(onRemove).toHaveBeenCalledWith('b1');
  });

  it('cycles the block type via the style button', async () => {
    const onEdit = vi.fn();
    render(<BlockRow block={mk()} onEdit={onEdit} onRemove={vi.fn()} onEnter={vi.fn()} />);
    await userEvent.click(screen.getByLabelText('Change block type'));
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
      />,
    );
    await userEvent.click(screen.getByLabelText('Toggle to-do'));
    expect(onEdit).toHaveBeenCalledWith('b1', { checked: true });
  });

  it('renders a divider with a delete control', async () => {
    const onRemove = vi.fn();
    render(
      <BlockRow
        block={mk({ type: 'divider' })}
        onEdit={vi.fn()}
        onRemove={onRemove}
        onEnter={vi.fn()}
      />,
    );
    await userEvent.click(screen.getByLabelText('Delete block'));
    expect(onRemove).toHaveBeenCalledWith('b1');
  });
});
