import { createBdd } from 'playwright-bdd';
import { expect } from '@playwright/test';

const { When, Then } = createBdd();

When('I open the shortcut help', async ({ page }) => {
  await page.getByRole('button', { name: 'Shortcuts' }).click();
});

Then('I should see the quick-find shortcut listed', async ({ page }) => {
  const dialog = page.getByRole('dialog', { name: 'Keyboard shortcuts' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText(/Open quick find/)).toBeVisible();
});

Then('I should see the multi-block selection shortcut listed', async ({ page }) => {
  const dialog = page.getByRole('dialog', { name: 'Keyboard shortcuts' });
  await expect(dialog.getByText(/Grow a multi-block selection/)).toBeVisible();
  await expect(dialog.getByText(/Select all blocks/)).toBeVisible();
});

Then('Tab keeps focus inside the shortcut help dialog', async ({ page }) => {
  const dialog = page.getByRole('dialog', { name: 'Keyboard shortcuts' });
  for (let i = 0; i < 4; i++) {
    await page.keyboard.press('Tab');
    const inside = await dialog.evaluate((d) => d.contains(document.activeElement));
    expect(inside).toBe(true);
  }
});
