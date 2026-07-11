import { createBdd } from 'playwright-bdd';
import { expect, type Page } from '@playwright/test';

const { When, Then } = createBdd();

const active = (page: Page) =>
  page.locator('.ion-page:not(.ion-page-hidden)').filter({ visible: true }).last();
const codeBlock = (page: Page) => active(page).locator('.pv-block--code').last();

/** Open the code block's language picker and choose a language by label. */
When('I set the code language to {string}', async ({ page }, label: string) => {
  // The block must have become a code block via the ``` shortcut first.
  await expect(codeBlock(page)).toBeVisible();
  await codeBlock(page).getByLabel('Code language').click();
  const menu = active(page).getByRole('listbox', { name: 'Code language' });
  await expect(menu).toBeVisible();
  await menu.getByRole('option', { name: label, exact: true }).click();
});

/** The code block's language button shows the given label — asserted on the
 * persisted block, so it also proves the language survived a reopen. */
Then('the code block is labelled {string}', async ({ page }, label: string) => {
  await expect(codeBlock(page).getByLabel('Code language')).toHaveText(label);
});
