import { useEffect, useState } from 'react';
import { onToast, type ToastPayload } from './toastBus';
import './Toast.css';

/** A single transient toast, bottom-center, for app-level messages (a failed
 * save, or a delete with an Undo action). Subscribes to the toast bus; each
 * message shows for 6s then auto-dismisses. role=alert so assistive tech
 * announces it. An optional action button (e.g. Undo) runs then dismisses. */
export function Toast() {
  const [toast, setToast] = useState<ToastPayload | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const off = onToast((t) => {
      setToast(t);
      clearTimeout(timer);
      timer = setTimeout(() => setToast(null), 6000);
    });
    return () => {
      off();
      clearTimeout(timer);
    };
  }, []);

  if (!toast) return null;
  return (
    <div className="pv-toast" role="alert">
      {toast.message}
      {toast.action && (
        <button
          className="pv-toast-action"
          onClick={() => {
            toast.action?.run();
            setToast(null);
          }}
        >
          {toast.action.label}
        </button>
      )}
      <button className="pv-toast-close" aria-label="Dismiss" onClick={() => setToast(null)}>
        ×
      </button>
    </div>
  );
}
