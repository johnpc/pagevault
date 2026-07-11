import { createBdd } from 'playwright-bdd';
import { expect, type Page } from '@playwright/test';

const { Then } = createBdd();

const active = (page: Page) =>
  page.locator('.ion-page:not(.ion-page-hidden)').filter({ visible: true }).last();

Then('the table of contents lists {string}', async ({ page }, heading: string) => {
  await expect(
    active(page).locator('.pv-toc').getByRole('button', { name: heading }),
  ).toBeVisible();
});
