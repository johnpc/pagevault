import { createBdd } from 'playwright-bdd';
import { expect, type Page } from '@playwright/test';

const { Given, When, Then } = createBdd();

/** The sidebar row for a page title. `.first()` guards against a retry having
 * created a duplicate on the shared backend (strict-mode would otherwise fail). */
const sidebarRow = (page: Page, title: string) =>
  page.locator('.pv-sidebar-title', { hasText: title }).first();

/** Create a page via the sidebar and rename it by typing into the title. */
async function createPageTitled(page: Page, title: string) {
  await page.getByRole('button', { name: '+ New page' }).click();
  const titleInput = page.getByLabel('Page title');
  await expect(titleInput).toBeVisible();
  await titleInput.fill(title);
  await titleInput.blur();
  // The sidebar row reflects the saved title.
  await expect(sidebarRow(page, title)).toBeVisible();
}

When('I create a new page titled {string}', async ({ page }, title: string) => {
  await createPageTitled(page, title);
});

Given('I have a page titled {string}', async ({ page }, title: string) => {
  await createPageTitled(page, title);
});

Then('I should see {string} in the sidebar', async ({ page }, title: string) => {
  await expect(sidebarRow(page, title)).toBeVisible();
});

When('I open the page {string}', async ({ page }, title: string) => {
  await sidebarRow(page, title).click();
  await expect(page.getByLabel('Page title')).toHaveValue(title);
});

When('I reopen the page {string}', async ({ page }, title: string) => {
  await page.goto('/');
  await sidebarRow(page, title).click();
  await expect(page.getByLabel('Page title')).toHaveValue(title);
});

When('I add a block with the text {string}', async ({ page }, text: string) => {
  await page.getByRole('button', { name: '+ Add a block' }).click();
  const input = page.getByLabel('Block content').last();
  // Type character-by-character so markdown shortcuts (e.g. "- ") fire — a
  // one-shot fill() would bypass the per-keystroke transform.
  await input.pressSequentially(text);
  await input.blur();
});

Then('the last block should be a {string} block', async ({ page }, type: string) => {
  // The block wrapper carries a pv-block--<type> class; assert on the real DOM.
  await expect(page.locator(`.pv-block.pv-block--${type}`).last()).toBeVisible();
});

/** Index of the block whose textarea's live value equals `text`. */
async function blockIndexByText(page: import('@playwright/test').Page, text: string) {
  return page
    .locator('textarea.pv-block-input')
    .evaluateAll((els, t) => els.findIndex((el) => (el as HTMLTextAreaElement).value === t), text);
}

When(
  'I drag the block {string} above the block {string}',
  async ({ page }, from: string, to: string) => {
    const fromIdx = await blockIndexByText(page, from);
    const toIdx = await blockIndexByText(page, to);
    // Drag the source block's handle onto the target block (native HTML5 DnD).
    await page
      .locator('.pv-block')
      .nth(fromIdx)
      .getByLabel(/drag to reorder/i)
      .dragTo(page.locator('.pv-block').nth(toIdx));
  },
);

Then('the first block should contain {string}', async ({ page }, text: string) => {
  await expect
    .poll(() =>
      page
        .locator('textarea.pv-block-input')
        .first()
        .evaluate((el) => (el as HTMLTextAreaElement).value),
    )
    .toContain(text);
});

Then('I should see a block containing {string}', async ({ page }, text: string) => {
  // Honest e2e: assert the real persisted block content is rendered. A block is
  // a textarea, whose VALUE (not text content) holds the string — so poll the
  // live input values until one matches.
  await expect
    .poll(() =>
      page
        .locator('textarea.pv-block-input')
        .evaluateAll(
          (els, t) => els.some((el) => (el as HTMLTextAreaElement).value.includes(t)),
          text,
        ),
    )
    .toBe(true);
});
