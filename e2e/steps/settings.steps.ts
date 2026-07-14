import { createBdd } from 'playwright-bdd';
import { expect } from '@playwright/test';

const { When, Then } = createBdd();

When('I open settings', async ({ page }) => {
  await page.getByRole('button', { name: 'Settings' }).click();
  await expect(page.getByRole('radiogroup', { name: 'Theme' })).toBeVisible();
});

When('I choose the {string} theme', async ({ page }, label: string) => {
  await page.getByRole('radio', { name: new RegExp(label) }).click();
});

Then('the app uses the {string} theme', async ({ page }, theme: string) => {
  // The choice is applied by setting [data-theme] on <html> — assert on the DOM.
  await expect
    .poll(() => page.evaluate(() => document.documentElement.getAttribute('data-theme')))
    .toBe(theme);
});

let lastDownload: import('@playwright/test').Download | undefined;

When('I export the workspace', async ({ page }) => {
  const wait = page.waitForEvent('download');
  await page.getByRole('button', { name: /Export workspace/ }).click();
  lastDownload = await wait;
});

Then('a Markdown file named {string} is downloaded', async ({ page }, name: string) => {
  void page;
  expect(lastDownload?.suggestedFilename()).toBe(name);
});
