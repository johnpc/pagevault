import { useRef } from 'react';

/** A read-only ref, as returned by useLatestRef — a stable box holding a value
 * that is always the latest as of the current render. */
export type LatestRef<T> = { readonly current: T };

/**
 * A ref that always holds the latest `value`, updated on every render. Use it to
 * read fresh data inside an event handler WITHOUT listing that data in the
 * handler's useCallback deps — so the handler keeps a stable identity across
 * renders (which keeps memoized children from re-rendering) while still seeing
 * the current value when it actually fires.
 *
 * Only correct for values read at call time (event handlers, effects that read
 * on demand) — never for values used during render, where a ref read would be a
 * stale-closure bug. Written during render (not in an effect) so the very first
 * handler call after a change already sees the new value.
 */
export function useLatestRef<T>(value: T): LatestRef<T> {
  const ref = useRef(value);
  ref.current = value;
  return ref;
}
