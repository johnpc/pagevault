import { createBdd } from 'playwright-bdd';
import { expect, type Page, type TestInfo } from '@playwright/test';
import { uniqueTitle } from './uniqueTitle';

const { Given, When, Then } = createBdd();

/** The sidebar row for a page title. EXACT text match (not substring) so
 * "Notes" doesn't also match "Meeting notes". Titles are made unique per
 * scenario attempt (uniqueTitle), so this resolves to exactly this attempt's
 * page — a prior repeat/retry/parallel worker's dirty page can't shadow it. */
const sidebarRow = (page: Page, title: string, info: TestInfo) =>
  page.locator('.pv-sidebar-tree').getByText(uniqueTitle(title, info), { exact: true }).first();

/** Create a page via the sidebar and rename it by typing into the title. */
async function createPageTitled(page: Page, title: string, info: TestInfo) {
  const unique = uniqueTitle(title, info);
  await page.getByRole('button', { name: '+ New page' }).click();
  const titleInput = active(page).getByLabel('Page title');
  await expect(titleInput).toBeVisible();
  // Wait until the NEW (empty) page is actually on screen — Ionic keeps the
  // previous page mounted during its slide transition, so filling too early can
  // save the title onto the page we just navigated away from.
  await expect(titleInput).toHaveValue('');
  await titleInput.fill(unique);
  await titleInput.blur();
  // The sidebar row reflects the saved title.
  await expect(sidebarRow(page, title, info)).toBeVisible();
}

When('I create a new page titled {string}', async ({ page, $testInfo }, title: string) => {
  await createPageTitled(page, title, $testInfo);
});

Given('I have a page titled {string}', async ({ page, $testInfo }, title: string) => {
  await createPageTitled(page, title, $testInfo);
});

Then('I should see {string} in the sidebar', async ({ page, $testInfo }, title: string) => {
  await expect(sidebarRow(page, title, $testInfo)).toBeVisible();
});

// Ionic keeps the previous route's page mounted (hidden) during transitions,
// so scope queries to the truly VISIBLE page — filtering on visibility (not just
// the absence of .ion-page-hidden) so a page animating out isn't picked.
const active = (page: import('@playwright/test').Page) =>
  page.locator('.ion-page:not(.ion-page-hidden)').filter({ visible: true }).last();

When('I open the page {string}', async ({ page, $testInfo }, title: string) => {
  await sidebarRow(page, title, $testInfo).click();
  await expect(active(page).getByLabel('Page title')).toHaveValue(uniqueTitle(title, $testInfo));
});

When('I reopen the page {string}', async ({ page, $testInfo }, title: string) => {
  await page.goto('/');
  await sidebarRow(page, title, $testInfo).click();
  await expect(active(page).getByLabel('Page title')).toHaveValue(uniqueTitle(title, $testInfo));
});

// Add a block and wait for the new (empty) input to mount + focus before typing,
// so a still-settling create from a prior step doesn't leave us typing into a
// stale block under CI load.
async function addBlockAndFocus(page: import('@playwright/test').Page) {
  const inputs = active(page).getByLabel('Block content');
  const before = await inputs.count();
  await active(page).getByRole('button', { name: '+ Add a block' }).click();
  await expect.poll(() => inputs.count()).toBeGreaterThan(before);
  const input = inputs.last();
  await expect(input).toHaveValue('');
  return input;
}

When('I add a block with the text {string}', async ({ page }, text: string) => {
  const input = await addBlockAndFocus(page);
  // Type character-by-character so markdown shortcuts (e.g. "- ") fire — a
  // one-shot fill() would bypass the per-keystroke transform.
  await input.pressSequentially(text);
  await input.blur();
});

Then('the last block should be a {string} block', async ({ page }, type: string) => {
  // The block wrapper carries a pv-block--<type> class; assert on the real DOM.
  await expect(active(page).locator(`.pv-block.pv-block--${type}`).last()).toBeVisible();
});

When('I type {string} into a new block', async ({ page }, text: string) => {
  // Add a block and type into it WITHOUT blurring — so the slash menu stays open.
  const input = await addBlockAndFocus(page);
  await input.pressSequentially(text);
});

