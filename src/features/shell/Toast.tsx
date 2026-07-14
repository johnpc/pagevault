import { useEffect, useState } from 'react';
import { onToast } from './toastBus';
import './Toast.css';

/** A single transient toast, bottom-center, for app-level messages (mainly a
 * failed save). Subscribes to the toast bus; each message shows for 4s then
 * auto-dismisses. role=alert so assistive tech announces it. */
export function Toast() {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const off = onToast((msg) => {
      setMessage(msg);
      clearTimeout(timer);
      timer = setTimeout(() => setMessage(null), 4000);
    });
    return () => {
      off();
      clearTimeout(timer);
    };
  }, []);

  if (!message) return null;
  return (
    <div className="pv-toast" role="alert">
      {message}
      <button className="pv-toast-close" aria-label="Dismiss" onClick={() => setMessage(null)}>
        ×
      </button>
    </div>
  );
}
