import { createBdd } from 'playwright-bdd';
import { expect, type Page } from '@playwright/test';

const { When, Then } = createBdd();

const active = (page: Page) =>
  page.locator('.ion-page:not(.ion-page-hidden)').filter({ visible: true }).last();

// Opens the block's alignment picker (via its hover control) and chooses one.
When('I set the block alignment to {string}', async ({ page }, label: string) => {
  await active(page).getByLabel('Text alignment').first().click();
  const menu = active(page).getByRole('listbox', { name: 'Text alignment' });
  await expect(menu).toBeVisible();
  await menu.getByRole('option', { name: new RegExp(label) }).click();
});

// Asserts some block row carries the alignment modifier class (persisted).
Then('the block is aligned {string}', async ({ page }, token: string) => {
  await expect
    .poll(() => active(page).locator(`.pv-block.pv-align--${token}`).count())
    .toBeGreaterThan(0);
});
