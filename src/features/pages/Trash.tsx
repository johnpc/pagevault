import { IonContent, IonPage } from '@ionic/react';
import { useArchivedPages, useRestorePage, useDeletePage } from './pagesApi';
import { displayTitle } from './pageTree';
import { LoadState } from '../shell/LoadState';
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
          >
            <ul className="pv-trash-list">
              {pages.map((page) => (
                <li key={page.id} className="pv-trash-row">
                  <span className="pv-trash-title">
                    {page.icon || '📄'} {displayTitle(page)}
                  </span>
                  <span className="pv-trash-actions">
                    <button className="pv-trash-restore" onClick={() => restore.mutate(page.id)}>
                      Restore
                    </button>
                    <button className="pv-trash-delete" onClick={() => remove.mutate(page.id)}>
                      Delete forever
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          </LoadState>
        </div>
      </IonContent>
    </IonPage>
  );
}
