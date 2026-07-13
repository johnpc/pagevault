import { createBdd } from 'playwright-bdd';
import { expect, type Page } from '@playwright/test';

const { When, Then } = createBdd();

const active = (page: Page) =>
  page.locator('.ion-page:not(.ion-page-hidden)').filter({ visible: true }).last();
// The table + its toolbar/filter/views bars live in one .pv-table-wrap; scope to
// the last visible one so controls (e.g. "Add filter") resolve to a single node
// even if another page's table lingers in the DOM mid-transition.
const wrap = (page: Page) => active(page).locator('.pv-table-wrap').last();
const table = (page: Page) => wrap(page).locator('.pv-table').last();

When('I fill table cell {string} with {string}', async ({ page }, cell: string, value: string) => {
  const input = table(page).getByLabel(`Cell ${cell}`);
  await input.click();
  await input.fill(value);
  await input.blur();
  await expect(input).toHaveValue(value);
});

When('I add a table row', async ({ page }) => {
  const before = await table(page).locator('tbody tr').count();
  await active(page).getByRole('button', { name: '+ Add row' }).last().click();
  await expect.poll(() => table(page).locator('tbody tr').count()).toBeGreaterThan(before);
});

Then('the table has a cell containing {string}', async ({ page }, value: string) => {
  await expect
    .poll(() =>
      table(page)
        .locator('tbody input')
        .evaluateAll((els, v) => els.some((el) => (el as HTMLInputElement).value === v), value),
    )
    .toBe(true);
});

Then('the table has {int} body rows', async ({ page }, n: number) => {
  await expect(table(page).locator('tbody tr')).toHaveCount(n);
});

When('I set table column {int} type to {string}', async ({ page }, col: number, type: string) => {
  await table(page).getByLabel(`Column ${col} type`).selectOption(type);
  await expect(table(page).getByLabel(`Column ${col} type`)).toHaveValue(type);
});

const checkbox = (page: Page, r: number, c: number) => table(page).getByLabel(`Cell ${r},${c}`);

When(
  'I check the table checkbox in row {int} column {int}',
  async ({ page }, r: number, c: number) => {
    // The checkbox is controlled by the block's data, which updates via an async
    // mutation — so click (not .check(), which wants an instant state flip) and
    // poll until the round-trip lands.
    await checkbox(page, r, c).click();
    await expect(checkbox(page, r, c)).toBeChecked();
  },
);

Then(
  'the table checkbox in row {int} column {int} is checked',
  async ({ page }, r: number, c: number) => {
    await expect(checkbox(page, r, c)).toBeChecked();
  },
);

When('I sort by table column {int}', async ({ page }, col: number) => {
  await table(page).getByLabel(`Sort by column ${col}`).click();
});

// Reads column `col`'s cells top-to-bottom and asserts the first two match.
Then(
  'table column {int} reads {string} then {string}',
  async ({ page }, col: number, first: string, second: string) => {
    await expect
      .poll(async () => {
        const vals = await table(page)
          .locator(`tbody tr td:nth-child(${col + 1}) input`)
          .evaluateAll((els) => els.map((el) => (el as HTMLInputElement).value));
        return vals[0] === first && vals[1] === second;
      })
      .toBe(true);
  },
);

When('I filter table column {int} by {string}', async ({ page }, col: number, query: string) => {
  // Add the first condition row, then set its column + query. The filter bar is
  // a sibling of .pv-table, so scope to the active page.
  await wrap(page).getByLabel('Add filter').click();
  await wrap(page)
    .getByLabel('Filter 1 column')
    .selectOption(String(col - 1));
  await wrap(page).getByLabel('Filter 1 query').fill(query);
  // Wait for the non-destructive filter to take effect (rows re-rendered).
  await expect.poll(() => table(page).locator('tbody tr').count()).toBeGreaterThan(0);
});

When(
  'I add a filter on table column {int} for {string}',
  async ({ page }, col: number, query: string) => {
    // Count existing CONDITION rows by their query inputs (the toolbar row that
    // holds "+ Filter"/match toggle has no query input, so it isn't counted).
    const n = await wrap(page)
      .getByLabel(/^Filter \d+ query$/)
      .count();
    await wrap(page).getByLabel('Add filter').click();
    await wrap(page)
      .getByLabel(`Filter ${n + 1} column`)
      .selectOption(String(col - 1));
    await wrap(page)
      .getByLabel(`Filter ${n + 1} query`)
      .fill(query);
  },
);

