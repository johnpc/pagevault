import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useSeedValue } from './useSeedValue';

describe('useSeedValue', () => {
  it('seeds the value when active with a new seed', () => {
    const setValue = vi.fn();
    renderHook(() => useSeedValue(true, 'HelloWorld', 'Hello', setValue));
    expect(setValue).toHaveBeenCalledWith('HelloWorld');
  });

  it('does nothing when not the autofocus target', () => {
    const setValue = vi.fn();
    renderHook(() => useSeedValue(false, 'HelloWorld', 'Hello', setValue));
    expect(setValue).not.toHaveBeenCalled();
  });

  it('does nothing when there is no seed (an Enter-created block)', () => {
    const setValue = vi.fn();
    renderHook(() => useSeedValue(true, undefined, 'Hello', setValue));
    expect(setValue).not.toHaveBeenCalled();
  });

  it('does not re-seed once the value already equals the seed', () => {
    const setValue = vi.fn();
    renderHook(() => useSeedValue(true, 'HelloWorld', 'HelloWorld', setValue));
    expect(setValue).not.toHaveBeenCalled();
  });
});
