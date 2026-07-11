import { createBdd } from 'playwright-bdd';
import { expect, type Page } from '@playwright/test';

const { When, Then } = createBdd();

const active = (page: Page) =>
  page.locator('.ion-page:not(.ion-page-hidden)').filter({ visible: true }).last();
const focused = (page: Page) => active(page).locator('textarea.pv-block-input:focus');
const inputs = (page: Page) => active(page).locator('textarea.pv-block-input');

// Places the caret right after `prefix` in the focused block, then presses Enter
// — the split should carry the trailing text into a new block below.
When('I press Enter with the caret after {string}', async ({ page }, prefix: string) => {
  const before = await inputs(page).count();
  await focused(page).evaluate((el, n) => {
    const ta = el as HTMLTextAreaElement;
    ta.setSelectionRange(n, n);
  }, prefix.length);
  await focused(page).press('Enter');
  await expect.poll(() => inputs(page).count()).toBeGreaterThan(before);
});

// Presses Enter on an already-empty, focused list item (which should exit the
// list / outdent rather than create yet another bullet). No new block is added,
// so we can't poll on count — settle on the re-render instead.
When('I press Enter on the empty list item', async ({ page }) => {
  await focused(page).press('Enter');
  await expect(focused(page)).toHaveValue('');
});

// Asserts the block value directly BELOW the one whose value contains `head`
// carries `tail` — proving the split inserted right below, not at the page end.
Then('the block below {string} contains {string}', async ({ page }, head: string, tail: string) => {
  await expect
    .poll(() =>
      inputs(page).evaluateAll(
        (els, [h, t]) => {
          const vals = els.map((el) => (el as HTMLTextAreaElement).value);
          const i = vals.findIndex((v) => v.includes(h));
          return i !== -1 && i + 1 < vals.length && vals[i + 1].includes(t);
        },
        [head, tail],
      ),
    )
    .toBe(true);
});

Then('the document has a {string} block that is empty', async ({ page }, type: string) => {
  await expect
    .poll(() =>
      active(page)
        .locator(`.pv-block--${type} textarea.pv-block-input`)
        .evaluateAll((els) => els.some((el) => (el as HTMLTextAreaElement).value === '')),
    )
    .toBe(true);
});
