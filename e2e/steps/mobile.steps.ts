import { createBdd } from 'playwright-bdd';
import { expect } from '@playwright/test';

const { Given, When, Then } = createBdd();

const EMAIL = process.env.TEST_USERNAME ?? 'test@example.com';
const PASSWORD = process.env.TEST_PASSWORD ?? 'TestPassw0rd!';

/** Sign in at a phone viewport (390×844) so the sidebar collapses to its rail. */
Given('I am signed in on a phone-sized screen', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByLabel('Email').fill(EMAIL);
  await page.getByLabel('Password').fill(PASSWORD);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByRole('button', { name: 'New page' })).toBeVisible();
});

Then('I can reach the {string} action', async ({ page }, name: string) => {
  await expect(page.getByRole('button', { name, exact: true })).toBeVisible();
});

When('I create a page from the rail', async ({ page }) => {
  await page.getByRole('button', { name: 'New page' }).click();
});

Then('the block editor is shown', async ({ page }) => {
  // A freshly created page shows its (empty) title editor — the block list is
  // empty until the first block is added, so assert on the title input.
  const title = page.locator('.ion-page:not(.ion-page-hidden)').getByLabel('Page title');
  await expect(title).toBeVisible();
  await expect(title).toHaveValue('');
});
