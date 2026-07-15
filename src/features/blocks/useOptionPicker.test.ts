import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOptionPicker } from './useOptionPicker';

const opts = ['Todo', 'Done'];

describe('useOptionPicker', () => {
  it('filters options as the draft changes and derives the creatable name', () => {
    const { result } = renderHook(() => useOptionPicker(opts, vi.fn()));
    expect(result.current.filtered).toEqual(opts);
    act(() => result.current.setDraft('do'));
    expect(result.current.filtered).toEqual(['Todo', 'Done']);
    expect(result.current.creatable).toBe('do'); // 'do' isn't an exact option
    act(() => result.current.setDraft('Done'));
    expect(result.current.creatable).toBe(''); // exact match → not creatable
  });

  it('commitCreate adds the new option and clears the draft', () => {
    const onAddOption = vi.fn();
    const { result } = renderHook(() => useOptionPicker(opts, onAddOption));
    act(() => result.current.setDraft('  Blocked '));
    act(() => result.current.commitCreate());
    expect(onAddOption).toHaveBeenCalledWith('Blocked');
    expect(result.current.draft).toBe('');
  });

  it('commitCreate is a no-op when nothing is creatable', () => {
    const onAddOption = vi.fn();
    const { result } = renderHook(() => useOptionPicker(opts, onAddOption));
    act(() => result.current.setDraft('Done')); // already exists
    act(() => result.current.commitCreate());
    expect(onAddOption).not.toHaveBeenCalled();
  });
});
