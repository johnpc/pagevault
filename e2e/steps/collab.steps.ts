import { createBdd } from 'playwright-bdd';
import { expect, type Page } from '@playwright/test';

const { When, Then } = createBdd();

const COLLAB_EMAIL = process.env.COLLAB_USERNAME ?? 'collab@example.com';
const COLLAB_PASSWORD = process.env.COLLAB_PASSWORD ?? 'TestPassw0rd!';

const active = (page: Page) =>
  page.locator('.ion-page:not(.ion-page-hidden)').filter({ visible: true }).last();
const blockInputs = (page: Page) => active(page).locator('textarea.pv-block-input');

// The invite URL the owner copied, and the second user's tab — module-level is
// safe because a worker runs one scenario at a time.
let inviteLink = '';
let collabTab: Page | undefined;

/** Owner: open the invite popover, pick a role, and capture the copied /join
 * link from the clipboard (the app writes it on create). */
When('I create an invite link that can {string}', async ({ page, context }, role: string) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await active(page).getByLabel('Invite collaborators').click();
  const label = { view: 'Can view', comment: 'Can comment', edit: 'Can edit' }[role] ?? role;
  await active(page).getByRole('option', { name: label }).click();
  await expect(active(page).getByText('Link copied')).toBeVisible();
  inviteLink = await page.evaluate(() => navigator.clipboard.readText());
  expect(inviteLink).toContain('/join/');
});

/** A different signed-in user opens the invite link in their own context. */
When('a second user opens the invite link', async ({ browser }) => {
  const ctx = await browser.newContext();
  collabTab = await ctx.newPage();
  await collabTab.goto('/');
  await collabTab.getByLabel('Email').fill(COLLAB_EMAIL);
  await collabTab.getByLabel('Password').fill(COLLAB_PASSWORD);
  await collabTab.getByRole('button', { name: 'Sign in' }).click();
  await expect(collabTab.getByRole('button', { name: '+ New page' })).toBeVisible();
  await collabTab.goto(inviteLink);
});

When('the second user joins the page', async () => {
  const tab = collabTab;
  if (!tab) throw new Error('second user tab was not opened');
  await tab.getByRole('button', { name: 'Join page' }).click();
  // Joining navigates into the page; wait for its title field.
  await expect(active(tab).getByLabel('Page title')).toBeVisible();
});

When('the second user focuses the first block', async () => {
  const tab = collabTab;
  if (!tab) throw new Error('second user tab was not opened');
  await blockInputs(tab).first().click();
  await expect(active(tab).locator('textarea.pv-block-input:focus')).toBeVisible();
});

Then('the second user sees a block containing {string}', async ({ page }, text: string) => {
  void page; // the assertion targets the second user's tab, not the fixture page
  const tab = collabTab;
  if (!tab) throw new Error('second user tab was not opened');
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
});
