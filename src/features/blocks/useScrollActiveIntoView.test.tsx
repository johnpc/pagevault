import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useScrollActiveIntoView } from './useScrollActiveIntoView';

describe('useScrollActiveIntoView', () => {
  it("scrolls the ref'd element into view when active changes", () => {
    const scrollIntoView = vi.fn();
    const el = { scrollIntoView } as unknown as HTMLButtonElement;
    const { result, rerender } = renderHook(
      ({ active }) => useScrollActiveIntoView<HTMLButtonElement>(active),
      {
        initialProps: { active: 0 },
      },
    );
    // Attach the fake element to the returned ref (as the active <button> would).
    result.current.current = el;
    rerender({ active: 1 });
    expect(scrollIntoView).toHaveBeenCalledWith({ block: 'nearest' });
  });

  it('is a no-op when the ref is empty (nothing active yet)', () => {
    const { rerender } = renderHook(({ active }) => useScrollActiveIntoView(active), {
      initialProps: { active: 0 },
    });
    expect(() => rerender({ active: 2 })).not.toThrow();
  });
});
