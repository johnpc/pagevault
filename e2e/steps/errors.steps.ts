import { createBdd } from 'playwright-bdd';
import { expect, type Page } from '@playwright/test';

const { When, Then } = createBdd();

const active = (page: Page) =>
  page.locator('.ion-page:not(.ion-page-hidden)').filter({ visible: true }).last();

// Make every block write (PATCH/POST /collections/blocks/records...) fail, so the
// next save errors — the mutation's onError should surface a toast.
When('the backend starts rejecting block saves', async ({ page }) => {
  const fail = (route: { fulfill: (r: object) => Promise<void> }) =>
    route.fulfill({ status: 500, contentType: 'application/json', body: '{"message":"boom"}' });
  await page.route('**/api/collections/blocks/records', fail);
  await page.route('**/api/collections/blocks/records/**', fail);
});

// Blur the focused block so its pending edit saves (and fails), then assert the
// alert toast appears with the expected copy.
Then('I see a {string} toast', async ({ page }, text: string) => {
  await active(page).locator('textarea.pv-block-input:focus').blur();
  await expect(page.getByRole('alert').filter({ hasText: text })).toBeVisible();
});

// Make the pages LIST fetch (GET /collections/pages/records) fail, so a screen
// that reads usePages() must surface an error state instead of a silent blank.
When('the backend starts rejecting page loads', async ({ page }) => {
  await page.route('**/api/collections/pages/records**', (route) =>
    route.request().method() === 'GET'
      ? route.fulfill({ status: 500, contentType: 'application/json', body: '{"message":"boom"}' })
      : route.continue(),
  );
});

Then("the home screen's recent section offers a retry", async ({ page }) => {
  const section = active(page).locator('.pv-home-recent');
  await expect(section.getByRole('button', { name: 'Retry' })).toBeVisible();
  // The data-independent welcome + templates stay usable.
  await expect(active(page).getByText('Welcome to PageVault')).toBeVisible();
});
