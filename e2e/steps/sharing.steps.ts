import { createBdd } from 'playwright-bdd';
import { expect, type Page } from '@playwright/test';

const { When, Then } = createBdd();

const active = (page: Page) =>
  page.locator('.ion-page:not(.ion-page-hidden)').filter({ visible: true }).last();

// The share token for the current scenario, captured after enabling sharing.
const tokens = new WeakMap<object, string>();

When('I enable sharing for the page', async ({ page }) => {
  // Grant clipboard so the copy in ShareButton doesn't throw, then enable.
  await active(page).getByRole('button', { name: 'Share', exact: true }).click();
  // Once shared, the header shows "Copy link" — wait for that to confirm success.
  await expect(active(page).getByRole('button', { name: 'Copy share link' })).toBeVisible();
  // Read the token from the app's live query cache via the page record in the DOM
  // is unreliable; instead pull it from the PocketBase REST API as the signed-in
  // user (the browser holds the auth token in localStorage under 'pocketbase_auth').
  const base = process.env.VITE_PB_URL ?? 'http://localhost:8090';
  const token = await page.evaluate(async (pbUrl) => {
    const raw = localStorage.getItem('pocketbase_auth');
    const auth = raw ? JSON.parse(raw) : null;
    const res = await fetch(
      `${pbUrl}/api/collections/pages/records?filter=${encodeURIComponent('isPublic = true')}&sort=-updated&perPage=1`,
      { headers: { Authorization: auth?.token ?? '' } },
    );
    const data = await res.json();
    return data.items?.[0]?.shareToken ?? '';
  }, base);
  expect(token).not.toBe('');
  tokens.set(page, token);
});

When('I sign out', async ({ page }) => {
  await page.getByRole('button', { name: 'Sign out' }).click();
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
});

When('I visit the shared link', async ({ page }) => {
  await page.goto(`/shared/${tokens.get(page)}`);
});

Then('I should see the shared title {string}', async ({ page }, title: string) => {
  await expect(page.locator('.pv-shared-title')).toContainText(title);
});

Then('I should see the shared content {string}', async ({ page }, text: string) => {
  await expect(page.locator('.pv-shared-doc')).toContainText(text);
});

Then('the shared page shows a code block containing {string}', async ({ page }, text: string) => {
  // Code renders preformatted (a <pre>), not as inline-parsed markdown.
  await expect(page.locator('.pv-shared-doc pre.pv-shared-code')).toContainText(text);
});

Then('the shared page shows a heading {string}', async ({ page }, text: string) => {
  await expect(page.locator('.pv-shared-doc h2.pv-shared-h1', { hasText: text })).toBeVisible();
});

Then('the shared page shows a quote {string}', async ({ page }, text: string) => {
  await expect(page.locator('.pv-shared-doc blockquote', { hasText: text })).toBeVisible();
});

When('I visit a made-up share link', async ({ page }) => {
  await page.goto('/shared/nonexistent-token-xyz');
});

Then('I should see the {string} message', async ({ page }, msg: string) => {
  // "not shared" → the empty-state copy; matches "This page isn't shared".
  if (msg === 'not shared') {
    await expect(page.locator('.pv-shared')).toContainText(/isn.?t shared/i);
  }
});

Then('I should not see a connection error', async ({ page }) => {
  await expect(page.locator('.pv-shared')).not.toContainText(/connection/i);
});
