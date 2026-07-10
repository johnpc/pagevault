import { useState, type FormEvent } from 'react';
import { IonContent, IonPage } from '@ionic/react';
import { useAuth } from './useAuth';
import './AuthScreen.css';

/** Sign-in / register screen. The only unauthenticated surface in the app. */
export function AuthScreen() {
  const { signIn, register, loading, error } = useAuth();
  const [mode, setMode] = useState<'signin' | 'register'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const action = mode === 'signin' ? signIn : register;
    action(email, password).catch(() => undefined);
  };

  return (
    <IonPage>
      <IonContent className="pv-auth">
        <form className="pv-auth-card" onSubmit={submit}>
          <h1 className="pv-heading">PageVault</h1>
          <p className="pv-muted">Your self-hosted workspace for notes &amp; docs.</p>
          <input
            type="email"
            placeholder="Email"
            aria-label="Email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            aria-label="Password"
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && (
            <p className="pv-auth-error" role="alert">
              {error}
            </p>
          )}
          <button type="submit" disabled={loading}>
            {mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
          <button
            type="button"
            className="pv-auth-switch"
            onClick={() => setMode(mode === 'signin' ? 'register' : 'signin')}
          >
            {mode === 'signin' ? 'Need an account? Register' : 'Have an account? Sign in'}
          </button>
        </form>
      </IonContent>
    </IonPage>
  );
}
