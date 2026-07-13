import type { Viewer } from './activeViewers';
import './PresenceAvatars.css';

const MAX_SHOWN = 4;

/** An avatar stack of the other people currently viewing this page. Each avatar
 * is the viewer's initial, tinted by a stable hue from their id; the title shows
 * the full label. Overflow beyond MAX_SHOWN collapses into a "+N" chip. Renders
 * nothing when nobody else is here. */
export function PresenceAvatars({ viewers }: { viewers: Viewer[] }) {
  if (viewers.length === 0) return null;
  const shown = viewers.slice(0, MAX_SHOWN);
  const overflow = viewers.length - shown.length;
  const label =
    viewers.length === 1 ? `${viewers[0].label} is viewing` : `${viewers.length} people viewing`;

  return (
    <div className="pv-presence" aria-label={label}>
      {shown.map((v) => (
        <span
          key={v.id}
          className="pv-presence-avatar"
          style={{ backgroundColor: hueFor(v.id) }}
          title={`${v.label} is viewing`}
        >
          {v.initial}
        </span>
      ))}
      {overflow > 0 && (
        <span className="pv-presence-avatar pv-presence-more" title={label}>
          +{overflow}
        </span>
      )}
    </div>
  );
}

/** A stable, pleasant HSL color derived from the viewer's id. Pure. */
function hueFor(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 360;
  return `hsl(${h} 55% 45%)`;
}
