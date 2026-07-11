import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { CommentRecord } from '../../lib/pbClient';

let list: CommentRecord[] = [];
const addMutate = vi.fn();
const delMutate = vi.fn();
vi.mock('./commentsApi', () => ({
  useComments: () => ({ data: list }),
  useAddComment: () => ({ mutate: addMutate, isPending: false }),
  useDeleteComment: () => ({ mutate: delMutate }),
}));

import { Comments } from './Comments';

const cm = (id: string, body: string): CommentRecord =>
  ({ id, body, page: 'p1', owner: 'u1', created: new Date().toISOString() }) as CommentRecord;

describe('Comments', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    list = [];
  });

  it('shows the empty heading and a disabled post button with no draft', () => {
    render(<Comments pageId="p1" />);
    expect(screen.getByText('Comments')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Comment' })).toBeDisabled();
  });

  it('lists comments with a count', () => {
    list = [cm('c1', 'first'), cm('c2', 'second')];
    render(<Comments pageId="p1" />);
    expect(screen.getByText('Comments (2)')).toBeInTheDocument();
    expect(screen.getByText('first')).toBeInTheDocument();
    expect(screen.getByText('second')).toBeInTheDocument();
  });

  it('posts a comment via the button', async () => {
    render(<Comments pageId="p1" />);
    await userEvent.type(screen.getByLabelText('Add a comment'), 'nice');
    await userEvent.click(screen.getByRole('button', { name: 'Comment' }));
    expect(addMutate).toHaveBeenCalledWith('nice', expect.any(Object));
  });

  it('posts on Cmd/Ctrl+Enter', async () => {
    render(<Comments pageId="p1" />);
    const box = screen.getByLabelText('Add a comment');
    await userEvent.type(box, 'quick');
    await userEvent.keyboard('{Control>}{Enter}{/Control}');
    expect(addMutate).toHaveBeenCalledWith('quick', expect.any(Object));
  });

  it('deletes a comment', async () => {
    list = [cm('c1', 'bye')];
    render(<Comments pageId="p1" />);
    await userEvent.click(screen.getByLabelText('Delete comment'));
    expect(delMutate).toHaveBeenCalledWith('c1');
  });
});
