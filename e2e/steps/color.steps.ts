import { createBdd } from 'playwright-bdd';
import { expect, type Page } from '@playwright/test';

const { When, Then } = createBdd();

const active = (page: Page) =>
  page.locator('.ion-page:not(.ion-page-hidden)').filter({ visible: true }).last();

// Opens the block's color picker (via its hover control) and chooses a color.
When('I set the block color to {string}', async ({ page }, label: string) => {
  await active(page).getByLabel('Block color').first().click();
  const menu = active(page).getByRole('listbox', { name: 'Block color' });
  await expect(menu).toBeVisible();
  await menu.getByRole('option', { name: label }).click();
});

// Asserts some block row carries the tint class (persisted color).
Then('the block is tinted {string}', async ({ page }, token: string) => {
  await expect
    .poll(() => active(page).locator(`.pv-block.pv-color--${token}`).count())
    .toBeGreaterThan(0);
});

const colorMenu = (page: Page) => active(page).getByRole('listbox', { name: 'Block color' });

When('I open the block color menu', async ({ page }) => {
  await active(page).getByLabel('Block color').first().click();
});

Then('the block color menu is open', async ({ page }) => {
  await expect(colorMenu(page)).toBeVisible();
});

When('I press Escape in the color menu', async ({ page }) => {
  await colorMenu(page).press('Escape');
});

Then('the block color menu is closed', async ({ page }) => {
  await expect(colorMenu(page)).toBeHidden();
});
