import { usePopover } from '../shell/usePopover';

/** The default callout icon when none is chosen. */
export const DEFAULT_CALLOUT_EMOJI = '💡';

/** A small, curated set of callout icons (Notion offers a full picker; these
 * cover the common note/warning/info/success intents). */
const EMOJIS = ['💡', '⚠️', '✅', '❌', '📌', 'ℹ️', '🔥', '⭐', '📝', '🚀', '❓', '💬'];

/** A picker for a callout block's leading icon: a button showing the current
 * emoji that opens a grid to choose another. Mirrors ColorMenu's popover shape. */
export function CalloutIcon({ value, onPick }: { value: string; onPick: (emoji: string) => void }) {
  const { open, setOpen, close, triggerRef, menuRef, onKeyDown } = usePopover<HTMLUListElement>();
  const current = value || DEFAULT_CALLOUT_EMOJI;

  return (
    <span className="pv-callout-pick" onKeyDown={onKeyDown}>
      <button
        ref={triggerRef}
        className="pv-callout-icon"
        aria-label="Callout icon"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        {current}
      </button>
      {open && (
        <ul ref={menuRef} className="pv-callout-emojis" role="listbox" aria-label="Callout icon">
          {EMOJIS.map((e) => (
            <li key={e}>
              <button
                type="button"
                role="option"
                aria-selected={e === current}
                aria-label={`Icon ${e}`}
                className={`pv-callout-emoji${e === current ? ' pv-callout-emoji--on' : ''}`}
                onClick={() => {
                  onPick(e);
                  close();
                }}
              >
                {e}
              </button>
            </li>
          ))}
        </ul>
      )}
    </span>
  );
}
