import { describe, it, expect, vi } from 'vitest';
import { showToast, onToast, type ToastPayload } from './toastBus';

describe('toastBus', () => {
  it('delivers a message to a subscriber', () => {
    const seen: ToastPayload[] = [];
    const off = onToast((t) => seen.push(t));
    showToast('hi');
    expect(seen).toEqual([{ message: 'hi', action: undefined }]);
    off();
  });

  it('carries an optional action alongside the message', () => {
    const run = vi.fn();
    let received: ToastPayload | null = null;
    const off = onToast((t) => (received = t));
    showToast('Deleted', { label: 'Undo', run });
    expect(received!.message).toBe('Deleted');
    expect(received!.action?.label).toBe('Undo');
    received!.action?.run();
    expect(run).toHaveBeenCalledOnce();
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
    expect(a).toHaveBeenCalledWith({ message: 'x', action: undefined });
    expect(bcb).toHaveBeenCalledWith({ message: 'x', action: undefined });
    offA();
    offB();
  });
});
