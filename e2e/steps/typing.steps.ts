import { createBdd } from 'playwright-bdd';
import { expect, type Page } from '@playwright/test';

const { When, Then } = createBdd();

const active = (page: Page) =>
  page.locator('.ion-page:not(.ion-page-hidden)').filter({ visible: true }).last();

/** The block textarea that currently has focus (the caret's block). */
const focused = (page: Page) => active(page).locator('textarea.pv-block-input:focus');
const blockInputs = (page: Page) => active(page).locator('textarea.pv-block-input');

When('I focus the first block', async ({ page }) => {
  // A brand-new page has no blocks yet — add one, then focus it.
  const inputs = blockInputs(page);
  if ((await inputs.count()) === 0) {
    await active(page).getByRole('button', { name: '+ Add a block' }).click();
  }
  await inputs.first().click();
  await expect(focused(page)).toBeVisible();
});

// Types into the focused block, presses Enter, and WAITS for the new block to
// mount + take focus so the next step types into it (like a real user's flow).
When('I type {string} then Enter', async ({ page }, text: string) => {
  const before = await blockInputs(page).count();
  const input = focused(page);
  await input.pressSequentially(text);
  // A markdown shortcut ("# ", "- ", "1. ", "> ", "``` ") converts the block via
  // an async mutation that STRIPS the prefix. Pressing Enter before that lands
  // would split a still-plain block. Wait for the visible value to settle to the
  // post-conversion text (prefix consumed) so the split sees the right type.
  const expected = stripShortcutPrefix(text);
  if (expected !== text) await expect(input).toHaveValue(expected);
  await input.press('Enter');
  await expect.poll(() => blockInputs(page).count()).toBeGreaterThan(before);
  // The split lands the caret in a fresh EMPTY block below — wait for focus to
  // actually move there (not just the count) so the next type() doesn't race
  // into the old block and concatenate.
  await expect(focused(page)).toHaveValue('');
});

/** The visible text after a markdown-shortcut prefix is consumed, matching the
 * app's markdownShortcut() rules. Non-shortcut text is returned unchanged. */
function stripShortcutPrefix(text: string): string {
  const m = /^(# |## |### |[-*] |1\. |\[\] |\[ \] |> |``` )/.exec(text);
  return m ? text.slice(m[0].length) : text;
}

// Types WITHOUT Enter — for a two-part sequence (e.g. "``` " then the code body).
When('I type {string}', async ({ page }, text: string) => {
  await focused(page).pressSequentially(text);
});
When('type {string} then Enter', async ({ page }, text: string) => {
  const input = focused(page);
  await input.pressSequentially(text);
  await input.press('Enter');
});

// Tab/Shift-Tab persist a depth change via an async mutation; wait for the row's
// indent to actually reflect it before typing, so the assertion isn't racing.
const rowMargin = (page: Page) =>
  focused(page).evaluate((el) => {
    const row = (el as HTMLElement).closest('.pv-block') as HTMLElement | null;
    return parseFloat(row?.style.marginLeft || '0');
  });

When('I indent the current block', async ({ page }) => {
  const before = await rowMargin(page);
  await focused(page).press('Tab');
  await expect.poll(() => rowMargin(page)).toBeGreaterThan(before);
});
When('I outdent the current block', async ({ page }) => {
  const before = await rowMargin(page);
  await focused(page).press('Shift+Tab');
  await expect.poll(() => rowMargin(page)).toBeLessThan(before);
});

Then(
  'the document has a {string} block containing {string}',
  async ({ page }, type: string, text: string) => {
    // Match on the textarea's live value (content isn't in the DOM text).
    await expect
      .poll(() =>
        active(page)
          .locator(`.pv-block--${type} textarea.pv-block-input`)
          .evaluateAll(
            (els, t) => els.some((el) => (el as HTMLTextAreaElement).value.includes(t)),
            text,
          ),
      )
      .toBe(true);
  },
);

Then('the document has an indented block containing {string}', async ({ page }, text: string) => {
  await expect
    .poll(() =>
      active(page)
        .locator('.pv-block')
        .evaluateAll((els, t) => {
          return els.some((el) => {
            const ta = el.querySelector('textarea.pv-block-input') as HTMLTextAreaElement | null;
            const indented = parseFloat((el as HTMLElement).style.marginLeft || '0') > 0;
            return indented && !!ta && ta.value.includes(t);
          });
        }, text),
    )
    .toBe(true);
});
