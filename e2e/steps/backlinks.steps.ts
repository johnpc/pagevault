import { createBdd } from 'playwright-bdd';
import { expect, type Page } from '@playwright/test';

const { When, Then } = createBdd();

const active = (page: Page) =>
  page.locator('.ion-page:not(.ion-page-hidden)').filter({ visible: true }).last();
const refs = (page: Page) => active(page).locator('.pv-backlinks');

// The backlinks query only sees a mention once its block save has persisted, and
// the section renders after the (owner-scoped) query resolves — so poll on it.
Then('I see {string} under linked references', async ({ page }, title: string) => {
  await expect(refs(page).getByText(title, { exact: false })).toBeVisible();
});

When('I follow the linked reference {string}', async ({ page }, title: string) => {
  await refs(page).locator('.pv-backlink', { hasText: title }).first().click();
});
