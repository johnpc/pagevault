import { useHistory, useParams } from 'react-router-dom';
import { IonContent, IonPage } from '@ionic/react';
import { usePageEditor } from './usePageEditor';
import { LoadState } from '../shell/LoadState';
import { PageHeader } from './PageHeader';
import { Breadcrumbs } from './Breadcrumbs';
import { BlockList } from './BlockList';
import { Backlinks } from './Backlinks';
import { useBlockDnd } from '../blocks/useBlockDnd';
import './PageEditor.css';

/** The main document surface: breadcrumbs + header + the editable block list. */
export function PageEditor() {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const { page, blocks, allPages, ...ed } = usePageEditor(id);
  const { setTitle, setIcon, setFavorite, setCover, setCoverImage, setParent } = ed;
  const { addBlock, editBlock, removeBlock, cloneBlock, indentBlock, importMarkdown } = ed;
  const { splitBlock, uploadImage, focusId, clearFocusId, moveBlockTo } = ed;
  const { removePage, addSubPage, duplicate, exportMarkdown } = ed;
  const dnd = useBlockDnd(moveBlockTo);

  const onDelete = async () => {
    await removePage(id);
    history.push('/');
  };

  const onSubPage = async () => history.push(`/page/${await addSubPage()}`);
  const onDuplicate = async () => history.push(`/page/${await duplicate()}`);

  return (
    <IonPage>
      <IonContent>
        <div className="pv-page">
          <LoadState
            loading={page.isLoading}
            error={page.isError}
            empty={false}
            onRetry={page.refetch}
          >
            {page.data && (
              <>
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
                />
                <BlockList
                  page={page.data}
                  blocks={blocks}
                  dnd={dnd}
                  onEdit={editBlock}
                  onRemove={removeBlock}
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
              </>
            )}
          </LoadState>
        </div>
      </IonContent>
    </IonPage>
  );
}
