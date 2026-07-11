import { createBdd } from 'playwright-bdd';
import { expect, type Page } from '@playwright/test';

const { When, Then } = createBdd();

const active = (page: Page) =>
  page.locator('.ion-page:not(.ion-page-hidden)').filter({ visible: true }).last();

/** Open the page-font picker in the actions row and choose a font by label. */
When('I set the page font to {string}', async ({ page }, label: string) => {
  await active(page).getByLabel('Page font').click();
  const menu = active(page).getByRole('listbox', { name: 'Page font' });
  await expect(menu).toBeVisible();
  await menu.getByRole('option', { name: label, exact: true }).click();
});

/** The page container carries the font's body class — asserted on the rendered
 * page, so a reopen check also proves the choice persisted. */
Then('the page uses the {string} font', async ({ page }, token: string) => {
  await expect(active(page).locator(`.pv-page.pv-font-${token}`)).toBeVisible();
});
