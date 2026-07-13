import { createBdd } from 'playwright-bdd';
import { expect, type Page } from '@playwright/test';

const { When, Then } = createBdd();

const active = (page: Page) =>
  page.locator('.ion-page:not(.ion-page-hidden)').filter({ visible: true }).last();
const wrap = (page: Page) => active(page).locator('.pv-table-wrap').last();
const groupHead = (page: Page, label: string) =>
  wrap(page).getByRole('button', { name: `Group ${label}` });

When('I turn on table grouping', async ({ page }) => {
  const btn = wrap(page).locator('.pv-table-group-btn');
  await btn.click();
  await expect(btn).toHaveAttribute('aria-pressed', 'true');
});

When('I collapse the table group {string}', async ({ page }, label: string) => {
  await groupHead(page, label).click();
});

Then('the table group {string} is expanded', async ({ page }, label: string) => {
  await expect(groupHead(page, label)).toHaveAttribute('aria-expanded', 'true');
});

Then('the table group {string} is collapsed', async ({ page }, label: string) => {
  await expect(groupHead(page, label)).toHaveAttribute('aria-expanded', 'false');
});
