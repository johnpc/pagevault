import { createBdd } from 'playwright-bdd';
import { expect, type Page } from '@playwright/test';

const { Given, When, Then } = createBdd();

const EMAIL = process.env.TEST_USERNAME ?? 'test@example.com';
const PASSWORD = process.env.TEST_PASSWORD ?? 'TestPassw0rd!';

/** Sign in at a phone viewport (390×844) where the sidebar is an off-canvas
 * drawer. The workspace is ready once the hamburger (open-sidebar) is shown. */
Given('I am signed in on a phone-sized screen', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByLabel('Email').fill(EMAIL);
  await page.getByLabel('Password').fill(PASSWORD);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByRole('button', { name: 'Open sidebar' })).toBeVisible();
});

// The drawer is "closed" when its sidebar sits off-screen (negative left edge).
Then('the sidebar drawer is closed', async ({ page }) => {
  await expect
    .poll(() => page.locator('.pv-sidebar').evaluate((el) => el.getBoundingClientRect().left))
    .toBeLessThan(0);
});

When('I open the sidebar drawer', async ({ page }) => {
  await page.getByRole('button', { name: 'Open sidebar' }).click();
  await expect
    .poll(() => page.locator('.pv-sidebar').evaluate((el) => el.getBoundingClientRect().left))
    .toBe(0);
});

Then('I can reach the {string} action', async ({ page }, name: string) => {
  await expect(page.getByRole('button', { name, exact: true })).toBeVisible();
});

When('I create a page from the drawer', async ({ page }) => {
  await page.getByRole('button', { name: 'New page' }).click();
});

Then('the block editor is shown', async ({ page }) => {
  // A freshly created page shows its (empty) title editor — the block list is
  // empty until the first block is added, so assert on the title input.
  const title = page.locator('.ion-page:not(.ion-page-hidden)').getByLabel('Page title');
  await expect(title).toBeVisible();
  await expect(title).toHaveValue('');
});

const active = (page: Page) => page.locator('.ion-page:not(.ion-page-hidden)').last();

// Drive the Pointer Events path (pointerType touch) the native HTML5 drag can't:
// press the row's drag handle, move over the target row, release.
When('I touch-drag block {int} onto block {int}', async ({ page }, from: number, to: number) => {
  const handle = active(page)
    .locator('.pv-block-style')
    .nth(from - 1);
  const target = active(page)
    .locator('.pv-block')
    .nth(to - 1);
  const hb = await handle.boundingBox();
  const tb = await target.boundingBox();
  if (!hb || !tb) throw new Error('missing drag handle or target row');
  await handle.dispatchEvent('pointerdown', {
    pointerType: 'touch',
    pointerId: 1,
    clientX: hb.x + hb.width / 2,
    clientY: hb.y + hb.height / 2,
    bubbles: true,
  });
  const cx = tb.x + tb.width / 2;
  const cy = tb.y + tb.height / 2;
  for (const t of ['pointermove', 'pointerup']) {
    await page.evaluate(
      ({ t, cx, cy }) => {
        const e = new Event(t, { bubbles: true }) as Event & { clientX: number; clientY: number };
        e.clientX = cx;
        e.clientY = cy;
        document.dispatchEvent(e);
      },
      { t, cx, cy },
    );
  }
});

Then('block {int} contains {string}', async ({ page }, n: number, text: string) => {
  await expect
    .poll(() =>
      active(page)
        .locator('textarea.pv-block-input')
        .nth(n - 1)
        .inputValue(),
    )
    .toBe(text);
});

// On a phone there's no hover, so the block's controls (duplicate/turn-into/…)
// must be visible without hovering, or they're unreachable by touch.
Then('the block controls are reachable without hovering', async ({ page }) => {
  const dup = active(page).locator('.pv-block-dup').first();
  await expect
    .poll(() => dup.evaluate((el) => parseFloat(getComputedStyle(el).opacity)))
    .toBeGreaterThan(0);
});
