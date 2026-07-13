import { createBdd } from 'playwright-bdd';
import { expect, type Page } from '@playwright/test';
import { uniqueTitle } from './uniqueTitle';

const { When, Then } = createBdd();

const active = (page: Page) =>
  page.locator('.ion-page:not(.ion-page-hidden)').filter({ visible: true }).last();
const refs = (page: Page) => active(page).locator('.pv-backlinks');

// The backlinks query only sees a mention once its block save has persisted, and
// the section renders after the (owner-scoped) query resolves — so poll on it.
Then('I see {string} under linked references', async ({ page, $testInfo }, title: string) => {
  await expect(refs(page).getByText(uniqueTitle(title, $testInfo), { exact: false })).toBeVisible();
});

When('I follow the linked reference {string}', async ({ page, $testInfo }, title: string) => {
  await refs(page)
    .locator('.pv-backlink', { hasText: uniqueTitle(title, $testInfo) })
    .first()
    .click();
});
