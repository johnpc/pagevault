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

// Paste markdown into the currently-focused (empty) block — used with the "+"
// gutter to target an empty block that has blocks after it, proving the import
// lands the parsed rows in the target's slot rather than at the page end.
When(
  'I paste the markdown into the focused block:',
  async ({ page, context }, markdown: string) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    const before = await blockRows(page).count();
    await page.evaluate((text) => navigator.clipboard.writeText(text), markdown);
    // Import only fires on an empty target; find the empty block by value (a
    // dropped :focus between steps must not leave nothing matched) and paste.
    await expect
      .poll(async () => {
        const inputs = blockInputs(page);
        for (let i = 0; i < (await inputs.count()); i++) {
          if ((await inputs.nth(i).inputValue()) === '') {
            await inputs.nth(i).click();
            await inputs.nth(i).press('ControlOrMeta+v');
            break;
          }
        }
        return blockRows(page).count();
      })
      .toBeGreaterThan(before);
  },
);

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

// Fire a native paste event carrying a 1×1 PNG file at the focused empty block —
// the OS clipboard can't hold a File in headless Chromium, so build the
// DataTransfer in-page and dispatch it on the focused textarea.
When('I paste an image into a fresh block', async ({ page }) => {
  await active(page).getByRole('button', { name: '+ Add a block' }).click();
  const input = blockInputs(page).last();
  await input.click();
  await input.evaluate((el) => {
    const png =
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const bytes = Uint8Array.from(atob(png), (c) => c.charCodeAt(0));
    const file = new File([bytes], 'pasted.png', { type: 'image/png' });
    const dt = new DataTransfer();
    dt.items.add(file);
    el.dispatchEvent(
      new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }),
    );
  });
});

Then('the page has an image block', async ({ page }) => {
  await expect(active(page).locator('.pv-block--image').first()).toBeVisible();
});
