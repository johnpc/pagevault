import { createBdd } from 'playwright-bdd';
import { expect, type Page } from '@playwright/test';

const { Given, When, Then } = createBdd();

// The second tab for the current scenario. Each worker runs one scenario at a
// time and the "second tab" step sets this fresh, so a module-level handle is
// safe here (no cross-scenario overlap within a worker).
let secondTab: Page | undefined;

const active = (page: Page) =>
  page.locator('.ion-page:not(.ion-page-hidden)').filter({ visible: true }).last();

const sidebarRow = (page: Page, title: string) =>
  page.locator('.pv-sidebar-tree').getByText(title, { exact: true }).first();

const blockInputs = (page: Page) => active(page).locator('textarea.pv-block-input');

/** Open the same page in a SECOND tab of the same browser context, so it shares
 * the signed-in session — the realistic "two open views" case. */
Given('I open the page {string} in a second tab', async ({ page, context }, title: string) => {
  await sidebarRow(page, title).click();
  await expect(active(page).getByLabel('Page title')).toHaveValue(title);

  secondTab = await context.newPage();
  await secondTab.goto('/');
  await expect(secondTab.getByRole('button', { name: '+ New page' })).toBeVisible();
  await sidebarRow(secondTab, title).click();
  await expect(active(secondTab).getByLabel('Page title')).toHaveValue(title);
});

When('I rename the page to {string}', async ({ page }, title: string) => {
  const input = active(page).getByLabel('Page title');
  await input.fill(title);
  await input.blur();
});

/** The block never gets typed into the second tab — it must arrive via realtime.
 * No reload is issued; we only poll the already-open tab's live block values. */
Then(
  'the second tab shows a block containing {string} without reloading',
  async ({ page }, text: string) => {
    void page; // assertion targets the second tab, not the primary fixture page
    const tab = secondTab;
    if (!tab) throw new Error('second tab was not opened');
    await expect
      .poll(
        () =>
          blockInputs(tab).evaluateAll(
            (els, t) => els.some((el) => (el as HTMLTextAreaElement).value.includes(t)),
            text,
          ),
        { timeout: 15_000 },
      )
      .toBe(true);
  },
);

Then(
  'the second tab shows {string} in the sidebar without reloading',
  async ({ page }, title: string) => {
    void page; // assertion targets the second tab, not the primary fixture page
    const tab = secondTab;
    if (!tab) throw new Error('second tab was not opened');
    await expect(sidebarRow(tab, title)).toBeVisible({ timeout: 15_000 });
  },
);
