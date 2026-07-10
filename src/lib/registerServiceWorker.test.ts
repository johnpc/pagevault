import { describe, it, expect, vi, beforeEach } from 'vitest';
import { registerServiceWorker } from './registerServiceWorker';

describe('registerServiceWorker', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('no-ops when service workers are unsupported', () => {
    const original = navigator.serviceWorker;
    // @ts-expect-error force-remove for the test
    delete navigator.serviceWorker;
    expect(() => registerServiceWorker()).not.toThrow();
    if (original)
      Object.defineProperty(navigator, 'serviceWorker', { value: original, configurable: true });
  });

  it('registers on window load when supported', () => {
    const register = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'serviceWorker', {
      value: { register },
      configurable: true,
    });
    const addSpy = vi.spyOn(window, 'addEventListener');
    registerServiceWorker();
    // Invoke the queued load handler.
    const loadCall = addSpy.mock.calls.find(([evt]) => evt === 'load');
    (loadCall?.[1] as () => void)?.();
    expect(register).toHaveBeenCalledWith('/sw.js');
  });
});
