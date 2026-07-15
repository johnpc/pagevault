import { createBdd } from 'playwright-bdd';
import { expect, type Page } from '@playwright/test';

const { When, Then } = createBdd();

const active = (page: Page) =>
  page.locator('.ion-page:not(.ion-page-hidden)').filter({ visible: true }).last();
const gallery = (page: Page) => active(page).locator('.pv-gallery').last();

When('I switch the table to the gallery view', async ({ page }) => {
  await active(page).getByRole('tab', { name: 'Gallery' }).last().click();
  await expect(gallery(page)).toBeVisible();
});

Then('the gallery card reads {string}', async ({ page }, text: string) => {
  await expect
    .poll(() =>
      gallery(page)
        .locator('.pv-gallery-title')
        .evaluateAll((els, t) => els.some((el) => (el as HTMLInputElement).value === t), text),
    )
    .toBe(true);
});

Then(
  'the gallery card shows field {string} with value {string}',
  async ({ page }, label: string, value: string) => {
    const field = gallery(page)
      .locator('.pv-gallery-field')
      .filter({ has: page.locator('dt', { hasText: label }) })
      .first();
    await expect(field.locator('dd')).toHaveText(value);
  },
);

Then('the table is in the gallery view', async ({ page }) => {
  await expect(gallery(page)).toBeVisible();
});

Then(
  'the gallery field {string} shows the tag {string} as a colored pill',
  async ({ page }, label: string, tag: string) => {
    const pill = gallery(page)
      .locator('.pv-gallery-field')
      .filter({ has: page.locator('dt', { hasText: label }) })
      .locator('.pv-tag', { hasText: tag })
      .first();
    await expect(pill).toBeVisible();
    await expect(pill).toHaveClass(/pv-tag--\w+/);
  },
);