When('I clear the table filter', async ({ page }) => {
  await wrap(page).getByLabel('Remove filter 1').click();
});

When(
  'I set the table date in cell {string} to {string}',
  async ({ page }, cell: string, iso: string) => {
    const input = table(page).getByLabel(`Cell ${cell}`);
    await input.fill(iso);
    await expect(input).toHaveValue(iso);
  },
);

When(
  'I set the summary for table column {int} to {string}',
  async ({ page }, col: number, kind: string) => {
    await table(page).getByLabel(`Summary for column ${col}`).selectOption(kind);
    await expect(table(page).getByLabel(`Summary for column ${col}`)).toHaveValue(kind);
  },
);

Then(
  'the table summary for column {int} shows {string}',
  async ({ page }, col: number, value: string) => {
    // The footer cell for column `col` is the (col+1)th cell in the tfoot row
    // (a leading drag-spacer cell precedes the columns).
    const cell = table(page).locator('tfoot tr td').nth(col);
    await expect.poll(() => cell.locator('.pv-table-summary-value').innerText()).toBe(value);
  },
);

When('I hide table column {int}', async ({ page }, col: number) => {
  await table(page).getByLabel(`Hide column ${col}`).click();
});

Then('the table shows {int} column', async ({ page }, n: number) => {
  await expect(table(page).locator('thead .pv-table-head')).toHaveCount(n);
});
Then('the table shows {int} columns', async ({ page }, n: number) => {
  await expect(table(page).locator('thead .pv-table-head')).toHaveCount(n);
});

When('I show table column {int} from properties', async ({ page }, col: number) => {
  await wrap(page).getByLabel('Table properties').click();
  // .click() (not .check()) — the checkbox is controlled, so its checked state
  // updates via the re-render after save, which .check()'s post-assert can race.
  await wrap(page).getByLabel(`Show column ${col}`).click();
});

When(
  'I drag table column {int} before column {int}',
  async ({ page }, from: number, to: number) => {
    const grip = (c: number) => table(page).getByLabel(`Drag column ${c}`);
    const headCell = (c: number) => table(page).locator('thead th').nth(c); // nth(0)=drag spacer
    await grip(from).evaluate((el) => {
      const dt = new DataTransfer();
      el.dispatchEvent(new DragEvent('dragstart', { bubbles: true, dataTransfer: dt }));
      (window as unknown as { __dt: DataTransfer }).__dt = dt;
    });
    await headCell(to).evaluate((el) => {
      const dt = (window as unknown as { __dt: DataTransfer }).__dt;
      el.dispatchEvent(new DragEvent('dragover', { bubbles: true, dataTransfer: dt }));
      el.dispatchEvent(new DragEvent('drop', { bubbles: true, dataTransfer: dt }));
    });
  },
);

Then('table row 1 reads {string} then {string}', async ({ page }, a: string, b: string) => {
  await expect
    .poll(async () => {
      const vals = await table(page)
        .locator('tbody tr')
        .first()
        .locator('input')
        .evaluateAll((els) => els.map((e) => (e as HTMLInputElement).value));
      const ia = vals.indexOf(a);
      const ib = vals.indexOf(b);
      return ia !== -1 && ib !== -1 && ia < ib;
    })
    .toBe(true);
});

When(
  'I link table cell {string} to the page {string}',
  async ({ page }, cell: string, title: string) => {
    await table(page).getByLabel(`Cell ${cell}`).click();
    const menu = table(page).getByRole('listbox', { name: new RegExp(`Cell ${cell}`) });
    await expect(menu).toBeVisible();
    await menu.getByRole('option', { name: title, exact: true }).click();
  },
);

Then('the table has a relation cell showing {string}', async ({ page }, title: string) => {
  await expect(table(page).locator('.pv-relation-chip', { hasText: title }).first()).toBeVisible();
});

When('I save the current table view as {string}', async ({ page }, name: string) => {
  await wrap(page).getByLabel('Save view name').fill(name);
  await wrap(page).getByRole('button', { name: 'Save view', exact: true }).click();
  await expect(wrap(page).getByLabel(`Apply view ${name}`)).toBeVisible();
});

When('I apply the saved table view {string}', async ({ page }, name: string) => {
  await wrap(page).getByLabel(`Apply view ${name}`).click();
});

When('I set the filter match mode to {string}', async ({ page }, mode: string) => {
  await wrap(page).getByLabel('Filter match mode').selectOption(mode);
});
