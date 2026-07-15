import { createBdd } from 'playwright-bdd';
import { expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const { When, Then } = createBdd();

When('I open the home screen', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'New page' })).toBeVisible();
});

// Scans the current page with axe-core and fails on any serious/critical
// violation (WCAG 2 A/AA). Keeps the baseline honest — color contrast, landmark
// nesting, labels, etc. regressions get caught in CI, not by eye.
/** One axe pass over the current page → its serious/critical violations. */
async function seriousViolations(page: import('@playwright/test').Page) {
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  return results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
}

Then('the page has no serious accessibility violations', async ({ page }) => {
  // Poll the scan until it's clean. Ionic's page/modal open is a finite opacity
  // fade — mid-fade a muted color blends toward the bg and axe reads a transient
  // sub-AA contrast (a false positive on a frame the user never sees; only
  // reproducible under parallel CPU load where the fade runs slow). Re-scanning
  // waits the fade out, yet still fails hard on a REAL violation that persists
  // past expect's timeout — so the audit stays honest, just not frame-racy.
  let serious: Awaited<ReturnType<typeof seriousViolations>> = [];
  await expect
    .poll(async () => (serious = await seriousViolations(page)).length, { timeout: 15_000 })
    .toBe(0);
  const summary = serious.map((v) => `${v.id} (${v.nodes.length})`).join(', ');
  expect(serious, `axe violations: ${summary}`).toEqual([]);
});
