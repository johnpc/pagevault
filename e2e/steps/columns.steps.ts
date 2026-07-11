import { createBdd } from 'playwright-bdd';
import { expect, type Page } from '@playwright/test';

const { When, Then } = createBdd();

const active = (page: Page) =>
  page.locator('.ion-page:not(.ion-page-hidden)').filter({ visible: true }).last();
const layout = (page: Page) => active(page).locator('.pv-columns').last();

const columnInput = (page: Page, n: number) =>
  layout(page).getByRole('textbox', { name: `Column ${n}`, exact: true });

When('I fill column {int} with {string}', async ({ page }, n: number, value: string) => {
  const input = columnInput(page, n);
  await input.click();
  await input.fill(value);
  await input.blur();
  await expect(input).toHaveValue(value);
});

When('I add a layout column', async ({ page }) => {
  const before = await layout(page).locator('.pv-column').count();
  await layout(page).getByLabel('Add column').click();
  await expect.poll(() => layout(page).locator('.pv-column').count()).toBeGreaterThan(before);
});

Then('the layout has {int} columns', async ({ page }, n: number) => {
  await expect(layout(page).locator('.pv-column')).toHaveCount(n);
});

Then('column {int} contains {string}', async ({ page }, n: number, value: string) => {
  await expect(columnInput(page, n)).toHaveValue(value);
});
