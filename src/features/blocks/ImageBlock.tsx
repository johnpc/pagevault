import { useRef, useState } from 'react';
import type { BlockRecord } from '../../lib/pbClient';
import { imageSrc, hasImageSource } from './imageSource';

/** An image block: renders an uploaded file or a remote URL. When it has no
 * source (or is being edited) it shows an Upload button + URL input; clicking a
 * rendered image re-opens that editor. */
export function ImageBlock({
  block,
  onEdit,
  onUpload,
}: {
  block: BlockRecord;
  onEdit: (id: string, patch: Partial<BlockRecord>) => void;
  onUpload: (id: string, file: File) => void;
}) {
  const [editing, setEditing] = useState(!hasImageSource(block));
  const [url, setUrl] = useState(block.content);
  const fileRef = useRef<HTMLInputElement>(null);

  const saveUrl = () => {
    setEditing(false);
    if (url !== block.content) onEdit(block.id, { content: url });
  };

  const pickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(block.id, file);
      setEditing(false);
    }
  };

  if (editing || !hasImageSource(block)) {
    return (
      <div className="pv-image-edit">
        <button className="pv-image-upload" onClick={() => fileRef.current?.click()}>
          ⬆ Upload image
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          aria-label="Upload image file"
          hidden
          onChange={pickFile}
        />
        <input
          className="pv-block-input"
          aria-label="Image URL"
          placeholder="…or paste an image URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onBlur={saveUrl}
          onKeyDown={(e) => e.key === 'Enter' && saveUrl()}
        />
      </div>
    );
  }

  return (
    <img
      className="pv-block-image"
      src={imageSrc(block)}
      alt="Page image"
      onClick={() => setEditing(true)}
    />
  );
}
