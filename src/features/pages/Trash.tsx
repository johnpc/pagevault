import { IonContent, IonPage } from '@ionic/react';
import { useArchivedPages, useRestorePage, useDeletePage } from './pagesApi';
import { LoadState } from '../shell/LoadState';
import { TrashRow } from './TrashRow';
import './Trash.css';

/** The trash: archived pages with restore / delete-forever. Soft-deleted pages
 * land here (Move to trash) and can be recovered or permanently removed. */
export function Trash() {
  const { data, isLoading, isError, refetch } = useArchivedPages();
  const restore = useRestorePage();
  const remove = useDeletePage();
  const pages = data ?? [];

  return (
    <IonPage>
      <IonContent>
        <div className="pv-trash">
          <h1 className="pv-heading">Trash</h1>
          <p className="pv-muted">Restore a page, or delete it permanently.</p>
          <LoadState
            loading={isLoading}
            error={isError}
            empty={pages.length === 0}
            onRetry={refetch}
            emptyTitle="Trash is empty"
            skeletonRows={4}
          >
            <ul className="pv-trash-list">
              {pages.map((page) => (
                <TrashRow
                  key={page.id}
                  page={page}
                  onRestore={(id) => restore.mutate(id)}
                  onDelete={(id) => remove.mutate(id)}
                />
              ))}
            </ul>
          </LoadState>
        </div>
      </IonContent>
    </IonPage>
  );
}
