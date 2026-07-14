import { createBdd } from 'playwright-bdd';
import { expect, type Page } from '@playwright/test';

const { When, Then } = createBdd();

const active = (page: Page) =>
  page.locator('.ion-page:not(.ion-page-hidden)').filter({ visible: true }).last();
const board = (page: Page) => active(page).locator('.pv-board').last();

When('I switch the table to the board view', async ({ page }) => {
  await active(page).getByRole('tab', { name: 'Board' }).last().click();
  await expect(board(page)).toBeVisible();
});

Then('the board has a column {string}', async ({ page }, label: string) => {
  await expect(board(page).locator('.pv-board-col-head', { hasText: label }).first()).toBeVisible();
});

Then('the board card reads {string}', async ({ page }, text: string) => {
  await expect
    .poll(() =>
      board(page)
        .locator('.pv-board-card input')
        .evaluateAll((els, t) => els.some((el) => (el as HTMLInputElement).value === t), text),
    )
    .toBe(true);
});

Then('the table is in the board view', async ({ page }) => {
  await expect(board(page)).toBeVisible();
});

// The card whose title input holds `text`.
const cardWith = (page: Page, text: string) =>
  board(page)
    .locator('.pv-board-card')
    .filter({ has: page.locator(`input[value="${text}"]`) })
    .last();

// Touch-drag a card (by its ⋮⋮ grip) onto a target column via Pointer Events —
// the native HTML5 drag doesn't fire on touch.
When(
  'I touch-drag board card {string} to column {string}',
  async ({ page }, title: string, colLabel: string) => {
    const grip = cardWith(page, title).getByRole('button', { name: /^Drag card/ });
    const col = board(page)
      .locator('.pv-board-col')
      .filter({ has: page.locator('.pv-board-col-head', { hasText: colLabel }) })
      .last();
    const gb = await grip.boundingBox();
    const cb = await col.boundingBox();
    if (!gb || !cb) throw new Error('missing card grip or target column');
    await grip.dispatchEvent('pointerdown', {
      pointerType: 'touch',
      pointerId: 1,
      clientX: gb.x + gb.width / 2,
      clientY: gb.y + gb.height / 2,
      bubbles: true,
    });
    const x = cb.x + cb.width / 2;
    const y = cb.y + cb.height / 2;
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
  },
);

Then(
  'the {string} column contains the card {string}',
  async ({ page }, colLabel: string, title: string) => {
    const col = board(page)
      .locator('.pv-board-col')
      .filter({ has: page.locator('.pv-board-col-head', { hasText: colLabel }) })
      .last();
    await expect
      .poll(() =>
        col
          .locator('.pv-board-card input')
          .evaluateAll((els, t) => els.some((el) => (el as HTMLInputElement).value === t), title),
      )
      .toBe(true);
  },
);
