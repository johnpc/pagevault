import { createBdd } from 'playwright-bdd';
import { expect, type Page } from '@playwright/test';
import { uniqueTitle } from './uniqueTitle';

const { When, Then } = createBdd();

const active = (page: Page) =>
  page.locator('.ion-page:not(.ion-page-hidden)').filter({ visible: true }).last();
const focused = (page: Page) => active(page).locator('textarea.pv-block-input:focus');

// Types "@<title>" into the focused block, waits for the picker, and clicks the
// matching page — inserting the mention token. The target page's title is
// uniquified per scenario attempt, so type + match on that.
When('I mention the page {string}', async ({ page, $testInfo }, title: string) => {
  const unique = uniqueTitle(title, $testInfo);
  await focused(page).pressSequentially(`@${unique.slice(0, 3)}`);
  const menu = active(page).getByRole('listbox', { name: 'Insert a mention' });
  await expect(menu).toBeVisible();
  // Match the option by an exact-text label span and take the first — robust to
  // other suites having left same-titled pages on a shared backend.
  await menu
    .getByRole('option')
    .filter({ has: page.getByText(unique, { exact: true }) })
    .first()
    .click();
});

When('I click away from the block', async ({ page }) => {
  // Blur the textarea so the idle formatted preview (with the link) renders.
  await active(page)
    .locator('.pv-page')
    .click({ position: { x: 5, y: 5 } });
});

Then('the block shows a mention link to {string}', async ({ page, $testInfo }, title: string) => {
  await expect(
    active(page)
      .getByRole('link', { name: `@${uniqueTitle(title, $testInfo)}` })
      .first(),
  ).toBeVisible();
});

When('I click the mention link {string}', async ({ page, $testInfo }, title: string) => {
  await active(page)
    .getByRole('link', { name: `@${uniqueTitle(title, $testInfo)}` })
    .first()
    .click();
});

// Type "@<keyword>" and pick the date mention from the @-menu (e.g. @today).
When('I insert the {string} date mention', async ({ page }, keyword: string) => {
  await focused(page).pressSequentially(`@${keyword}`);
  const menu = active(page).getByRole('listbox', { name: 'Insert a mention' });
  await expect(menu).toBeVisible();
  await menu.getByRole('option').first().click();
});

Then('the block contains a date like {string}', async ({ page }, pattern: string) => {
  const input = active(page).locator('textarea.pv-block-input').first();
  await expect
    .poll(() => input.evaluate((el) => (el as HTMLTextAreaElement).value))
    .toMatch(new RegExp(pattern));
});
