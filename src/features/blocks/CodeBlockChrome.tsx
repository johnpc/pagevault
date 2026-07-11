import type { BlockRecord } from '../../lib/pbClient';
import { CopyButton } from './CopyButton';
import { CodeLangMenu } from './CodeLangMenu';

/** The chrome overlaid on a code block: the language label/picker (always) and
 * the copy button (once there's something to copy). Kept out of TextBlockBody
 * so that body stays render-only and short. */
export function CodeBlockChrome({
  block,
  value,
  onEdit,
}: {
  block: BlockRecord;
  value: string;
  onEdit: (id: string, patch: Partial<BlockRecord>) => void;
}) {
  if (block.type !== 'code') return null;
  return (
    <>
      <CodeLangMenu current={block.lang ?? ''} onPick={(lang) => onEdit(block.id, { lang })} />
      {value !== '' && <CopyButton text={value} />}
    </>
  );
}
