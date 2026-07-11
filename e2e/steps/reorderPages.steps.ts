import { createBdd } from 'playwright-bdd';
import { expect, type Page } from '@playwright/test';

const { When, Then } = createBdd();

const tree = (page: Page) => page.locator('.pv-sidebar-tree');
const row = (page: Page, title: string) =>
  tree(page).locator('.pv-sidebar-row', { hasText: title }).first();

When(
  'I drag the sidebar page {string} above {string}',
  async ({ page }, from: string, to: string) => {
    // HTML5 drag: Playwright's real-mouse dragTo doesn't reliably fire dragstart/
    // drop, so dispatch the drag events directly (with a shared DataTransfer) —
    // exactly the events the row's React handlers listen for.
    const src = row(page, from);
    const dst = row(page, to);
    await src.evaluate((el) => {
      const dt = new DataTransfer();
      el.dispatchEvent(new DragEvent('dragstart', { bubbles: true, dataTransfer: dt }));
      (window as unknown as { __dt: DataTransfer }).__dt = dt;
    });
    await dst.evaluate((el) => {
      const dt = (window as unknown as { __dt: DataTransfer }).__dt;
      el.dispatchEvent(new DragEvent('dragover', { bubbles: true, dataTransfer: dt }));
      el.dispatchEvent(new DragEvent('drop', { bubbles: true, dataTransfer: dt }));
    });
    await expect
      .poll(async () => {
        const titles = await tree(page).locator('.pv-sidebar-title').allInnerTexts();
        return titles.indexOf(from) < titles.indexOf(to);
      })
      .toBe(true);
  },
);

When('I reload the app', async ({ page }) => {
  await page.reload();
  // Wait for the signed-in shell before reading the tree again.
  await expect(page.getByRole('button', { name: '+ New page' })).toBeVisible();
});

Then(
  'the sidebar page order starts with {string} then {string}',
  async ({ page }, first: string, second: string) => {
    await expect
      .poll(async () => {
        const titles = await tree(page).locator('.pv-sidebar-title').allInnerTexts();
        const i = titles.indexOf(first);
        const j = titles.indexOf(second);
        return i !== -1 && j !== -1 && i < j;
      })
      .toBe(true);
  },
);
