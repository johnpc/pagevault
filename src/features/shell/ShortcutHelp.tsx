import { useRef } from 'react';
import { SHORTCUTS } from './shortcuts';
import { useDialogFocusTrap } from './useDialogFocusTrap';
import './ShortcutHelp.css';

/** The "?" keyboard-shortcut reference overlay. A modal dialog: focus is
 * trapped inside it (Tab cycles) and it's announced as aria-modal. */
export function ShortcutHelp({ onClose }: { onClose: () => void }) {
  const dialogRef = useRef<HTMLDivElement>(null);
  useDialogFocusTrap(dialogRef, true);
  return (
    <div className="pv-help-backdrop" onClick={onClose}>
      <div
        ref={dialogRef}
        className="pv-help"
        role="dialog"
        aria-modal="true"
        aria-label="Keyboard shortcuts"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="pv-heading">Keyboard shortcuts</h2>
        <dl className="pv-help-list">
          {SHORTCUTS.map((s) => (
            <div key={s.keys} className="pv-help-row">
              <dt>
                <kbd className="pv-kbd">{s.keys}</kbd>
              </dt>
              <dd className="pv-muted">{s.action}</dd>
            </div>
          ))}
        </dl>
        <button className="pv-help-close" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