When('I choose {string} from the slash menu', async ({ page }, label: string) => {
  // Scope the option to the slash listbox — a page's "Move page under" <select>
  // also exposes role=option children that would otherwise collide.
  const menu = active(page).getByRole('listbox', { name: 'Block types' });
  await expect(menu).toBeVisible();
  // Match the option whose LABEL span is exactly `label` — the option's own
  // accessible name includes the icon glyph, and a substring match would let
  // "Table" also select "Table of contents".
  await menu
    .getByRole('option')
    .filter({ has: page.getByText(label, { exact: true }) })
    .click();
});

When('I search for {string}', async ({ page, $testInfo }, query: string) => {
  await page
    .getByRole('button', { name: /Search/ })
    .first()
    .click();
  // The query targets a page this scenario created, whose title was uniquified.
  await page.getByLabel('Search pages').fill(uniqueTitle(query, $testInfo));
});

When('I open the search result {string}', async ({ page, $testInfo }, title: string) => {
  const dialog = page.getByRole('dialog', { name: 'Quick find' });
  await dialog.getByText(uniqueTitle(title, $testInfo), { exact: true }).first().click();
});

When('I press Enter to open the top result', async ({ page }) => {
  // Wait for at least one result inside the quick-find dialog, then Enter opens
  // the active (first) one.
  const dialog = page.getByRole('dialog', { name: 'Quick find' });
  await expect(dialog.getByRole('option').first()).toBeVisible();
  await page.getByLabel('Search pages').press('Enter');
});

Then('I should see the open page titled {string}', async ({ page, $testInfo }, title: string) => {
  // Ionic can keep an outgoing page mounted mid-transition, so assert that SOME
  // visible page-title input holds the expected value (not a specific one).
  await expect
    .poll(() =>
      page.getByLabel('Page title').evaluateAll(
        (els, t) =>
          els.some((el) => {
            const i = el as HTMLInputElement;
            return i.offsetParent !== null && i.value === t;
          }),
        uniqueTitle(title, $testInfo),
      ),
    )
    .toBe(true);
});

When('I add a sub-page', async ({ page }) => {
  await active(page).getByRole('button', { name: '+ Add a sub-page' }).click();
  // Wait for the new (empty-title) page to settle as the sole visible editor —
  // Ionic keeps the previous page mounted mid-transition.
  await expect
    .poll(() =>
      page
        .getByLabel('Page title')
        .evaluateAll((els) =>
          els
            .filter((el) => (el as HTMLInputElement).offsetParent !== null)
            .map((el) => (el as HTMLInputElement).value),
        ),
    )
    .toEqual(['']);
});

When('I name the open page {string}', async ({ page, $testInfo }, title: string) => {
  const unique = uniqueTitle(title, $testInfo);
  const input = active(page).getByLabel('Page title');
  await input.fill(unique);
  await input.blur();
  await expect(input).toHaveValue(unique);
});

Then(
  'the breadcrumb for {string} should include {string}',
  async ({ page, $testInfo }, child: string, ancestor: string) => {
    // After naming the open page there's no route transition, so the active
    // page's own breadcrumb is deterministic for this browser. Assert its trail
    // shows both the ancestor and the current page.
    const crumb = active(page).getByTestId('breadcrumb');
    await expect(crumb).toContainText(uniqueTitle(ancestor, $testInfo));
    await expect(crumb).toContainText(uniqueTitle(child, $testInfo));
  },
);

Then('the page footer shows {string}', async ({ page }, text: string) => {
  await expect(active(page).locator('.pv-page-info')).toContainText(text);
});

When('I enter the image URL {string}', async ({ page }, url: string) => {
  const input = active(page).getByLabel('Image URL');
  await input.fill(url);
  await input.blur();
});

Then('the page shows an image {string}', async ({ page }, url: string) => {
  await expect(active(page).locator(`img.pv-block-image[src="${url}"]`)).toBeVisible();
});

When('I move the page under {string}', async ({ page, $testInfo }, parentTitle: string) => {
  const select = active(page).getByLabel('Move page under');
  // The option text is "<icon> <title>"; find the matching option's value.
  // (uniqueTitle leaves seed titles like "Reading list" untouched.)
  const value = await select
    .locator('option', { hasText: uniqueTitle(parentTitle, $testInfo) })
    .first()
    .getAttribute('value');
  await select.selectOption(value!);
});

