import { useState } from 'react';
import type { TableData } from '../../lib/pbTypes';
import { saveView, applyView, deleteView } from './tableViewConfig';

/** Saved-view bar: chips for each saved view (click to apply its filters /
 * board mode / column visibility), plus a small form to save the current config
 * under a name. Views are a lens over the data; applying one never edits rows. */
export function TableViews({ data, save }: { data: TableData; save: (next: TableData) => void }) {
  const [name, setName] = useState('');
  const views = data.views ?? [];

  const onSave = () => {
    if (!name.trim()) return;
    save(saveView(data, name));
    setName('');
  };

  return (
    <div className="pv-table-views-saved">
      {views.map((v) => (
        <span className="pv-saved-view" key={v.name}>
          <button
            className="pv-saved-view-apply"
            aria-label={`Apply view ${v.name}`}
            onClick={() => save(applyView(data, v))}
          >
            {v.name}
          </button>
          <button
            className="pv-saved-view-del"
            aria-label={`Delete view ${v.name}`}
            onClick={() => save(deleteView(data, v.name))}
          >
            ×
          </button>
        </span>
      ))}
      <input
        className="pv-saved-view-name"
        aria-label="Save view name"
        placeholder="Save view as…"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onSave();
        }}
      />
      <button className="pv-saved-view-save pv-muted" aria-label="Save view" onClick={onSave}>
        Save
      </button>
    </div>
  );
}
