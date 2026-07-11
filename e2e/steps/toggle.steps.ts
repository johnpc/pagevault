import { createBdd } from 'playwright-bdd';
import { expect, type Page } from '@playwright/test';

const { When, Then } = createBdd();

const active = (page: Page) =>
  page.locator('.ion-page:not(.ion-page-hidden)').filter({ visible: true }).last();

// Collapse EVERY toggle on the page — robust to a retry/re-run having left extra
// toggles+children on the shared backend, so "should not see Passport" holds.
// Each collapse is async, so wait for the button count to actually drop before
// clicking the next one (a tight loop would re-click a not-yet-flipped toggle
// and reopen it).
When('I collapse the toggle', async ({ page }) => {
  const collapse = () => active(page).getByLabel('Collapse toggle');
  await expect(collapse().first()).toBeVisible();
  let remaining = await collapse().count();
  while (remaining > 0) {
    await collapse().first().click();
    await expect.poll(() => collapse().count()).toBeLessThan(remaining);
    remaining = await collapse().count();
  }
});

When('I expand the toggle', async ({ page }) => {
  await active(page).getByLabel('Expand toggle').first().click();
  await expect(active(page).getByLabel('Collapse toggle').first()).toBeVisible();
});

Then('I should not see a block containing {string}', async ({ page }, text: string) => {
  await expect
    .poll(() =>
      active(page)
        .locator('textarea.pv-block-input')
        .evaluateAll(
          (els, t) => els.some((el) => (el as HTMLTextAreaElement).value.includes(t)),
          text,
        ),
    )
    .toBe(false);
});
