import { IonContent, IonPage } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { usePages } from '../pages/pagesApi';
import { recentPages, displayTitle } from '../pages/pageTree';
import { TemplatePicker } from '../pages/TemplatePicker';
import { LoadState } from './LoadState';
import './HomeScreen.css';

/** The landing surface: a welcome, template picker, and recently-edited pages. */
export function HomeScreen() {
  const history = useHistory();
  const { data: pages, isLoading, isError, refetch } = usePages();
  const recent = recentPages(pages ?? []);
  // Welcome + template picker never depend on data, so they always render. Only
  // "Recently edited" is data-driven: show a retry on error (so a failed load
  // isn't a silent blank) and a spinner while loading; when there simply are no
  // recent pages the whole section stays hidden (no empty box mid-home).
  const showRecent = isLoading || isError || recent.length > 0;

  return (
    <IonPage>
      <IonContent>
        <div className="pv-home">
          <h1 className="pv-heading">Welcome to PageVault</h1>
          <p className="pv-muted">Your self-hosted workspace. Start a new page from a template:</p>
          <TemplatePicker />

          {showRecent && (
            <section className="pv-home-recent">
              <h2 className="pv-home-section pv-muted">Recently edited</h2>
              <LoadState loading={isLoading} error={isError} empty={false} onRetry={refetch}>
                <div className="pv-home-grid">
                  {recent.map((page) => (
                    <button
                      key={page.id}
                      className="pv-home-card"
                      onClick={() => history.push(`/page/${page.id}`)}
                    >
                      <span className="pv-home-card-icon">{page.icon || '📄'}</span>
                      <span className="pv-home-card-title">{displayTitle(page)}</span>
                    </button>
                  ))}
                </div>
              </LoadState>
            </section>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
}
