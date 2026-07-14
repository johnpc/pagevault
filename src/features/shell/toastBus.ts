/** A tiny pub/sub for transient app messages (e.g. a failed save). Framework-
 * agnostic + side-effect free to import, so both the query client (outside React)
 * and the Toast component can use it. One message at a time is enough here. */
type Listener = (message: string) => void;

const listeners = new Set<Listener>();

/** Show a transient message. Called from anywhere (incl. non-React code). */
export function showToast(message: string): void {
  for (const l of listeners) l(message);
}

/** Subscribe to messages; returns an unsubscribe. */
export function onToast(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
