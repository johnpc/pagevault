import { IonRouterOutlet } from '@ionic/react';
import { Route, Redirect } from 'react-router-dom';
import { Sidebar } from '../pages/Sidebar';
import { HomeScreen } from './HomeScreen';
import { PageEditor } from '../pages/PageEditor';
import { JoinPage } from '../pages/JoinPage';
import { Trash } from '../pages/Trash';
import { Settings } from './Settings';
import { QuickFind } from '../search/QuickFind';
import { useQuickFind } from '../search/useQuickFind';
import { ShortcutHelp } from './ShortcutHelp';
import { useShortcutHelp } from './useShortcutHelp';
import { useRealtimeSync } from './useRealtimeSync';
import './Workspace.css';

/**
 * The authenticated shell: a persistent left sidebar beside the routed content.
 * IonRouterOutlet matches only its DIRECT <Route> children, so the routes are
 * spread here directly (never wrapped in a fragment) to avoid 404 shadowing.
 */
export function Workspace() {
  const { open, setOpen } = useQuickFind();
  const help = useShortcutHelp();
  useRealtimeSync();
  return (
    <div className="pv-workspace">
      <Sidebar onSearch={() => setOpen(true)} onHelp={() => help.setOpen(true)} />
      <div className="pv-workspace-content">
        <IonRouterOutlet>
          <Route exact path="/" component={HomeScreen} />
          <Route exact path="/trash" component={Trash} />
          <Route exact path="/settings" component={Settings} />
          <Route exact path="/page/:id" component={PageEditor} />
          <Route exact path="/join/:token" component={JoinPage} />
          <Redirect to="/" />
        </IonRouterOutlet>
      </div>
      {open && <QuickFind onClose={() => setOpen(false)} />}
      {help.open && <ShortcutHelp onClose={() => help.setOpen(false)} />}
    </div>
  );
}
