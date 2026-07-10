import { IonContent, IonPage } from '@ionic/react';
import { useTheme } from './useTheme';
import { useAuth } from '../auth/useAuth';
import type { ThemeChoice } from './theme';
import './Settings.css';

const OPTIONS: { value: ThemeChoice; label: string; icon: string }[] = [
  { value: 'light', label: 'Light', icon: '☀️' },
  { value: 'dark', label: 'Dark', icon: '🌙' },
  { value: 'system', label: 'System', icon: '🖥️' },
];

/** Workspace settings: appearance (theme) + account. */
export function Settings() {
  const [theme, setTheme] = useTheme();
  const { user, signOut } = useAuth();

  return (
    <IonPage>
      <IonContent>
        <div className="pv-settings">
          <h1 className="pv-heading">Settings</h1>

          <section className="pv-settings-section">
            <h2 className="pv-settings-label">Appearance</h2>
            <div className="pv-theme-options" role="radiogroup" aria-label="Theme">
              {OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  role="radio"
                  aria-checked={theme === opt.value}
                  className={`pv-theme-option${theme === opt.value ? ' pv-theme-option--on' : ''}`}
                  onClick={() => setTheme(opt.value)}
                >
                  <span className="pv-theme-icon">{opt.icon}</span>
                  {opt.label}
                </button>
              ))}
            </div>
          </section>

          <section className="pv-settings-section">
            <h2 className="pv-settings-label">Account</h2>
            <p className="pv-muted">{user?.email}</p>
            <button className="pv-settings-signout" onClick={signOut}>
              Sign out
            </button>
          </section>
        </div>
      </IonContent>
    </IonPage>
  );
}
