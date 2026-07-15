/** The trailing actions cell of a table row: duplicate the row, and (when it's
 * not the only row) delete it. Split from TableRow to keep that under the line
 * limit; render-only. `r` is the REAL row index so the actions hit the right row. */
export function TableRowActions({
  r,
  canDelete,
  onDuplicate,
  onDelete,
}: {
  r: number;
  canDelete: boolean;
  onDuplicate: (r: number) => void;
  onDelete: (r: number) => void;
}) {
  return (
    <td className="pv-table-rowdel">
      <button
        className="pv-table-rowdup"
        aria-label={`Duplicate row ${r + 1}`}
        onClick={() => onDuplicate(r)}
      >
        ⧉
      </button>
      {canDelete && (
        <button aria-label={`Delete row ${r + 1}`} onClick={() => onDelete(r)}>
          ×
        </button>
      )}
    </td>
  );
}
