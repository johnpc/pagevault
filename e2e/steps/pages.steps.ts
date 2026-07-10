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
  await input.fill(text);
  await input.blur();
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
