import { describe, it, expect, vi } from 'vitest';
import { showToast, onToast } from './toastBus';

describe('toastBus', () => {
  it('delivers a message to a subscriber', () => {
    const seen: string[] = [];
    const off = onToast((m) => seen.push(m));
    showToast('hi');
    expect(seen).toEqual(['hi']);
    off();
  });

  it('stops delivering after unsubscribe', () => {
    const fn = vi.fn();
    const off = onToast(fn);
    off();
    showToast('after');
    expect(fn).not.toHaveBeenCalled();
  });

  it('fans out to multiple subscribers', () => {
    const a = vi.fn();
    const bcb = vi.fn();
    const offA = onToast(a);
    const offB = onToast(bcb);
    showToast('x');
    expect(a).toHaveBeenCalledWith('x');
    expect(bcb).toHaveBeenCalledWith('x');
    offA();
    offB();
  });
});
