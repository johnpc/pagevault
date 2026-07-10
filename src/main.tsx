import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { registerServiceWorker } from './lib/registerServiceWorker';
import { applyTheme, readTheme } from './features/shell/theme';

// Apply the persisted theme choice before first paint (avoids a flash).
applyTheme(readTheme());

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// Make the app installable as a PWA.
registerServiceWorker();
