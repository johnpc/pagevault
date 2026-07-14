import { createBdd } from 'playwright-bdd';
import { expect, type Page } from '@playwright/test';

const { When, Then } = createBdd();

const active = (page: Page) =>
  page.locator('.ion-page:not(.ion-page-hidden)').filter({ visible: true }).last();

// Opens the block's color picker (via its hover control) and chooses a color.
When('I set the block color to {string}', async ({ page }, label: string) => {
  await active(page).getByLabel('Block color').first().click();
  const menu = active(page).getByRole('listbox', { name: 'Block color' });
  await expect(menu).toBeVisible();
  await menu.getByRole('option', { name: label }).click();
});

// Asserts some block row carries the tint class (persisted color).
Then('the block is tinted {string}', async ({ page }, token: string) => {
  await expect
    .poll(() => active(page).locator(`.pv-block.pv-color--${token}`).count())
    .toBeGreaterThan(0);
});

// Guards the callout-bg fix: a callout has its own default background, so a
// picked bg color must actually REPAINT it (not just add a class that loses on
// CSS source order). The default callout tint is --pv-accent-soft.
Then("the block's background is not the default callout tint", async ({ page }) => {
  const callout = active(page).locator('.pv-block--callout').first();
  const [bg, accentSoft] = await callout.evaluate((el) => {
    const style = getComputedStyle(el);
    const soft = getComputedStyle(document.documentElement)
      .getPropertyValue('--pv-accent-soft')
      .trim();
    // Resolve the token to an rgb by painting it on a throwaway element.
    const probe = document.createElement('div');
    probe.style.color = soft;
    document.body.appendChild(probe);
    const softRgb = getComputedStyle(probe).color;
    probe.remove();
    return [style.backgroundColor, softRgb];
  });
  expect(bg).not.toBe(accentSoft);
});

const colorMenu = (page: Page) => active(page).getByRole('listbox', { name: 'Block color' });

When('I open the block color menu', async ({ page }) => {
  await active(page).getByLabel('Block color').first().click();
});

Then('the block color menu is open', async ({ page }) => {
  await expect(colorMenu(page)).toBeVisible();
});

When('I press Escape in the color menu', async ({ page }) => {
  await colorMenu(page).press('Escape');
});

Then('the block color menu is closed', async ({ page }) => {
  await expect(colorMenu(page)).toBeHidden();
});