Then(
  'the move picker shows {string} as the parent',
  async ({ page, $testInfo }, parentTitle: string) => {
    const selected = active(page).getByLabel('Move page under').locator('option:checked');
    await expect(selected).toContainText(uniqueTitle(parentTitle, $testInfo));
  },
);

Then('the block renders {string} in bold', async ({ page }, text: string) => {
  await expect(active(page).locator('.pv-block-preview strong', { hasText: text })).toBeVisible();
});

Then('the block renders {string} struck through', async ({ page }, text: string) => {
  await expect(active(page).locator('.pv-block-preview del', { hasText: text })).toBeVisible();
});

When('I set the {string} cover', async ({ page }, label: string) => {
  await active(page).getByLabel(`Cover ${label}`).click();
});

Then('the page shows a cover banner', async ({ page }) => {
  await expect(active(page).getByTestId('cover-strip')).toBeVisible();
});

When('I collapse the sidebar page {string}', async ({ page, $testInfo }, title: string) => {
  // The row whose OWN open-button shows the title (not an ancestor containing it).
  const unique = uniqueTitle(title, $testInfo).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const row = page
    .locator('.pv-sidebar-tree .pv-sidebar-row')
    .filter({ has: page.getByRole('button', { name: new RegExp(`${unique}$`) }) })
    .first();
  await row.getByRole('button', { name: 'Collapse' }).click();
});

When('I move the page to trash', async ({ page }) => {
  await active(page).getByRole('button', { name: 'Move to trash' }).click();
});

When('I favorite the open page', async ({ page }) => {
  await active(page).getByRole('button', { name: 'Add to favorites' }).click();
});

When('I duplicate the page', async ({ page }) => {
  // Exact match so it doesn't also catch the per-block "Duplicate block" button.
  await active(page).getByRole('button', { name: 'Duplicate', exact: true }).click();
});

Then(
  'I should see {string} in the sidebar favorites',
  async ({ page, $testInfo }, title: string) => {
    await expect(
      page
        .getByRole('navigation', { name: 'Favorites' })
        .getByText(uniqueTitle(title, $testInfo), { exact: true })
        .first(),
    ).toBeVisible();
  },
);

// Downloaded file captured by the export step, read by the assertion steps.
const downloads = new WeakMap<object, { name: string; body: string }>();

When('I export the page as Markdown', async ({ page }) => {
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    active(page).getByRole('button', { name: 'Export Markdown' }).click(),
  ]);
  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const c of stream) chunks.push(c as Buffer);
  downloads.set(page, {
    name: download.suggestedFilename(),
    body: Buffer.concat(chunks).toString('utf8'),
  });
});

Then('the downloaded file is named {string}', async ({ page }, name: string) => {
  // The page title is uniquified per scenario attempt, so its slug carries a
  // suffix (release-notes-<hash>.md). Assert the stem + extension, not exact.
  const stem = name.replace(/\.md$/, '');
  const actual = downloads.get(page)?.name ?? '';
  expect(actual.startsWith(stem)).toBe(true);
  expect(actual.endsWith('.md')).toBe(true);
});

Then('the download contains {string}', async ({ page }, text: string) => {
  expect(downloads.get(page)?.body).toContain(text);
});

Then('I should not see {string} in the sidebar', async ({ page, $testInfo }, title: string) => {
  await expect(sidebarRow(page, title, $testInfo)).toHaveCount(0);
});

When('I restore {string} from the trash', async ({ page, $testInfo }, title: string) => {
  await page.getByRole('button', { name: '🗑 Trash' }).click();
  const row = active(page)
    .locator('.pv-trash-row')
    .filter({ hasText: uniqueTitle(title, $testInfo) })
    .first();
  await row.getByRole('button', { name: 'Restore' }).click();
});

const blockInputs = (page: import('@playwright/test').Page) =>
  active(page).locator('textarea.pv-block-input');

/** Index of the block whose textarea's live value equals `text`. */
async function blockIndexByText(page: import('@playwright/test').Page, text: string) {
  return blockInputs(page).evaluateAll(
    (els, t) => els.findIndex((el) => (el as HTMLTextAreaElement).value === t),
    text,
  );
}

