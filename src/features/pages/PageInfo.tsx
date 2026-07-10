import type { PageRecord, BlockRecord } from '../../lib/pbClient';
import { pageStats, relativeTime } from './pageStats';
import './PageInfo.css';

/** A quiet footer under the block list: word/block counts + last edited. */
export function PageInfo({ page, blocks }: { page: PageRecord; blocks: BlockRecord[] }) {
  const { words, blocks: count } = pageStats(blocks);
  const edited = relativeTime(page.updated, Date.now());
  return (
    <footer className="pv-page-info pv-muted">
      <span>
        {words} word{words === 1 ? '' : 's'}
      </span>
      <span>·</span>
      <span>
        {count} block{count === 1 ? '' : 's'}
      </span>
      {edited && (
        <>
          <span>·</span>
          <span>Edited {edited}</span>
        </>
      )}
    </footer>
  );
}
