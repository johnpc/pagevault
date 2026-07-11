import { createBdd } from 'playwright-bdd';
import { expect, type Page } from '@playwright/test';

const { When } = createBdd();

const active = (page: Page) =>
  page.locator('.ion-page:not(.ion-page-hidden)').filter({ visible: true }).last();
const focused = (page: Page) => active(page).locator('textarea.pv-block-input:focus');

/** Open the currently-focused block's Turn-into menu and pick the target type
 * by label. The row is captured by the focused block's live text BEFORE any
 * click moves focus, so the "Turn into" button resolves against the right row
 * even though clicking it blurs the textarea (which persists the content). */
When('I turn the block into a {string}', async ({ page }, label: string) => {
  const text = await focused(page).inputValue();
  const row = active(page)
    .locator('.pv-block')
    .filter({ has: page.locator(`textarea.pv-block-input[value="${text}"]`) })
    .last();
  // Fallback: some browsers don't reflect live value in the [value] attribute;
  // if the value-based match finds nothing, use the last block on the page.
  const target = (await row.count()) > 0 ? row : active(page).locator('.pv-block').last();

  await target.getByLabel('Turn into').click();
  const menu = active(page).getByRole('listbox', { name: 'Turn into' });
  await expect(menu).toBeVisible();
  // Options carry an icon glyph + label; match the exact label span so "Text"
  // doesn't also hit another option that merely contains the word.
  await menu
    .getByRole('option')
    .filter({ has: page.getByText(label, { exact: true }) })
    .click();
});
