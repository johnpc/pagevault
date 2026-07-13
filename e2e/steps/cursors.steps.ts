import { createBdd } from 'playwright-bdd';
import { expect, type Page } from '@playwright/test';

const { Then } = createBdd();

const active = (page: Page) =>
  page.locator('.ion-page:not(.ion-page-hidden)').filter({ visible: true }).last();

/** The owner's view should show a collaborator cursor name-tag on some block
 * once another user focuses it. Propagates over realtime + heartbeat, so poll. */
Then('I see a collaborator cursor on a block', async ({ page }) => {
  await expect
    .poll(() => active(page).locator('.pv-cursors .pv-cursor-tag').count(), { timeout: 20_000 })
    .toBeGreaterThan(0);
});
