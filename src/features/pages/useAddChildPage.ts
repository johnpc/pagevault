import { useCallback, useRef } from 'react';
import type { useHistory } from 'react-router-dom';
import type { PageRecord } from '../../lib/pbClient';
import { writeCollapsed } from './expandStore';

type History = ReturnType<typeof useHistory>;
type Create = {
  mutateAsync: (i: { parent: string; siblings: PageRecord[] }) => Promise<PageRecord>;
};
type SetCollapsed = (updater: (prev: Set<string>) => Set<string>) => void;

/** A referentially-stable "add a sub-page under <parent>" callback for the
 * sidebar: create the child, expand the parent so it's visible, then open it.
 * A latest-ref holds the mutable deps so the callback identity never changes —
 * it's compared by the memoized SidebarRow, so a fresh identity each render
 * would bust every row's memo. */
export function useAddChildPage(
  pages: PageRecord[] | undefined,
  create: Create,
  history: History,
  setCollapsed: SetCollapsed,
) {
  const ref = useRef({ pages, create, history, setCollapsed });
  ref.current = { pages, create, history, setCollapsed };

  return useCallback(async (parent: string) => {
    const { pages: all, create: c, history: h, setCollapsed: setC } = ref.current;
    const siblings = (all ?? []).filter((p) => p.parent === parent);
    const child = await c.mutateAsync({ parent, siblings });
    setC((prev) => {
      const next = new Set(prev);
      next.delete(parent); // present = collapsed, so delete → expand
      writeCollapsed(next);
      return next;
    });
    h.push(`/page/${child.id}`);
  }, []);
}
