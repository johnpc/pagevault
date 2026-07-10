import { createBdd } from 'playwright-bdd';
import { expect } from '@playwright/test';

const { When, Then } = createBdd();

When('I go to the home screen', async ({ page }) => {
  // The workspace title in the sidebar isn't a link; navigate via the app root.
  await page.goto('/');
  await expect(page.getByText('Welcome to PageVault')).toBeVisible();
});

Then('I should see {string} under recently edited', async ({ page }, title: string) => {
  const recent = page.locator('.pv-home-recent');
  await expect(recent).toContainText('Recently edited');
  await expect(recent.getByText(title, { exact: true }).first()).toBeVisible();
});
