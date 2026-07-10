import { IonRouterOutlet } from '@ionic/react';
import { Route, Redirect } from 'react-router-dom';
import { Sidebar } from '../pages/Sidebar';
import { HomeScreen } from './HomeScreen';
import { PageEditor } from '../pages/PageEditor';
import { Trash } from '../pages/Trash';
import { QuickFind } from '../search/QuickFind';
import { useQuickFind } from '../search/useQuickFind';
import './Workspace.css';

/**
 * The authenticated shell: a persistent left sidebar beside the routed content.
 * IonRouterOutlet matches only its DIRECT <Route> children, so the routes are
 * spread here directly (never wrapped in a fragment) to avoid 404 shadowing.
 */
export function Workspace() {
  const { open, setOpen } = useQuickFind();
  return (
    <div className="pv-workspace">
      <Sidebar onSearch={() => setOpen(true)} />
      <div className="pv-workspace-content">
        <IonRouterOutlet>
          <Route exact path="/" component={HomeScreen} />
          <Route exact path="/trash" component={Trash} />
          <Route exact path="/page/:id" component={PageEditor} />
          <Redirect to="/" />
        </IonRouterOutlet>
      </div>
      {open && <QuickFind onClose={() => setOpen(false)} />}
    </div>
  );
}
