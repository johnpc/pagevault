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
  // Exact — "Comment" is a substring of the "Edit/Delete comment" labels once a
  // comment exists, so a loose match would resolve to multiple buttons.
  await active(page).getByRole('button', { name: 'Comment', exact: true }).click();
  await expect(box).toHaveValue('');
});

Then('the page shows the comment {string}', async ({ page }, body: string) => {
  await expect(comment(page, body).first()).toBeVisible();
});

When('I edit the comment {string} to {string}', async ({ page }, body: string, next: string) => {
  await comment(page, body).first().getByLabel('Edit comment').click();
  const box = panel(page).getByLabel('Edit comment text');
  await box.fill(next);
  await active(page).getByRole('button', { name: 'Save' }).click();
  await expect(box).toHaveCount(0); // back to display mode
});

When('I delete the comment {string}', async ({ page }, body: string) => {
  const before = await comment(page, body).count();
  await comment(page, body).first().getByLabel('Delete comment').click();
  await expect.poll(() => comment(page, body).count()).toBeLessThan(before);
});

Then('the page shows no comment {string}', async ({ page }, body: string) => {
  await expect(comment(page, body)).toHaveCount(0);
});
