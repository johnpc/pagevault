import { useHistory } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';

/** The sidebar's footer nav: Trash, Settings, Shortcuts, Sign out. On a phone the
 * text labels collapse (see Workspace.css) leaving the emoji icons tappable in the
 * slim rail, so every action stays reachable. */
export function SidebarFooter({ onHelp }: { onHelp: () => void }) {
  const history = useHistory();
  const { signOut } = useAuth();

  return (
    <>
      <button
        className="pv-signout pv-muted"
        onClick={() => history.push('/trash')}
        aria-label="Trash"
      >
        🗑 <span className="pv-label">Trash</span>
      </button>
      <button
        className="pv-signout pv-muted"
        onClick={() => history.push('/settings')}
        aria-label="Settings"
      >
        ⚙ <span className="pv-label">Settings</span>
      </button>
      <button className="pv-signout pv-muted" onClick={onHelp} aria-label="Shortcuts">
        ⌨ <span className="pv-label">Shortcuts</span>
      </button>
      <button className="pv-signout pv-muted" onClick={signOut} aria-label="Sign out">
        🚪 <span className="pv-label">Sign out</span>
      </button>
    </>
  );
}
