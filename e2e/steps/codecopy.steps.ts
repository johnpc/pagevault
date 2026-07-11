import { createBdd } from 'playwright-bdd';
import { expect, type Page } from '@playwright/test';

const { When, Then } = createBdd();

const active = (page: Page) =>
  page.locator('.ion-page:not(.ion-page-hidden)').filter({ visible: true }).last();
const codeInput = (page: Page) =>
  active(page).locator('.pv-block--code textarea.pv-block-input').last();
const copyBtn = (page: Page) => active(page).locator('.pv-block--code .pv-code-copy').last();

When('I type {string} into the code block', async ({ page }, text: string) => {
  const input = codeInput(page);
  await input.click();
  await input.pressSequentially(text);
  await expect(input).toHaveValue(text);
});

When('I click the code copy button', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await copyBtn(page).click();
});

Then('the code copy button reads {string}', async ({ page }, label: string) => {
  await expect(copyBtn(page)).toHaveText(label);
});

Then('the clipboard contains {string}', async ({ page }, text: string) => {
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toContain(text);
});
