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

// A "list level" fingerprint of the focused block's row: list types score 1,
// plus the indent depth. Enter on an empty list item either outdents (depth
// drops) or exits to a plain paragraph (type score drops) — either way this
// number strictly decreases, giving one thing to wait on.
const focusedListLevel = (page: Page) =>
  focused(page).evaluate((el) => {
    const row = (el as HTMLElement).closest('.pv-block') as HTMLElement | null;
    if (!row) return -1;
    const isList = /pv-block--(bullet|numbered|todo)/.test(row.className);
    const depth = parseFloat(row.style.marginLeft || '0') / 24;
    return (isList ? 1 : 0) + depth;
  });

// Presses Enter on an already-empty, focused list item — one press either
// outdents a nested item (depth drops, still a list) or exits a top-level one to
// a paragraph. The block is already empty, so a value check proves nothing; poll
// until the list level actually drops (or is already 0), so a chained next step
// doesn't race the async transition and land in a still-a-list block.
When('I press Enter on the empty list item', async ({ page }) => {
  const before = await focusedListLevel(page);
  await focused(page).press('Enter');
  await expect.poll(() => focusedListLevel(page)).toBeLessThan(Math.max(before, 1));
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

// Focus the block whose textarea value equals `text` and put the caret at one
// end. (Content is a textarea value, not a text node, so match on inputValue.)
async function caretAt(page: Page, text: string, where: 'start' | 'end') {
  const ta = inputs(page);
  const count = await ta.count();
  for (let i = 0; i < count; i++) {
    const el = ta.nth(i);
    if ((await el.inputValue()) === text) {
      await el.click();
      await el.evaluate((node, w) => {
        const t = node as HTMLTextAreaElement;
        const pos = w === 'start' ? 0 : t.value.length;
        t.setSelectionRange(pos, pos);
      }, where);
      return;
    }
  }
  throw new Error(`no block with value "${text}"`);
}

When('I put the caret at the start of the block containing {string}', ({ page }, text: string) =>
  caretAt(page, text, 'start'),
);
When('I put the caret at the end of the block containing {string}', ({ page }, text: string) =>
  caretAt(page, text, 'end'),
);
When('I press ArrowUp in the block', ({ page }) => page.keyboard.press('ArrowUp'));
When('I press ArrowDown in the block', ({ page }) => page.keyboard.press('ArrowDown'));
When('I press Backspace in the block', ({ page }) => page.keyboard.press('Backspace'));
When('I press Delete in the block', ({ page }) => page.keyboard.press('Delete'));

Then('the block containing {string} is focused', async ({ page }, text: string) => {
  await expect
    .poll(() =>
      focused(page)
        .inputValue()
        .catch(() => null),
    )
    .toBe(text);
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
