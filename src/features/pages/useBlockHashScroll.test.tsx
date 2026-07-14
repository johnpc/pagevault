import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useBlockHashScroll } from './useBlockHashScroll';
import { blockAnchorId } from '../blocks/tocData';

describe('useBlockHashScroll', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  const addBlock = (id: string) => {
    const el = document.createElement('div');
    el.id = blockAnchorId(id);
    el.scrollIntoView = vi.fn();
    document.body.appendChild(el);
    return el;
  };

  it('scrolls to + flashes the block named in the hash once ready', () => {
    const el = addBlock('blk1');
    renderHook(() => useBlockHashScroll('#pv-block-blk1', true));
    expect(el.scrollIntoView).toHaveBeenCalled();
    expect(el.classList.contains('pv-block-flash')).toBe(true);
  });

  it('does nothing until ready (block not yet rendered)', () => {
    const el = addBlock('blk1');
    renderHook(() => useBlockHashScroll('#pv-block-blk1', false));
    expect(el.scrollIntoView).not.toHaveBeenCalled();
  });

  it('is a no-op for a non-block hash or a missing element', () => {
    const el = addBlock('blk1');
    renderHook(() => useBlockHashScroll('#section-2', true));
    expect(el.scrollIntoView).not.toHaveBeenCalled();
    renderHook(() => useBlockHashScroll('#pv-block-nope', true)); // no such element
  });
});
