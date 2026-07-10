import { describe, it, expect, beforeEach } from 'vitest';
import { readTheme, applyTheme } from './theme';

describe('theme', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('defaults to system when nothing is stored', () => {
    expect(readTheme()).toBe('system');
  });

  it('persists and reads an explicit choice', () => {
    applyTheme('dark');
    expect(readTheme()).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('system removes the attribute so the OS decides', () => {
    applyTheme('light');
    applyTheme('system');
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
    expect(readTheme()).toBe('system');
  });
});
