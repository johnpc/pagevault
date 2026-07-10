// Passthrough service worker — its mere presence makes PageVault installable as
// a PWA. It intentionally does no caching (the app talks to a live PocketBase),
// so there's no stale-content risk. Fetches fall through to the network.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));
