import { createBdd } from 'playwright-bdd';
import { expect, type Page } from '@playwright/test';
import { uniqueTitle } from './uniqueTitle';

const { When, Then } = createBdd();

const tree = (page: Page) => page.locator('.pv-sidebar-tree');
const row = (page: Page, title: string) =>
  tree(page).locator('.pv-sidebar-row', { hasText: title }).first();

// Position of a title among the sidebar rows. Rows carry per-attempt UNIQUE
// titles, so find by substring (the unique title contains the base) rather than
// an exact index of the base name.
const orderedBefore = async (page: Page, a: string, b: string) => {
  const titles = await tree(page).locator('.pv-sidebar-title').allInnerTexts();
  const i = titles.findIndex((t) => t.includes(a));
  const j = titles.findIndex((t) => t.includes(b));
  return i !== -1 && j !== -1 && i < j;
};

When(
  'I drag the sidebar page {string} above {string}',
  async ({ page, $testInfo }, from: string, to: string) => {
    const fromU = uniqueTitle(from, $testInfo);
    const toU = uniqueTitle(to, $testInfo);
    // HTML5 drag: Playwright's real-mouse dragTo doesn't reliably fire dragstart/
    // drop, so dispatch the drag events directly (with a shared DataTransfer) —
    // exactly the events the row's React handlers listen for.
    await row(page, fromU).evaluate((el) => {
      const dt = new DataTransfer();
      el.dispatchEvent(new DragEvent('dragstart', { bubbles: true, dataTransfer: dt }));
      (window as unknown as { __dt: DataTransfer }).__dt = dt;
    });
    await row(page, toU).evaluate((el) => {
      const dt = (window as unknown as { __dt: DataTransfer }).__dt;
      el.dispatchEvent(new DragEvent('dragover', { bubbles: true, dataTransfer: dt }));
      el.dispatchEvent(new DragEvent('drop', { bubbles: true, dataTransfer: dt }));
    });
    await expect.poll(() => orderedBefore(page, fromU, toU)).toBe(true);
  },
);

When('I reload the app', async ({ page }) => {
  await page.reload();
  // Wait for the signed-in shell before reading the tree again.
  await expect(page.getByRole('button', { name: 'New page' })).toBeVisible();
});

Then(
  'the sidebar page order starts with {string} then {string}',
  async ({ page, $testInfo }, first: string, second: string) => {
    await expect
      .poll(() =>
        orderedBefore(page, uniqueTitle(first, $testInfo), uniqueTitle(second, $testInfo)),
      )
      .toBe(true);
  },
);
