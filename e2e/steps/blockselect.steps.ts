import { createBdd } from 'playwright-bdd';
import { expect, type Page } from '@playwright/test';

const { When, Then } = createBdd();

const active = (page: Page) =>
  page.locator('.ion-page:not(.ion-page-hidden)').filter({ visible: true }).last();
const inputs = (page: Page) => active(page).locator('textarea.pv-block-input');

/** From the last block, select upward across every block using Shift+ArrowUp.
 * The first press (caret at the block start) hands off to block selection and
 * blurs the field; from then on keys go to the document, so press on the page
 * keyboard rather than a focused element. */
When('I select the last {int} blocks upward', async ({ page }, n: number) => {
  const last = inputs(page).last();
  await last.click();
  // Put the caret at the very start (Home is unreliable on macOS textareas) so
  // the first Shift+Up hands off to block selection instead of moving within the
  // field. The first press selects 2 rows; each further press adds one.
  await last.evaluate((el) => (el as HTMLTextAreaElement).setSelectionRange(0, 0));
  for (let i = 0; i < n - 1; i++) {
    await page.keyboard.press('Shift+ArrowUp');
  }
});

When('I press Backspace to delete the selection', async ({ page }) => {
  await page.keyboard.press('Backspace');
});

Then('the page has {int} blocks', async ({ page }, n: number) => {
  await expect.poll(() => inputs(page).count()).toBe(n);
});

Then('the page has {int} block', async ({ page }, n: number) => {
  await expect.poll(() => inputs(page).count()).toBe(n);
});
