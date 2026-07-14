import { useHistory, useParams } from 'react-router-dom';
import { IonContent, IonPage } from '@ionic/react';
import { usePageEditor } from './usePageEditor';
import { LoadState } from '../shell/LoadState';
import { PageHeader } from './PageHeader';
import { Breadcrumbs } from './Breadcrumbs';
import { BlockList } from './BlockList';
import { Backlinks } from './Backlinks';
import { Comments } from '../comments/Comments';
import { useBlockDnd } from '../blocks/useBlockDnd';
import { useCollapseAll } from '../blocks/useCollapseAll';
import { PresenceProvider } from '../presence/PresenceProvider';
import { pageFontClass } from './pageFont';
import './PageEditor.css';

/** The main document surface: breadcrumbs + header + the editable block list. */
export function PageEditor() {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const { page, blocks, allPages, ...ed } = usePageEditor(id);
  const { setTitle, setIcon, setFavorite, setCover, setCoverImage, setParent, setFullWidth } = ed;
  const { setFont } = ed;
  const { addBlock, editBlock, removeBlock, removeBlocks, cloneBlock, indentBlock, indentMany } =
    ed;
  const { importMarkdown } = ed;
  const { splitBlock, uploadImage, focusId, clearFocusId, moveBlockTo } = ed;
  const { removePage, addSubPage, duplicate, exportMarkdown } = ed;
  const dnd = useBlockDnd(moveBlockTo);
  const collapse = useCollapseAll(id, blocks.data ?? []);

  const onDelete = async () => {
    await removePage(id);
    history.push('/');
  };

  const onSubPage = async () => history.push(`/page/${await addSubPage()}`);
  const onDuplicate = async () => history.push(`/page/${await duplicate()}`);

  return (
    <IonPage>
      <IonContent>
        <div
          className={`pv-page${page.data?.fullWidth ? ' pv-page--wide' : ''} ${pageFontClass(
            page.data?.font ?? '',
          )}`}
        >
          <LoadState
            loading={page.isLoading}
            error={page.isError}
            empty={false}
            onRetry={page.refetch}
          >
            {page.data && (
              <PresenceProvider pageId={id}>
                <Breadcrumbs pageId={id} />
                <PageHeader
                  page={page.data}
                  pages={allPages.data ?? []}
                  onTitle={setTitle}
                  onIcon={setIcon}
                  onDelete={onDelete}
                  onToggleFavorite={setFavorite}
                  onCover={setCover}
                  onCoverUpload={setCoverImage}
                  onMove={setParent}
                  onExport={exportMarkdown}
                  onDuplicate={onDuplicate}
                  onFullWidth={setFullWidth}
                  onFont={setFont}
                  collapse={collapse}
                />
                <BlockList
                  page={page.data}
                  blocks={blocks}
                  dnd={dnd}
                  onEdit={editBlock}
                  onRemove={removeBlock}
                  onRemoveMany={removeBlocks}
                  onIndentMany={indentMany}
                  onDuplicate={cloneBlock}
                  onIndent={indentBlock}
                  onPasteMarkdown={importMarkdown}
                  onSplit={splitBlock}
                  onUpload={uploadImage}
                  onAddBlock={addBlock}
                  onSubPage={onSubPage}
                  focusId={focusId}
                  onFocused={clearFocusId}
                />
                <Backlinks pageId={id} />
                <Comments pageId={id} />
              </PresenceProvider>
            )}
          </LoadState>
        </div>
      </IonContent>
    </IonPage>
  );
}
