import { describe, it, expect } from 'vitest';
import { workspaceClass } from './useSidebarToggle';

describe('workspaceClass', () => {
  it('is the base class when the sidebar is shown', () => {
    expect(workspaceClass(false)).toBe('pv-workspace');
  });

  it('adds the hidden modifier when the sidebar is hidden', () => {
    expect(workspaceClass(true)).toBe('pv-workspace pv-workspace--sidebar-hidden');
  });
});
