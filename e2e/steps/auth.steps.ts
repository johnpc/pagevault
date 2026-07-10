import { createBdd } from 'playwright-bdd';
import { expect } from '@playwright/test';

const { Given, Then } = createBdd();

const EMAIL = process.env.TEST_USERNAME ?? 'test@example.com';
const PASSWORD = process.env.TEST_PASSWORD ?? 'TestPassw0rd!';

/** Sign in through the real UI, waiting until the workspace sidebar is shown. */
Given('I am signed in as the test user', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Email').fill(EMAIL);
  await page.getByLabel('Password').fill(PASSWORD);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByRole('button', { name: '+ New page' })).toBeVisible();
});

Given('I open PageVault while signed out', async ({ page }) => {
  await page.goto('/');
});

Then('I should see the sign-in screen', async ({ page }) => {
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
});

Then('I should see my workspace', async ({ page }) => {
  await expect(page.getByRole('button', { name: '+ New page' })).toBeVisible();
});
