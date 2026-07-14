import type { BlockType } from '../../lib/pbTypes';
import type { SlashCommand } from './slashCommands';
import { SlashMenu } from './SlashMenu';
import { MentionMenu } from './MentionMenu';
import type { MentionItem } from './useMention';

interface BlockMenusProps {
  matches: SlashCommand[] | null;
  active: number;
  onPick: (type: BlockType) => void;
  mention: {
    open: boolean;
    matches: MentionItem[];
    active: number;
    pick: (item: MentionItem) => void;
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
        <MentionMenu items={mention.matches} active={mention.active} onPick={mention.pick} />
      )}
    </>
  );
}
