/** A tiny pub/sub for transient app messages (e.g. a failed save, or a delete
 * with an Undo). Framework-agnostic + side-effect free to import, so both the
 * query client (outside React) and the Toast component can use it. One message
 * at a time is enough here. */
export interface ToastAction {
  label: string;
  run: () => void;
}
export interface ToastPayload {
  message: string;
  action?: ToastAction;
}
type Listener = (toast: ToastPayload) => void;

const listeners = new Set<Listener>();

/** Show a transient message, optionally with a single action button (e.g.
 * "Undo"). Called from anywhere (incl. non-React code). */
export function showToast(message: string, action?: ToastAction): void {
  for (const l of listeners) l({ message, action });
}

/** Subscribe to messages; returns an unsubscribe. */
export function onToast(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
