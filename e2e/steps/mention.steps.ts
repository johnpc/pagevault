import { createBdd } from 'playwright-bdd';
import { expect, type Page } from '@playwright/test';

const { When, Then } = createBdd();

const active = (page: Page) =>
  page.locator('.ion-page:not(.ion-page-hidden)').filter({ visible: true }).last();
const focused = (page: Page) => active(page).locator('textarea.pv-block-input:focus');

// Types "@<title>" into the focused block, waits for the picker, and clicks the
// matching page — inserting the mention token.
When('I mention the page {string}', async ({ page }, title: string) => {
  await focused(page).pressSequentially(`@${title.slice(0, 3)}`);
  const menu = active(page).getByRole('listbox', { name: 'Link a page' });
  await expect(menu).toBeVisible();
  await menu.getByRole('option', { name: title }).click();
});

When('I click away from the block', async ({ page }) => {
  // Blur the textarea so the idle formatted preview (with the link) renders.
  await active(page)
    .locator('.pv-page')
    .click({ position: { x: 5, y: 5 } });
});

Then('the block shows a mention link to {string}', async ({ page }, title: string) => {
  await expect(active(page).getByRole('link', { name: `@${title}` })).toBeVisible();
});

When('I click the mention link {string}', async ({ page }, title: string) => {
  await active(page)
    .getByRole('link', { name: `@${title}` })
    .click();
});
