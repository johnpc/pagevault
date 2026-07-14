import { createBdd } from 'playwright-bdd';
import { expect, type Page } from '@playwright/test';
import { uniqueTitle } from './uniqueTitle';

const { When, Then } = createBdd();

const tree = (page: Page) => page.locator('.pv-sidebar-tree');
const row = (page: Page, title: string) =>
  tree(page).locator('.pv-sidebar-row', { hasText: title }).first();

// Position of a title among the sidebar rows. Rows carry per-attempt UNIQUE
// titles, so find by substring (the unique title contains the base) rather than
// an exact index of the base name.
const orderedBefore = async (page: Page, a: string, b: string) => {
  const titles = await tree(page).locator('.pv-sidebar-title').allInnerTexts();
  const i = titles.findIndex((t) => t.includes(a));
  const j = titles.findIndex((t) => t.includes(b));
  return i !== -1 && j !== -1 && i < j;
};

When(
  'I drag the sidebar page {string} above {string}',
  async ({ page, $testInfo }, from: string, to: string) => {
    const fromU = uniqueTitle(from, $testInfo);
    const toU = uniqueTitle(to, $testInfo);
    // HTML5 drag: Playwright's real-mouse dragTo doesn't reliably fire dragstart/
    // drop, so dispatch the drag events directly (with a shared DataTransfer) —
    // exactly the events the row's React handlers listen for. dragstart now lives
    // on the row's ⋮⋮ grip (the whole row is no longer draggable); drop stays on
    // the row.
    await row(page, fromU)
      .locator('.pv-sidebar-grip')
      .evaluate((el) => {
        const dt = new DataTransfer();
        el.dispatchEvent(new DragEvent('dragstart', { bubbles: true, dataTransfer: dt }));
        (window as unknown as { __dt: DataTransfer }).__dt = dt;
      });
    await row(page, toU).evaluate((el) => {
      const dt = (window as unknown as { __dt: DataTransfer }).__dt;
      el.dispatchEvent(new DragEvent('dragover', { bubbles: true, dataTransfer: dt }));
      el.dispatchEvent(new DragEvent('drop', { bubbles: true, dataTransfer: dt }));
    });
    await expect.poll(() => orderedBefore(page, fromU, toU)).toBe(true);
  },
);

// Touch/pen reorder via Pointer Events (the native HTML5 drag can't on touch):
// press the source row's ⋮⋮ grip, move over the target row, release.
When(
  'I touch-drag the sidebar page {string} above {string}',
  async ({ page, $testInfo }, from: string, to: string) => {
    const fromU = uniqueTitle(from, $testInfo);
    const toU = uniqueTitle(to, $testInfo);
    const grip = row(page, fromU).locator('.pv-sidebar-grip');
    const gb = await grip.boundingBox();
    const tb = await row(page, toU).boundingBox();
    if (!gb || !tb) throw new Error('missing page grip or target row');
    await grip.dispatchEvent('pointerdown', {
      pointerType: 'touch',
      pointerId: 1,
      clientX: gb.x + gb.width / 2,
      clientY: gb.y + gb.height / 2,
      bubbles: true,
    });
    const x = tb.x + tb.width / 2;
    const y = tb.y + tb.height / 2;
    for (const t of ['pointermove', 'pointerup']) {
      await page.evaluate(
        ({ t, x, y }) => {
          const e = new Event(t, { bubbles: true }) as Event & { clientX: number; clientY: number };
          e.clientX = x;
          e.clientY = y;
          document.dispatchEvent(e);
        },
        { t, x, y },
      );
    }
    await expect.poll(() => orderedBefore(page, fromU, toU)).toBe(true);
  },
);

When('I reload the app', async ({ page }) => {
  await page.reload();
  // Wait for the signed-in shell before reading the tree again.
  await expect(page.getByRole('button', { name: 'New page' })).toBeVisible();
});

Then(
  'the sidebar page order starts with {string} then {string}',
  async ({ page, $testInfo }, first: string, second: string) => {
    await expect
      .poll(() =>
        orderedBefore(page, uniqueTitle(first, $testInfo), uniqueTitle(second, $testInfo)),
      )
      .toBe(true);
  },
);
