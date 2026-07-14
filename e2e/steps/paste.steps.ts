import { createBdd } from 'playwright-bdd';
import { expect, type Page } from '@playwright/test';

const { When, Then } = createBdd();

const active = (page: Page) =>
  page.locator('.ion-page:not(.ion-page-hidden)').filter({ visible: true }).last();
const focused = (page: Page) => active(page).locator('textarea.pv-block-input:focus');
const blockInputs = (page: Page) => active(page).locator('textarea.pv-block-input');
// Block ROWS are always present (an idle block with inline markup renders as a
// preview div, not a textarea) — the stable count to assert the import against.
const blockRows = (page: Page) => active(page).locator('.pv-block');

// Always paste into a brand-new empty block (import only fires on an empty
// target), so the scenario is immune to leftover blocks from a retry/re-run on
// the shared backend.
When('I focus a fresh empty block', async ({ page }) => {
  await active(page).getByRole('button', { name: '+ Add a block' }).click();
  const input = blockInputs(page).last();
  await input.click();
  await expect(focused(page)).toBeVisible();
});

// Puts the markdown on the real system clipboard and presses Ctrl/Cmd+V on the
// focused block — a genuine browser paste (real clipboardData; the synthetic
// ClipboardEvent constructor nulls clipboardData in Chromium). A paste keystroke
// is occasionally dropped headless, so re-press inside the poll until the import
// replaces the empty block with the parsed rows.
When('I paste the markdown:', async ({ page, context }, markdown: string) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  const before = await blockRows(page).count();
  await page.evaluate((text) => navigator.clipboard.writeText(text), markdown);
  // The fresh empty block is the last block input; target it directly so a lost
  // :focus state can't leave the locator matching nothing.
  const target = blockInputs(page).last();
  await expect
    .poll(async () => {
      // Re-focus the empty block each attempt (focus can drift across the step
      // boundary) then paste; a dropped keystroke simply retries next poll.
      await target.click();
      await target.press('ControlOrMeta+v');
      return blockRows(page).count();
    })
    .toBeGreaterThan(before);
});

// Type into a fresh block, then select all of it and paste a URL — exercising
// the "paste a URL over a selection → markdown link" gesture.
When(
  'I select all and paste the url {string} onto {string}',
  async ({ page, context }, url: string, text: string) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await active(page).getByRole('button', { name: '+ Add a block' }).click();
    const input = blockInputs(page).last();
    await input.click();
    await input.pressSequentially(text);
    await input.press('ControlOrMeta+a');
    await page.evaluate((u) => navigator.clipboard.writeText(u), url);
    await input.press('ControlOrMeta+v');
    await input.blur();
  },
);

Then(
  'the block renders a link {string} to {string}',
  async ({ page }, text: string, href: string) => {
    const link = active(page).locator('.pv-block-preview a.pv-link', { hasText: text }).first();
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('href', href);
  },
);
