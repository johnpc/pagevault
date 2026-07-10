import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTheme } from './useTheme';

describe('useTheme', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('starts from the persisted choice (default system)', () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current[0]).toBe('system');
  });

  it('applies and persists a new choice', () => {
    const { result } = renderHook(() => useTheme());
    act(() => result.current[1]('dark'));
    expect(result.current[0]).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(localStorage.getItem('pv-theme')).toBe('dark');
  });

  it('system removes the attribute', () => {
    const { result } = renderHook(() => useTheme());
    act(() => result.current[1]('light'));
    act(() => result.current[1]('system'));
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
  });
});
