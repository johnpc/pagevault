import { SHORTCUTS } from './shortcuts';
import './ShortcutHelp.css';

/** The "?" keyboard-shortcut reference overlay. */
export function ShortcutHelp({ onClose }: { onClose: () => void }) {
  return (
    <div className="pv-help-backdrop" onClick={onClose}>
      <div
        className="pv-help"
        role="dialog"
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
