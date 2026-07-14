import type { BlockType } from '../../lib/pbTypes';
import type { PageRecord } from '../../lib/pbClient';
import type { SlashCommand } from './slashCommands';
import { SlashMenu } from './SlashMenu';
import { MentionMenu } from './MentionMenu';

interface BlockMenusProps {
  matches: SlashCommand[] | null;
  active: number;
  onPick: (type: BlockType) => void;
  mention: {
    open: boolean;
    matches: PageRecord[];
    active: number;
    pick: (page: PageRecord) => void;
  };
}

/** The two floating pickers a text block can show: the slash block-type menu and
 * the @-mention page picker. Only one is open at a time in practice. Split out of
 * TextBlockBody to keep that component small. */
export function BlockMenus({ matches, active, onPick, mention }: BlockMenusProps) {
  return (
    <>
      {matches && <SlashMenu commands={matches} active={active} onPick={onPick} />}
      {mention.open && (
        <MentionMenu pages={mention.matches} active={mention.active} onPick={mention.pick} />
      )}
    </>
  );
}
