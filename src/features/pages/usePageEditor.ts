import { useCallback } from 'react';
import {
  usePage,
  useUpdatePage,
  useArchivePage,
  useCreatePage,
  useDuplicatePage,
  usePages,
  useToggleFavorite,
} from './pagesApi';
import { useUploadCover } from './uploadCoverApi';
import type { PageRecord } from '../../lib/pbClient';
import { useBlocks } from '../blocks/blocksApi';
import { useBlockActions } from '../blocks/useBlockActions';
import { pageToMarkdown, fileSlug } from '../blocks/exportMarkdown';
import { downloadText } from '../../lib/download';

/**
 * Orchestrates one page's editing surface: the page record + its blocks, plus
 * the mutations the editor needs. Block-list actions live in useBlockActions;
 * page-level actions are here.
 */
export function usePageEditor(pageId: string) {
  const page = usePage(pageId);
  const blocks = useBlocks(pageId);
  const updatePage = useUpdatePage();
  const archivePage = useArchivePage();
  const toggleFavorite = useToggleFavorite();
  const createPage = useCreatePage();
  const duplicatePage = useDuplicatePage();
  const uploadCover = useUploadCover();
  const allPages = usePages();
  const blockActions = useBlockActions(pageId, blocks.data ?? []);

  /** Duplicate this page + its blocks; returns the copy's id to navigate to. */
  const duplicate = useCallback(async () => {
    if (!page.data) return pageId;
    const siblings = (allPages.data ?? []).filter((p) => p.parent === page.data!.parent);
    return duplicatePage.mutateAsync({ source: page.data, blocks: blocks.data ?? [], siblings });
  }, [page.data, blocks.data, allPages.data, duplicatePage, pageId]);

  /** Create a child page under this one; returns the new page's id to navigate. */
  const addSubPage = useCallback(async () => {
    const siblings = (allPages.data ?? []).filter((p) => p.parent === pageId);
    const child = await createPage.mutateAsync({ parent: pageId, siblings });
    return child.id;
  }, [allPages.data, createPage, pageId]);

  // Single-field page patches (title/icon/cover/parent) all share one shape.
  const patch = useCallback(
    (p: Partial<PageRecord>) => updatePage.mutate({ id: pageId, patch: p }),
    [pageId, updatePage],
  );
  const setTitle = useCallback((title: string) => patch({ title }), [patch]);
  const setIcon = useCallback((icon: string) => patch({ icon }), [patch]);
  const setCover = useCallback((cover: string) => patch({ cover }), [patch]);
  const setParent = useCallback((parent: string) => patch({ parent }), [patch]);
  const setFullWidth = useCallback((fullWidth: boolean) => patch({ fullWidth }), [patch]);

  const setFavorite = useCallback(
    (favorite: boolean) => toggleFavorite.mutate({ id: pageId, favorite }),
    [pageId, toggleFavorite],
  );

  const setCoverImage = useCallback(
    (file: File) => uploadCover.mutate({ id: pageId, file }),
    [pageId, uploadCover],
  );

  /** Download the current page as a Markdown file. */
  const exportMarkdown = useCallback(() => {
    if (!page.data) return;
    downloadText(`${fileSlug(page.data.title)}.md`, pageToMarkdown(page.data, blocks.data ?? []));
  }, [page.data, blocks.data]);

  return {
    ...blockActions,
    addSubPage,
    duplicate,
    exportMarkdown,
    page,
    blocks,
    setTitle,
    setIcon,
    setFavorite,
    setCover,
    setCoverImage,
    setParent,
    setFullWidth,
    allPages,
    removePage: archivePage.mutateAsync,
  };
}
