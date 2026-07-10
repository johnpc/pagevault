import { IonContent, IonPage } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { usePages, useCreatePage } from '../pages/pagesApi';
import './HomeScreen.css';

/** The landing surface when no page is selected — a friendly prompt to begin. */
export function HomeScreen() {
  const history = useHistory();
  const { data: pages } = usePages();
  const create = useCreatePage();

  const start = async () => {
    const page = await create.mutateAsync({ title: 'Getting started', siblings: pages ?? [] });
    history.push(`/page/${page.id}`);
  };

  return (
    <IonPage>
      <IonContent>
        <div className="pv-home">
          <h1 className="pv-heading">Welcome to PageVault</h1>
          <p className="pv-muted">
            Your self-hosted workspace. Pick a page from the sidebar, or create your first one.
          </p>
          <button className="pv-home-cta" onClick={start} disabled={create.isPending}>
            Create a page
          </button>
        </div>
      </IonContent>
    </IonPage>
  );
}
