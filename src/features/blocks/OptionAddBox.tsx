import type { useOptionPicker } from './useOptionPicker';

/** The bottom row of a select/multiselect picker: a text box that filters the
 * options as you type and, when the query matches nothing, offers a "Create
 * <query>" action (also fired by Enter). Shared by both cell pickers. */
export function OptionAddBox({
  label,
  picker,
}: {
  label: string;
  picker: ReturnType<typeof useOptionPicker>;
}) {
  const { draft, setDraft, creatable, commitCreate } = picker;
  return (
    <li className="pv-multiselect-add">
      <input
        type="text"
        aria-label={`Add an option to ${label}`}
        placeholder="Filter or add…"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            commitCreate();
          }
        }}
      />
      {creatable && (
        <button type="button" className="pv-opt-create" onClick={commitCreate}>
          Create “{creatable}”
        </button>
      )}
    </li>
  );
}
