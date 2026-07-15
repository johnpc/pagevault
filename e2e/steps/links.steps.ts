import { createBdd } from 'playwright-bdd';
import { expect, type Page } from '@playwright/test';

const { When, Then } = createBdd();

const active = (page: Page) =>
  page.locator('.ion-page:not(.ion-page-hidden)').filter({ visible: true }).last();

// After blurring the block, its idle formatted preview renders inline links as
// <a class="pv-link"> in a new tab. Assert on the real anchor + its href.
Then(
  'the block shows a link {string} to {string}',
  async ({ page }: { page: Page }, text: string, href: string) => {
    const link = active(page).locator('.pv-block-preview a.pv-link', { hasText: text }).first();
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('href', href);
    await expect(link).toHaveAttribute('target', '_blank');
  },
);

// Clicking a link in the idle preview must follow the link, NOT flip the block
// into edit mode. The link opens target="_blank", so intercept the popup to
// avoid a real navigation, then assert the block is still a preview (no textarea).
When('I click the link {string} in the block', async ({ page }: { page: Page }, text: string) => {
  const link = active(page).locator('.pv-block-preview a.pv-link', { hasText: text }).first();
  // Swallow the new-tab open so the test doesn't chase an external page.
  page.context().on('page', (p) => p.close().catch(() => {}));
  await link.click({ modifiers: [] });
});

Then('the block is still a formatted preview', async ({ page }: { page: Page }) => {
  await expect(active(page).locator('.pv-block-preview').first()).toBeVisible();
  await expect(active(page).locator('textarea.pv-block-input:focus')).toHaveCount(0);
});
