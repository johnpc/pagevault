import { COVERS, coverGradient } from './covers';

interface CoverPickerProps {
  cover: string;
  onCover: (id: string) => void;
}

/** The page cover: a gradient strip (when set) plus swatches to pick/clear it. */
export function CoverPicker({ cover, onCover }: CoverPickerProps) {
  const gradient = coverGradient(cover);
  return (
    <div className="pv-cover">
      {gradient && (
        <div
          className="pv-cover-strip"
          data-testid="cover-strip"
          style={{ background: gradient }}
        />
      )}
      <div className="pv-cover-swatches" role="group" aria-label="Page cover">
        {COVERS.map((c) => (
          <button
            key={c.id}
            className={`pv-cover-swatch${cover === c.id ? ' pv-cover-swatch--on' : ''}`}
            aria-label={`Cover ${c.label}`}
            aria-pressed={cover === c.id}
            style={{ background: c.gradient }}
            onClick={() => onCover(cover === c.id ? '' : c.id)}
          />
        ))}
      </div>
    </div>
  );
}
