import { useState, type ReactNode } from 'react';

/** One option row in a select/multiselect picker: the primary control (a select
 * button or a checkbox label, passed as `children`) plus a ✎ rename and a ✕
 * remove affordance. Clicking ✎ swaps the row for an inline text input — Enter
 * commits the rename, Escape or blur cancels. Rename/remove bubble to the column
 * actions. Editing state is local so it doesn't disturb the memoized rows. */
export function OptionRow({
  option,
  onRename,
  onRemove,
  children,
}: {
  option: string;
  onRename: (to: string) => void;
  onRemove: () => void;
  children: ReactNode;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(option);

  if (editing) {
    const cancel = () => {
      setDraft(option);
      setEditing(false);
    };
    return (
      <li className="pv-opt-row">
        <input
          className="pv-opt-rename-input"
          aria-label={`New name for ${option}`}
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={cancel}
          onKeyDown={(e) => {
            // Keep Enter/Escape from bubbling to the popover (Escape would close
            // the whole picker) — here they commit / cancel just this rename.
            if (e.key === 'Enter') {
              e.preventDefault();
              e.stopPropagation();
              onRename(draft);
              setEditing(false);
            } else if (e.key === 'Escape') {
              e.preventDefault();
              e.stopPropagation();
              cancel();
            }
          }}
        />
      </li>
    );
  }

  return (
    <li className="pv-opt-row">
      {children}
      <button
        type="button"
        className="pv-opt-rename"
        aria-label={`Rename option ${option}`}
        onClick={() => {
          setDraft(option);
          setEditing(true);
        }}
      >
        ✎
      </button>
      <button
        type="button"
        className="pv-opt-remove"
        aria-label={`Remove option ${option}`}
        onClick={onRemove}
      >
        ✕
      </button>
    </li>
  );
}
