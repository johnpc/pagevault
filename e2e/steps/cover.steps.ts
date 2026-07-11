import { createBdd } from 'playwright-bdd';
import { expect, type Page } from '@playwright/test';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const { When, Then } = createBdd();

const here = dirname(fileURLToPath(import.meta.url));
const active = (page: Page) =>
  page.locator('.ion-page:not(.ion-page-hidden)').filter({ visible: true }).last();

When('I upload the cover fixture {string}', async ({ page }, name: string) => {
  await active(page)
    .getByLabel('Upload cover image')
    .setInputFiles(join(here, '..', 'fixtures', name));
});

// The cover strip's background must reference PocketBase file storage (/api/files),
// proving the uploaded cover landed and resolves via getURL.
Then('the page cover is served by PocketBase', async ({ page }) => {
  const strip = active(page).getByTestId('cover-strip');
  await expect(strip).toBeVisible();
  await expect
    .poll(() => strip.evaluate((el) => (el as HTMLElement).style.background))
    .toContain('/api/files/');
});
