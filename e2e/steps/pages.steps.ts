import { createBdd } from 'playwright-bdd';
import { expect, type Page } from '@playwright/test';

const { Given, When, Then } = createBdd();

/** The sidebar row for a page title. EXACT text match (not substring) so
 * "Notes" doesn't also match "Meeting notes"; `.first()` guards against a retry
 * having created a duplicate on the shared backend. */
const sidebarRow = (page: Page, title: string) =>
  page.locator('.pv-sidebar-tree').getByText(title, { exact: true }).first();

/** Create a page via the sidebar and rename it by typing into the title. */
async function createPageTitled(page: Page, title: string) {
  await page.getByRole('button', { name: '+ New page' }).click();
  const titleInput = active(page).getByLabel('Page title');
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

// Ionic keeps the previous route's page mounted (hidden) during transitions,
// so scope queries to the truly VISIBLE page — filtering on visibility (not just
// the absence of .ion-page-hidden) so a page animating out isn't picked.
const active = (page: import('@playwright/test').Page) =>
  page.locator('.ion-page:not(.ion-page-hidden)').filter({ visible: true }).last();

When('I open the page {string}', async ({ page }, title: string) => {
  await sidebarRow(page, title).click();
  await expect(active(page).getByLabel('Page title')).toHaveValue(title);
});

When('I reopen the page {string}', async ({ page }, title: string) => {
  await page.goto('/');
  await sidebarRow(page, title).click();
  await expect(active(page).getByLabel('Page title')).toHaveValue(title);
});

When('I add a block with the text {string}', async ({ page }, text: string) => {
  await active(page).getByRole('button', { name: '+ Add a block' }).click();
  const input = active(page).getByLabel('Block content').last();
  // Type character-by-character so markdown shortcuts (e.g. "- ") fire — a
  // one-shot fill() would bypass the per-keystroke transform.
  await input.pressSequentially(text);
  await input.blur();
});

Then('the last block should be a {string} block', async ({ page }, type: string) => {
  // The block wrapper carries a pv-block--<type> class; assert on the real DOM.
  await expect(active(page).locator(`.pv-block.pv-block--${type}`).last()).toBeVisible();
});

When('I type {string} into a new block', async ({ page }, text: string) => {
  // Add a block and type into it WITHOUT blurring — so the slash menu stays open.
  await active(page).getByRole('button', { name: '+ Add a block' }).click();
  await active(page).getByLabel('Block content').last().pressSequentially(text);
});

When('I choose {string} from the slash menu', async ({ page }, label: string) => {
  await expect(active(page).getByRole('listbox', { name: 'Block types' })).toBeVisible();
  await active(page).getByRole('option', { name: label }).click();
});

When('I search for {string}', async ({ page }, query: string) => {
  await page
    .getByRole('button', { name: /Search/ })
    .first()
    .click();
  await page.getByLabel('Search pages').fill(query);
});

When('I open the search result {string}', async ({ page }, title: string) => {
  const dialog = page.getByRole('dialog', { name: 'Quick find' });
  await dialog.getByText(title, { exact: true }).first().click();
});

Then('I should see the open page titled {string}', async ({ page }, title: string) => {
  // Ionic can keep an outgoing page mounted mid-transition, so assert that SOME
  // visible page-title input holds the expected value (not a specific one).
  await expect
    .poll(() =>
      page.getByLabel('Page title').evaluateAll(
        (els, t) =>
          els.some((el) => {
            const i = el as HTMLInputElement;
            return i.offsetParent !== null && i.value === t;
          }),
        title,
      ),
    )
    .toBe(true);
});

When('I add a sub-page', async ({ page }) => {
  await active(page).getByRole('button', { name: '+ Add a sub-page' }).click();
});

When('I name the open page {string}', async ({ page }, title: string) => {
  const input = active(page).getByLabel('Page title');
  await input.fill(title);
  await input.blur();
});

Then(
  'the breadcrumb for {string} should include {string}',
  async ({ page }, child: string, ancestor: string) => {
    // After naming the open page there's no route transition, so the active
    // page's own breadcrumb is deterministic for this browser. Assert its trail
    // shows both the ancestor and the current page.
    const crumb = active(page).getByTestId('breadcrumb');
    await expect(crumb).toContainText(ancestor);
    await expect(crumb).toContainText(child);
  },
);

When('I move the page to trash', async ({ page }) => {
  await active(page).getByRole('button', { name: 'Move to trash' }).click();
});

Then('I should not see {string} in the sidebar', async ({ page }, title: string) => {
  await expect(sidebarRow(page, title)).toHaveCount(0);
});

When('I restore {string} from the trash', async ({ page }, title: string) => {
  await page.getByRole('button', { name: '🗑 Trash' }).click();
  const row = active(page).locator('.pv-trash-row').filter({ hasText: title }).first();
  await row.getByRole('button', { name: 'Restore' }).click();
});

const blockInputs = (page: import('@playwright/test').Page) =>
  active(page).locator('textarea.pv-block-input');

/** Index of the block whose textarea's live value equals `text`. */
async function blockIndexByText(page: import('@playwright/test').Page, text: string) {
  return blockInputs(page).evaluateAll(
    (els, t) => els.findIndex((el) => (el as HTMLTextAreaElement).value === t),
    text,
  );
}

When(
  'I drag the block {string} above the block {string}',
  async ({ page }, from: string, to: string) => {
    const fromIdx = await blockIndexByText(page, from);
    const toIdx = await blockIndexByText(page, to);
    const blocks = active(page).locator('.pv-block');
    // Drag the source block's handle onto the target block (native HTML5 DnD).
    await blocks
      .nth(fromIdx)
      .getByLabel(/drag to reorder/i)
      .dragTo(blocks.nth(toIdx));
  },
);

Then('the first block should contain {string}', async ({ page }, text: string) => {
  await expect
    .poll(() =>
      blockInputs(page)
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
      blockInputs(page).evaluateAll(
        (els, t) => els.some((el) => (el as HTMLTextAreaElement).value.includes(t)),
        text,
      ),
    )
    .toBe(true);
});
