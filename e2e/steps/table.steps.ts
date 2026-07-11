import { createBdd } from 'playwright-bdd';
import { expect, type Page } from '@playwright/test';

const { When, Then } = createBdd();

const active = (page: Page) =>
  page.locator('.ion-page:not(.ion-page-hidden)').filter({ visible: true }).last();
const table = (page: Page) => active(page).locator('.pv-table').last();

When('I fill table cell {string} with {string}', async ({ page }, cell: string, value: string) => {
  const input = table(page).getByLabel(`Cell ${cell}`);
  await input.click();
  await input.fill(value);
  await input.blur();
  await expect(input).toHaveValue(value);
});

When('I add a table row', async ({ page }) => {
  const before = await table(page).locator('tbody tr').count();
  await active(page).getByRole('button', { name: '+ Add row' }).last().click();
  await expect.poll(() => table(page).locator('tbody tr').count()).toBeGreaterThan(before);
});

Then('the table has a cell containing {string}', async ({ page }, value: string) => {
  await expect
    .poll(() =>
      table(page)
        .locator('tbody input')
        .evaluateAll((els, v) => els.some((el) => (el as HTMLInputElement).value === v), value),
    )
    .toBe(true);
});

Then('the table has {int} body rows', async ({ page }, n: number) => {
  await expect(table(page).locator('tbody tr')).toHaveCount(n);
});

When('I set table column {int} type to {string}', async ({ page }, col: number, type: string) => {
  await table(page).getByLabel(`Column ${col} type`).selectOption(type);
  await expect(table(page).getByLabel(`Column ${col} type`)).toHaveValue(type);
});

const checkbox = (page: Page, r: number, c: number) => table(page).getByLabel(`Cell ${r},${c}`);

When(
  'I check the table checkbox in row {int} column {int}',
  async ({ page }, r: number, c: number) => {
    // The checkbox is controlled by the block's data, which updates via an async
    // mutation — so click (not .check(), which wants an instant state flip) and
    // poll until the round-trip lands.
    await checkbox(page, r, c).click();
    await expect(checkbox(page, r, c)).toBeChecked();
  },
);

Then(
  'the table checkbox in row {int} column {int} is checked',
  async ({ page }, r: number, c: number) => {
    await expect(checkbox(page, r, c)).toBeChecked();
  },
);
