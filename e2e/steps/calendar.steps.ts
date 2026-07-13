import { createBdd } from 'playwright-bdd';
import { expect, type Page } from '@playwright/test';

const { When, Then } = createBdd();

const active = (page: Page) =>
  page.locator('.ion-page:not(.ion-page-hidden)').filter({ visible: true }).last();
const wrap = (page: Page) => active(page).locator('.pv-table-wrap').last();
const calendar = (page: Page) => active(page).locator('.pv-calendar').last();

/** Today's local date as YYYY-MM-DD, so the event lands in the month the
 * calendar opens on (deterministic w.r.t. the assertion, not a fixed date). */
const todayIso = (): string => {
  const d = new Date();
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

When("I fill table cell {string} with today's date", async ({ page }, cell: string) => {
  const input = wrap(page).locator('.pv-table').last().getByLabel(`Cell ${cell}`);
  await input.click();
  await input.fill(todayIso());
  await input.blur();
  await expect(input).toHaveValue(todayIso());
});

When('I switch the table to the calendar view', async ({ page }) => {
  await active(page).getByRole('tab', { name: 'Calendar' }).last().click();
  await expect(calendar(page)).toBeVisible();
});

Then('the calendar shows the event {string}', async ({ page }, text: string) => {
  await expect(
    calendar(page).locator('.pv-calendar-event', { hasText: text }).first(),
  ).toBeVisible();
});

Then('the table is in the calendar view', async ({ page }) => {
  await expect(calendar(page)).toBeVisible();
});
