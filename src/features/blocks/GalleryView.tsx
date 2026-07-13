import type { TableData } from '../../lib/pbTypes';
import type { TitleMap } from './cellText';
import { setCell, addRow } from './tableData';
import { galleryCards } from './galleryCards';

/** The gallery view of a table: each visible row is a card whose heading is the
 * first visible column (editable in place) and whose remaining visible columns
 * show as read-only label/value fields. Relation fields show the linked page's
 * title. Render-only; edits patch via `save`. */
export function GalleryView({
  data,
  save,
  titles,
}: {
  data: TableData;
  save: (next: TableData) => void;
  titles?: TitleMap;
}) {
  const cards = galleryCards(data, titles);
  return (
    <div className="pv-gallery">
      {cards.map((card) => (
        <div key={card.row} className="pv-gallery-card">
          <input
            className="pv-gallery-title"
            aria-label={`Card ${card.row + 1} title`}
            value={card.title}
            disabled={card.titleCol === -1}
            onChange={(e) => save(setCell(data, card.row, card.titleCol, e.target.value))}
          />
          <dl className="pv-gallery-fields">
            {card.fields.map((f) => (
              <div key={f.col} className="pv-gallery-field">
                <dt>{f.label}</dt>
                <dd>{f.value || <span className="pv-muted">—</span>}</dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
      <button className="pv-gallery-add pv-muted" onClick={() => save(addRow(data))}>
        + New card
      </button>
    </div>
  );
}
