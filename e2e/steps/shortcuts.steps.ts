import { createBdd } from 'playwright-bdd';
import { expect, type Page } from '@playwright/test';

const { When, Then } = createBdd();

const active = (page: Page) =>
  page.locator('.ion-page:not(.ion-page-hidden)').filter({ visible: true }).last();
const focused = (page: Page) => active(page).locator('textarea.pv-block-input:focus');

When('I select all text in the block', async ({ page }) => {
  // The last block was blurred after typing; focus it, then select its text.
  const input = active(page).locator('textarea.pv-block-input').last();
  await input.click();
  await expect(focused(page)).toBeVisible();
  await input.evaluate((el) => (el as HTMLTextAreaElement).select());
});

// The chord for each named formatting shortcut (Notion parity).
const FORMAT_CHORDS: Record<string, string> = {
  bold: 'ControlOrMeta+b',
  italic: 'ControlOrMeta+i',
  underline: 'ControlOrMeta+u',
  strikethrough: 'ControlOrMeta+Shift+s',
};

const blurToPreview = (page: Page) =>
  active(page)
    .locator('.pv-page')
    .click({ position: { x: 5, y: 5 } });

When('I press the bold shortcut', async ({ page }) => {
  await focused(page).press('ControlOrMeta+b');
  // Blur so the wrapped value saves and the idle preview renders the bold.
  await blurToPreview(page);
});

When('I press the {word} formatting shortcut', async ({ page }, kind: string) => {
  await focused(page).press(FORMAT_CHORDS[kind]);
  await blurToPreview(page);
});

Then('the block renders {string} underlined', async ({ page }, text: string) => {
  await expect(
    active(page).locator('.pv-block-preview u', { hasText: text }).first(),
  ).toBeVisible();
});

// Select the block's text with a REAL gesture (keyboard select-all) so the
// textarea's `select` event fires and reveals the toolbar — a programmatic
// el.select() does not dispatch that event.
When('I select the block text with the keyboard', async ({ page }) => {
  const input = active(page).locator('textarea.pv-block-input').last();
  await input.click();
  await expect(focused(page)).toBeVisible();
  await input.press('ControlOrMeta+a');
});

When('I click {string} on the selection toolbar', async ({ page }, label: string) => {
  const toolbar = active(page).getByRole('toolbar', { name: 'Format selection' });
  await expect(toolbar).toBeVisible();
  await toolbar.getByRole('button', { name: label }).click();
  await blurToPreview(page); // commit + render the idle formatted preview
});

When('I link the selection to {string} via the toolbar', async ({ page }, url: string) => {
  const toolbar = active(page).getByRole('toolbar', { name: 'Format selection' });
  await expect(toolbar).toBeVisible();
  await toolbar.getByRole('button', { name: 'Link' }).click();
  const input = toolbar.getByLabel('Link URL');
  await input.fill(url);
  await input.press('Enter');
  await blurToPreview(page); // commit + render the idle formatted preview
});

Then(
  'the block renders {string} as a link to {string}',
  async ({ page }, text: string, href: string) => {
    const link = active(page).locator('.pv-block-preview a.pv-link', { hasText: text }).first();
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('href', href);
  },
);

When('I press the sidebar-toggle shortcut', async ({ page }) => {
  await page.keyboard.press('ControlOrMeta+\\');
});

Then('the sidebar is visible', async ({ page }) => {
  await expect(page.locator('.pv-sidebar')).toBeVisible();
});

Then('the sidebar is hidden', async ({ page }) => {
  await expect(page.locator('.pv-sidebar')).toBeHidden();
  await expect(page.getByLabel('Show sidebar')).toBeVisible();
});
