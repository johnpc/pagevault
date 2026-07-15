import { useState } from 'react';
import type { PageRecord } from '../../lib/pbClient';
import { displayTitle } from './pageTree';

/** One archived page in the trash: Restore, plus a two-step Delete forever
 * (permanent + irreversible, so the first click arms a Confirm / Cancel pair
 * rather than deleting outright). Owns only the local armed state. */
export function TrashRow({
  page,
  onRestore,
  onDelete,
}: {
  page: PageRecord;
  onRestore: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const [armed, setArmed] = useState(false);

  return (
    <li className="pv-trash-row">
      <span className="pv-trash-title">
        {page.icon || '📄'} {displayTitle(page)}
      </span>
      <span className="pv-trash-actions">
        <button className="pv-trash-restore" onClick={() => onRestore(page.id)}>
          Restore
        </button>
        {armed ? (
          <>
            <button className="pv-trash-confirm" onClick={() => onDelete(page.id)}>
              Confirm delete
            </button>
            <button className="pv-trash-cancel pv-muted" onClick={() => setArmed(false)}>
              Cancel
            </button>
          </>
        ) : (
          <button className="pv-trash-delete" onClick={() => setArmed(true)}>
            Delete forever
          </button>
        )}
      </span>
    </li>
  );
}
