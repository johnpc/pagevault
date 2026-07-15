import type { BlockType } from '../../lib/pbTypes';
import type { SlashCommand } from './slashCommands';
import { useScrollActiveIntoView } from './useScrollActiveIntoView';
import './SlashMenu.css';

interface SlashMenuProps {
  commands: SlashCommand[];
  active: number;
  onPick: (type: BlockType) => void;
}

/** The floating "/" command palette shown under a block while filtering. */
export function SlashMenu({ commands, active, onPick }: SlashMenuProps) {
  const activeRef = useScrollActiveIntoView<HTMLButtonElement>(active);
  // The parent only mounts this while a slash query is active, so an empty
  // command list means the query matched nothing — show "No results" rather
  // than vanishing (so the user knows they're still in slash mode).
  if (commands.length === 0) {
    return (
      <ul className="pv-slash" role="listbox" aria-label="Block types">
        <li className="pv-slash-empty">No matching blocks</li>
      </ul>
    );
  }
  return (
    <ul className="pv-slash" role="listbox" aria-label="Block types">
      {commands.map((cmd, i) => (
        <li key={cmd.type}>
          <button
            ref={i === active ? activeRef : undefined}
            type="button"
            role="option"
            aria-selected={i === active}
            className={`pv-slash-item${i === active ? ' pv-slash-item--active' : ''}`}
            // onMouseDown (not onClick) so it fires before the textarea blur.
            onMouseDown={(e) => {
              e.preventDefault();
              onPick(cmd.type);
            }}
          >
            <span className="pv-slash-icon">{cmd.icon}</span>
            <span>{cmd.label}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
