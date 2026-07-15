import { createBdd } from 'playwright-bdd';
import { expect, type Page } from '@playwright/test';

const { When, Then } = createBdd();

const active = (page: Page) =>
  page.locator('.ion-page:not(.ion-page-hidden)').filter({ visible: true }).last();
const inputs = (page: Page) => active(page).locator('textarea.pv-block-input');

/** From the last block, select upward across every block using Shift+ArrowUp.
 * The first press (caret at the block start) hands off to block selection and
 * blurs the field; from then on keys go to the document, so press on the page
 * keyboard rather than a focused element. */
When('I select the last {int} blocks upward', async ({ page }, n: number) => {
  const last = inputs(page).last();
  await last.click();
  // Put the caret at the very start (Home is unreliable on macOS textareas) so
  // the first Shift+Up hands off to block selection instead of moving within the
  // field. The first press selects 2 rows; each further press adds one.
  await last.evaluate((el) => (el as HTMLTextAreaElement).setSelectionRange(0, 0));
  for (let i = 0; i < n - 1; i++) {
    await page.keyboard.press('Shift+ArrowUp');
  }
});

When('I click into block {int}', async ({ page }, n: number) => {
  await inputs(page)
    .nth(n - 1)
    .click();
});

When('I shift-click block {int}', async ({ page }, n: number) => {
  await inputs(page)
    .nth(n - 1)
    .click({ modifiers: ['Shift'] });
  await expect(active(page).locator('.pv-block-selected').first()).toBeVisible();
});

When('I select all blocks with the select-all shortcut', async ({ page }) => {
  // Cmd/Ctrl+A once selects the focused block's text; a second press escalates
  // to selecting every block (Notion behavior). Press twice, then confirm.
  await inputs(page).last().click();
  await page.keyboard.press('ControlOrMeta+a');
  await page.keyboard.press('ControlOrMeta+a');
  await expect.poll(() => active(page).locator('.pv-block-selected').count()).toBeGreaterThan(1);
});

When('I press Backspace to delete the selection', async ({ page }) => {
  await page.keyboard.press('Backspace');
});

When('I press Tab to indent the selection', async ({ page }) => {
  await page.keyboard.press('Tab');
});

When('I press the duplicate shortcut on the selection', async ({ page }) => {
  await page.keyboard.press('ControlOrMeta+d');
});

When('I press the copy shortcut on the selection', async ({ page }) => {
  // Chromium needs explicit clipboard permission for navigator.clipboard in tests.
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.keyboard.press('ControlOrMeta+c');
});

When('I press the cut shortcut on the selection', async ({ page }) => {
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.keyboard.press('ControlOrMeta+x');
});

When('I duplicate the selection from the selection bar', async ({ page }) => {
  const bar = active(page).getByRole('toolbar', { name: 'Selected blocks' });
  await expect(bar).toBeVisible();
  await bar.getByLabel('Duplicate selected blocks').click();
});

When('I turn the selection into {string} from the selection bar', async ({ page }, label) => {
  const bar = active(page).getByRole('toolbar', { name: 'Selected blocks' });
  await expect(bar).toBeVisible();
  await bar.getByLabel('Turn into').click();
  await active(page)
    .getByRole('option', { name: new RegExp(label) })
    .click();
});

Then('blocks {int} and {int} are {string} blocks', async ({ page }, a, b, type) => {
  const rows = active(page).locator('.pv-block');
  const cls = (n: number) => rows.nth(n - 1).evaluate((el) => el.className);
  await expect.poll(() => cls(a)).toContain(`pv-block--${type}`);
  await expect.poll(() => cls(b)).toContain(`pv-block--${type}`);
});

When('I color the selection {string} from the selection bar', async ({ page }, label: string) => {
  const bar = active(page).getByRole('toolbar', { name: 'Selected blocks' });
  await expect(bar).toBeVisible();
  await bar.getByLabel(`Color ${label}`, { exact: true }).click();
});

Then(
  'blocks {int} and {int} have the {string} color',
  async ({ page }, a: number, b: number, token: string) => {
    const rows = active(page).locator('.pv-block');
    const has = (n: number) => rows.nth(n - 1).evaluate((el) => el.className);
    await expect.poll(() => has(a)).toContain(`pv-color--${token}`);
    await expect.poll(() => has(b)).toContain(`pv-color--${token}`);
  },
);

// Blocks 2 and 3 (1-based) carry a non-zero left margin (indented via depth).
Then('blocks {int} and {int} are indented', async ({ page }, a: number, b: number) => {
  const rows = active(page).locator('.pv-block');
  await expect
    .poll(async () => {
      const margin = (n: number) =>
        rows.nth(n - 1).evaluate((el) => parseFloat((el as HTMLElement).style.marginLeft) || 0);
      return (await margin(a)) > 0 && (await margin(b)) > 0;
    })
    .toBe(true);
});

When('I click Undo on the toast', async ({ page }) => {
  await page.locator('.pv-toast').getByRole('button', { name: 'Undo' }).click();
});

Then('I should see {string} in a block', async ({ page }, text: string) => {
  // Block bodies are textareas, so the content is a value not a text node.
  await expect
    .poll(async () =>
      (
        await inputs(page).evaluateAll((els) => els.map((e) => (e as HTMLTextAreaElement).value))
      ).includes(text),
    )
    .toBe(true);
});

Then('the page has {int} blocks', async ({ page }, n: number) => {
  await expect.poll(() => inputs(page).count()).toBe(n);
});

Then('the page has {int} block', async ({ page }, n: number) => {
  await expect.poll(() => inputs(page).count()).toBe(n);
});
