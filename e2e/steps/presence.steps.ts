import { createBdd } from 'playwright-bdd';
import { expect, type Page } from '@playwright/test';

const { Then } = createBdd();

const active = (page: Page) =>
  page.locator('.ion-page:not(.ion-page-hidden)').filter({ visible: true }).last();

/** The owner's page should show N presence avatars once collaborators are
 * viewing. Presence propagates over realtime + a heartbeat, so poll generously. */
Then('I see {int} other viewer on the page', async ({ page }, count: number) => {
  await expect
    .poll(() => active(page).locator('.pv-presence .pv-presence-avatar').count(), {
      timeout: 20_000,
    })
    .toBe(count);
});

Then('I see {int} other viewers on the page', async ({ page }, count: number) => {
  await expect
    .poll(() => active(page).locator('.pv-presence .pv-presence-avatar').count(), {
      timeout: 20_000,
    })
    .toBe(count);
});
