import { createBdd } from 'playwright-bdd';
import { expect, type Page } from '@playwright/test';

const { When, Then } = createBdd();

const active = (page: Page) =>
  page.locator('.ion-page:not(.ion-page-hidden)').filter({ visible: true }).last();
const panel = (page: Page) => active(page).locator('.pv-comments');
const comment = (page: Page, body: string) => panel(page).locator('.pv-comment', { hasText: body });

When('I add the comment {string}', async ({ page }, body: string) => {
  const box = panel(page).getByLabel('Add a comment');
  await box.fill(body);
  await active(page).getByRole('button', { name: 'Comment' }).click();
  await expect(box).toHaveValue('');
});

Then('the page shows the comment {string}', async ({ page }, body: string) => {
  await expect(comment(page, body).first()).toBeVisible();
});

When('I delete the comment {string}', async ({ page }, body: string) => {
  const before = await comment(page, body).count();
  await comment(page, body).first().getByLabel('Delete comment').click();
  await expect.poll(() => comment(page, body).count()).toBeLessThan(before);
});

Then('the page shows no comment {string}', async ({ page }, body: string) => {
  await expect(comment(page, body)).toHaveCount(0);
});