When(
  'I drag the block {string} above the block {string}',
  async ({ page }, from: string, to: string) => {
    const fromIdx = await blockIndexByText(page, from);
    const toIdx = await blockIndexByText(page, to);
    const blocks = active(page).locator('.pv-block');
    // HTML5 drag: Playwright's real-mouse dragTo doesn't reliably fire dragstart/
    // drop, so dispatch the events directly (shared DataTransfer) onto the handle
    // and target — exactly what the block's React handlers listen for.
    await blocks
      .nth(fromIdx)
      .getByLabel(/drag to reorder/i)
      .evaluate((el) => {
        const dt = new DataTransfer();
        el.dispatchEvent(new DragEvent('dragstart', { bubbles: true, dataTransfer: dt }));
        (window as unknown as { __dt: DataTransfer }).__dt = dt;
      });
    await blocks.nth(toIdx).evaluate((el) => {
      const dt = (window as unknown as { __dt: DataTransfer }).__dt;
      el.dispatchEvent(new DragEvent('dragover', { bubbles: true, dataTransfer: dt }));
      el.dispatchEvent(new DragEvent('drop', { bubbles: true, dataTransfer: dt }));
    });
  },
);

Then('the first block should contain {string}', async ({ page }, text: string) => {
  await expect
    .poll(() =>
      blockInputs(page)
        .first()
        .evaluate((el) => (el as HTMLTextAreaElement).value),
    )
    .toContain(text);
});

Then('I should see a block containing {string}', async ({ page }, text: string) => {
  // Honest e2e: assert the real persisted block content is rendered. A block is
  // a textarea, whose VALUE (not text content) holds the string — so poll the
  // live input values until one matches.
  await expect
    .poll(() =>
      blockInputs(page).evaluateAll(
        (els, t) => els.some((el) => (el as HTMLTextAreaElement).value.includes(t)),
        text,
      ),
    )
    .toBe(true);
});

When('I duplicate the first block', async ({ page }) => {
  await active(page).getByLabel('Duplicate block').first().click();
});

Then(
  'I should see {int} blocks containing {string}',
  async ({ page }, count: number, text: string) => {
    await expect
      .poll(() =>
        blockInputs(page).evaluateAll(
          (els, t) => els.filter((el) => (el as HTMLTextAreaElement).value.includes(t)).length,
          text,
        ),
      )
      .toBe(count);
  },
);

When('I toggle full width on', async ({ page }) => {
  await active(page).getByLabel('Toggle full width').click();
});

Then('the page is full width', async ({ page }) => {
  await expect(active(page).locator('.pv-page--wide')).toBeVisible();
});

When('I set the callout icon to {string}', async ({ page }, emoji: string) => {
  await active(page).getByLabel('Callout icon').click();
  const menu = active(page).getByRole('listbox', { name: 'Callout icon' });
  await expect(menu).toBeVisible();
  await menu.getByRole('option', { name: `Icon ${emoji}` }).click();
});

Then('the callout shows the icon {string}', async ({ page }, emoji: string) => {
  await expect(active(page).getByLabel('Callout icon')).toHaveText(emoji);
});

When('I enter the bookmark URL {string}', async ({ page }, url: string) => {
  const input = active(page).getByLabel('Bookmark URL');
  await input.fill(url);
  await input.blur();
});

Then('the page shows a bookmark to {string}', async ({ page }, domain: string) => {
  await expect(
    active(page).locator('.pv-bookmark-domain', { hasText: domain }).first(),
  ).toBeVisible();
});

When('I enter the embed URL {string}', async ({ page }, url: string) => {
  const input = active(page).getByLabel('Embed URL');
  await input.fill(url);
  await input.blur();
});

Then('the page shows an embedded iframe', async ({ page }) => {
  await expect(active(page).locator('iframe.pv-embed-frame').first()).toBeVisible();
});

When(
  'I search page icons for {string} and pick {string}',
  async ({ page }, query: string, emoji: string) => {
    await active(page).getByLabel('Page icon').click();
    await active(page).getByLabel('Search icons').fill(query);
    await active(page).getByLabel(`Set icon ${emoji}`).click();
  },
);

Then('the page icon is {string}', async ({ page }, emoji: string) => {
  await expect.poll(() => active(page).getByLabel('Page icon').innerText()).toContain(emoji);
});
