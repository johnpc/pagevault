import { createBdd } from 'playwright-bdd';
import { expect, type Page } from '@playwright/test';

const { Then } = createBdd();

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
