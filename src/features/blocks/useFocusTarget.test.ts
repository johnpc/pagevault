import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFocusTarget } from './useFocusTarget';

describe('useFocusTarget', () => {
  it('starts empty', () => {
    const { result } = renderHook(() => useFocusTarget());
    expect(result.current.focusId).toBeNull();
    expect(result.current.focusCaret).toBeUndefined();
    expect(result.current.focusValue).toBeUndefined();
  });

  it('focusAt sets id, caret and seed value (a merge)', () => {
    const { result } = renderHook(() => useFocusTarget());
    act(() => result.current.focusAt('b1', 5, 'HelloWorld'));
    expect(result.current.focusId).toBe('b1');
    expect(result.current.focusCaret).toBe(5);
    expect(result.current.focusValue).toBe('HelloWorld');
  });

  it('setFocusId sets just the id (an Enter-created block, no caret/seed)', () => {
    const { result } = renderHook(() => useFocusTarget());
    act(() => result.current.setFocusId('new'));
    expect(result.current.focusId).toBe('new');
    expect(result.current.focusCaret).toBeUndefined();
  });

  it('clearFocusId resets everything', () => {
    const { result } = renderHook(() => useFocusTarget());
    act(() => result.current.focusAt('b1', 5, 'x'));
    act(() => result.current.clearFocusId());
    expect(result.current.focusId).toBeNull();
    expect(result.current.focusCaret).toBeUndefined();
    expect(result.current.focusValue).toBeUndefined();
  });
});
