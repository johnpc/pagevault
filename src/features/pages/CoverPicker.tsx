import { useRef } from 'react';
import type { PageRecord } from '../../lib/pbClient';
import { COVERS } from './covers';
import { coverBackground } from './coverSource';

interface CoverPickerProps {
  page: Pick<PageRecord, 'id' | 'cover' | 'coverImage'>;
  onCover: (id: string) => void;
  onUpload: (file: File) => void;
}

/** The page cover: the current banner (uploaded image or gradient) plus gradient
 * swatches and an Upload button to set your own image. */
export function CoverPicker({ page, onCover, onUpload }: CoverPickerProps) {
  const background = coverBackground(page);
  const fileRef = useRef<HTMLInputElement>(null);

  const pickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
  };

  return (
    <div className="pv-cover">
      {background && (
        <div className="pv-cover-strip" data-testid="cover-strip" style={{ background }} />
      )}
      <div className="pv-cover-swatches" role="group" aria-label="Page cover">
        {COVERS.map((c) => (
          <button
            key={c.id}
            className={`pv-cover-swatch${page.cover === c.id ? ' pv-cover-swatch--on' : ''}`}
            aria-label={`Cover ${c.label}`}
            aria-pressed={page.cover === c.id}
            style={{ background: c.gradient }}
            onClick={() => onCover(page.cover === c.id ? '' : c.id)}
          />
        ))}
        <button className="pv-cover-upload" onClick={() => fileRef.current?.click()}>
          ⬆ Upload
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          aria-label="Upload cover image"
          hidden
          onChange={pickFile}
        />
      </div>
    </div>
  );
}
