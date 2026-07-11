import { createBdd } from 'playwright-bdd';
import { expect } from '@playwright/test';

const { When, Then } = createBdd();

When('I open the shortcut help', async ({ page }) => {
  await page.getByRole('button', { name: '⌨ Shortcuts' }).click();
});

Then('I should see the quick-find shortcut listed', async ({ page }) => {
  const dialog = page.getByRole('dialog', { name: 'Keyboard shortcuts' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText(/Open quick find/)).toBeVisible();
});
