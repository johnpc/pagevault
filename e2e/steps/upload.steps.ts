import { createBdd } from 'playwright-bdd';
import { expect, type Page } from '@playwright/test';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const { When, Then } = createBdd();

const here = dirname(fileURLToPath(import.meta.url));
const active = (page: Page) =>
  page.locator('.ion-page:not(.ion-page-hidden)').filter({ visible: true }).last();

When('I upload the image fixture {string}', async ({ page }, name: string) => {
  await active(page)
    .getByLabel('Upload image file')
    .setInputFiles(join(here, '..', 'fixtures', name));
});

// The rendered <img> must be served from PocketBase file storage (the /api/files
// path), not a remote URL — proving the upload landed and resolves via getURL.
Then('the page shows an uploaded image served by PocketBase', async ({ page }) => {
  const img = active(page).locator('img.pv-block-image').last();
  await expect(img).toBeVisible();
  await expect.poll(() => img.getAttribute('src')).toEqual(expect.stringContaining('/api/files/'));
});
