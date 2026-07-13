import { useBlockCursors } from './usePresence';
import { viewerHue } from './viewerHue';
import './BlockCursors.css';

/** Live-cursor name-tags for the collaborators currently focused in this block.
 * Renders nothing when nobody else is here. Each tag is tinted by the viewer's
 * stable hue so a person's avatar and cursor share a color. */
export function BlockCursors({ blockId }: { blockId: string }) {
  const cursors = useBlockCursors(blockId);
  if (cursors.length === 0) return null;
  return (
    <div className="pv-cursors" aria-hidden="true">
      {cursors.map((v) => (
        <span key={v.id} className="pv-cursor-tag" style={{ backgroundColor: viewerHue(v.id) }}>
          {v.label}
        </span>
      ))}
    </div>
  );
}
