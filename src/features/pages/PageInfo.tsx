import type { PageRecord, BlockRecord } from '../../lib/pbClient';
import { pageStats, relativeTime, todoProgress } from './pageStats';
import './PageInfo.css';

/** A quiet footer under the block list: word/block counts, to-do progress,
 * and last edited. */
export function PageInfo({ page, blocks }: { page: PageRecord; blocks: BlockRecord[] }) {
  const { words, blocks: count } = pageStats(blocks);
  const todos = todoProgress(blocks);
  const edited = relativeTime(page.updated, Date.now());
  return (
    // A div, not <footer>: this is a per-document stats line, not the app's
    // contentinfo landmark — a nested contentinfo landmark is an a11y violation.
    <div className="pv-page-info pv-muted">
      <span>
        {words} word{words === 1 ? '' : 's'}
      </span>
      <span>·</span>
      <span>
        {count} block{count === 1 ? '' : 's'}
      </span>
      {todos.total > 0 && (
        <>
          <span>·</span>
          <span>
            {todos.done}/{todos.total} to-dos done
          </span>
        </>
      )}
      {edited && (
        <>
          <span>·</span>
          <span>Edited {edited}</span>
        </>
      )}
    </div>
  );
}
