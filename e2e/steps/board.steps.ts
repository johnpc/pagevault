import { createBdd } from 'playwright-bdd';
import { expect, type Page } from '@playwright/test';

const { When, Then } = createBdd();

const active = (page: Page) =>
  page.locator('.ion-page:not(.ion-page-hidden)').filter({ visible: true }).last();
const board = (page: Page) => active(page).locator('.pv-board').last();

When('I switch the table to the board view', async ({ page }) => {
  await active(page).getByRole('tab', { name: 'Board' }).last().click();
  await expect(board(page)).toBeVisible();
});

Then('the board has a column {string}', async ({ page }, label: string) => {
  await expect(board(page).locator('.pv-board-col-head', { hasText: label }).first()).toBeVisible();
});

Then('the board card reads {string}', async ({ page }, text: string) => {
  await expect
    .poll(() =>
      board(page)
        .locator('.pv-board-card input')
        .evaluateAll((els, t) => els.some((el) => (el as HTMLInputElement).value === t), text),
    )
    .toBe(true);
});

Then('the table is in the board view', async ({ page }) => {
  await expect(board(page)).toBeVisible();
});
