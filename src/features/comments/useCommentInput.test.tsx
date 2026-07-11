import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

const mutate = vi.fn();
let pending = false;
vi.mock('./commentsApi', () => ({ useAddComment: () => ({ mutate, isPending: pending }) }));

import { useCommentInput } from './useCommentInput';

describe('useCommentInput', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    pending = false;
  });

  it('posts a trimmed draft and clears it on success', () => {
    mutate.mockImplementation((_body, opts) => opts?.onSuccess?.());
    const { result } = renderHook(() => useCommentInput('p1'));
    act(() => result.current.setDraft('  hi there  '));
    act(() => result.current.submit());
    expect(mutate).toHaveBeenCalledWith('hi there', expect.any(Object));
    expect(result.current.draft).toBe('');
  });

  it('does not post an empty/whitespace draft', () => {
    const { result } = renderHook(() => useCommentInput('p1'));
    act(() => result.current.setDraft('   '));
    act(() => result.current.submit());
    expect(mutate).not.toHaveBeenCalled();
  });

  it('does not post while a previous add is pending', () => {
    pending = true;
    const { result } = renderHook(() => useCommentInput('p1'));
    act(() => result.current.setDraft('hi'));
    act(() => result.current.submit());
    expect(mutate).not.toHaveBeenCalled();
  });
});
