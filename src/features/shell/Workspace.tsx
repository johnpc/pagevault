import { lazy, Suspense, type ComponentType } from 'react';
import { IonRouterOutlet } from '@ionic/react';
import { Route, Redirect } from 'react-router-dom';
import { Sidebar } from '../pages/Sidebar';
import { HomeScreen } from './HomeScreen';
import { QuickFind } from '../search/QuickFind';
import { useQuickFind } from '../search/useQuickFind';
import { ShortcutHelp } from './ShortcutHelp';
import { useShortcutHelp } from './useShortcutHelp';
import { useRealtimeSync } from './useRealtimeSync';
import { useSidebarToggle, workspaceClass } from './useSidebarToggle';
import { SidebarShowButton } from './SidebarShowButton';
import { RouteFallback } from './RouteFallback';
import './Workspace.css';

// The editor + its heavy block/table subsystem, plus the secondary screens, are
// code-split so the initial home-screen load doesn't parse them. Each resolves
// its named export to a default for React.lazy.
const PageEditorLazy = lazy(() =>
  import('../pages/PageEditor').then((m) => ({ default: m.PageEditor })),
);
const TrashLazy = lazy(() => import('../pages/Trash').then((m) => ({ default: m.Trash })));
const SettingsLazy = lazy(() => import('./Settings').then((m) => ({ default: m.Settings })));
const JoinPageLazy = lazy(() => import('../pages/JoinPage').then((m) => ({ default: m.JoinPage })));

// Wrap a lazy screen in Suspense so IonRouterOutlet still receives it via the
// Route `component` prop (Ionic manages the .ion-page lifecycle from that) —
// the Suspense boundary lives inside the component, not around the Route.
const suspended = (C: ComponentType): ComponentType =>
  function Suspended() {
    return (
      <Suspense fallback={<RouteFallback />}>
        <C />
      </Suspense>
    );
  };
const PageEditor = suspended(PageEditorLazy);
const Trash = suspended(TrashLazy);
const Settings = suspended(SettingsLazy);
const JoinPage = suspended(JoinPageLazy);

/**
 * The authenticated shell: a persistent left sidebar beside the routed content.
 * IonRouterOutlet matches only its DIRECT <Route> children, so the routes are
 * spread here directly (never wrapped in a fragment) to avoid 404 shadowing.
 */
export function Workspace() {
  const { open, setOpen } = useQuickFind();
  const help = useShortcutHelp();
  const sidebar = useSidebarToggle();
  useRealtimeSync();
  return (
    <div className={workspaceClass(sidebar.hidden)}>
      <SidebarShowButton hidden={sidebar.hidden} onShow={() => sidebar.setHidden(false)} />
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
