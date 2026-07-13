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

When('I press the bold shortcut', async ({ page }) => {
  await focused(page).press('ControlOrMeta+b');
  // Blur so the wrapped value saves and the idle preview renders the bold.
  await active(page)
    .locator('.pv-page')
    .click({ position: { x: 5, y: 5 } });
});

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
