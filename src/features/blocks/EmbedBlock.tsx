import { useState } from 'react';
import type { BlockRecord } from '../../lib/pbClient';
import { embedFor } from './embedSource';

/** A video/audio embed block: renders a native <video>/<audio> for a direct
 * media file, or an <iframe> for a YouTube/Vimeo link. When empty or the URL
 * isn't a recognized media/embed link, it shows a URL input; the rendered media
 * has an edit affordance to change it. The URL lives in `content`. */
export function EmbedBlock({
  block,
  onEdit,
}: {
  block: BlockRecord;
  onEdit: (id: string, patch: Partial<BlockRecord>) => void;
}) {
  const embed = embedFor(block.content);
  const [editing, setEditing] = useState(embed.kind === 'none');
  const [url, setUrl] = useState(block.content);

  const save = () => {
    setEditing(false);
    if (url !== block.content) onEdit(block.id, { content: url });
  };

  if (editing || embed.kind === 'none') {
    return (
      <div className="pv-embed-edit">
        <input
          className="pv-block-input"
          aria-label="Embed URL"
          placeholder="Paste a video/audio or YouTube/Vimeo link…"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onBlur={save}
          onKeyDown={(e) => e.key === 'Enter' && save()}
        />
      </div>
    );
  }

  return (
    <div className="pv-embed" onDoubleClick={() => setEditing(true)}>
      {embed.kind === 'video' && <video className="pv-embed-media" src={embed.src} controls />}
      {embed.kind === 'audio' && <audio className="pv-embed-audio" src={embed.src} controls />}
      {embed.kind === 'iframe' && (
        <iframe
          className="pv-embed-frame"
          src={embed.src}
          title="Embedded media"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      )}
      <button
        className="pv-embed-edit-btn"
        aria-label="Edit embed"
        onClick={() => setEditing(true)}
      >
        ✎
      </button>
    </div>
  );
}
