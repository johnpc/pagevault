import { useState } from 'react';
import { filterOptions, creatableOption } from './optionFilter';

/** The draft/query state for a select/multiselect picker's add-option box, with
 * the derived filtered options and the create-able name. `commitCreate` adds the
 * genuinely-new name (via the caller's onAddOption) and clears the query; typing
 * an existing name just filters. Keeps the cell components short + identical. */
export function useOptionPicker(options: string[], onAddOption: (option: string) => void) {
  const [draft, setDraft] = useState('');
  const filtered = filterOptions(options, draft);
  const creatable = creatableOption(options, draft);

  const commitCreate = () => {
    if (!creatable) return;
    onAddOption(creatable);
    setDraft('');
  };

  return { draft, setDraft, filtered, creatable, commitCreate };
}
