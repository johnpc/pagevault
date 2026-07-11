import { useState } from 'react';
import type { BlockRecord } from '../../lib/pbClient';

/** An image block: renders the image from its URL (in `content`), or a URL
 * input when empty/editing. Clicking the image re-opens the input. */
export function ImageBlock({
  block,
  onEdit,
}: {
  block: BlockRecord;
  onEdit: (id: string, patch: Partial<BlockRecord>) => void;
}) {
  const [editing, setEditing] = useState(block.content === '');
  const [url, setUrl] = useState(block.content);

  const save = () => {
    setEditing(false);
    if (url !== block.content) onEdit(block.id, { content: url });
  };

  if (editing || block.content === '') {
    return (
      <input
        className="pv-block-input"
        aria-label="Image URL"
        placeholder="Paste an image URL…"
        value={url}
        autoFocus
        onChange={(e) => setUrl(e.target.value)}
        onBlur={save}
        onKeyDown={(e) => e.key === 'Enter' && save()}
      />
    );
  }

  return (
    <img
      className="pv-block-image"
      src={block.content}
      alt="Page image"
      onClick={() => setEditing(true)}
    />
  );
}
