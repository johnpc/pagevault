import { useEffect, useState } from 'react';

/**
 * The value `input`, but only after it has stopped changing for `delayMs`. Lets
 * a search box stay responsive (the raw input updates instantly) while the
 * expensive consumer — here a per-keystroke backend query — waits until typing
 * settles, so "hello" fires one search instead of five. The timer is injectable
 * for deterministic tests; production passes the default setTimeout/clearTimeout.
 */
export function useDebounced<T>(input: T, delayMs = 200): T {
  const [settled, setSettled] = useState(input);
  useEffect(() => {
    const id = setTimeout(() => setSettled(input), delayMs);
    return () => clearTimeout(id);
  }, [input, delayMs]);
  return settled;
}
