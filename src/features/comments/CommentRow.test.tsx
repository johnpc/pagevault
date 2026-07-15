import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CommentRow } from './CommentRow';
import type { CommentRecord } from '../../lib/pbClient';

const cm = (body: string): CommentRecord =>
  ({ id: 'c1', body, page: 'p1', owner: 'u1', created: '2026-07-15T00:00:00Z' }) as CommentRecord;

const setup = (body = 'hello') => {
  const onSave = vi.fn();
  const onDelete = vi.fn();
  render(
    <CommentRow
      comment={cm(body)}
      now={Date.parse('2026-07-15T00:01:00Z')}
      onSave={onSave}
      onDelete={onDelete}
    />,
  );
  return { onSave, onDelete };
};

describe('CommentRow', () => {
  it('shows the body and deletes on ×', async () => {
    const { onDelete } = setup('bye');
    expect(screen.getByText('bye')).toBeInTheDocument();
    await userEvent.click(screen.getByLabelText('Delete comment'));
    expect(onDelete).toHaveBeenCalledWith('c1');
  });

  it('Edit → change → Save reports the new body', async () => {
    const { onSave } = setup('typo');
    await userEvent.click(screen.getByLabelText('Edit comment'));
    const box = screen.getByLabelText('Edit comment text');
    await userEvent.clear(box);
    await userEvent.type(box, 'fixed');
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(onSave).toHaveBeenCalledWith('c1', 'fixed');
  });

  it('Cmd/Ctrl+Enter saves the edit', async () => {
    const { onSave } = setup('x');
    await userEvent.click(screen.getByLabelText('Edit comment'));
    const box = screen.getByLabelText('Edit comment text');
    await userEvent.type(box, 'y');
    await userEvent.keyboard('{Control>}{Enter}{/Control}');
    expect(onSave).toHaveBeenCalledWith('c1', 'xy');
  });

  it('Cancel reverts without saving', async () => {
    const { onSave } = setup('keep');
    await userEvent.click(screen.getByLabelText('Edit comment'));
    await userEvent.type(screen.getByLabelText('Edit comment text'), ' more');
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByText('keep')).toBeInTheDocument();
  });

  it('does not save an unchanged or blank body', async () => {
    const { onSave } = setup('same');
    await userEvent.click(screen.getByLabelText('Edit comment'));
    // Unchanged → Save is a no-op.
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(onSave).not.toHaveBeenCalled();
  });
});
