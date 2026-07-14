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
Then('the page has no serious accessibility violations', async ({ page }) => {
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  const serious = results.violations.filter(
    (v) => v.impact === 'serious' || v.impact === 'critical',
  );
  const summary = serious.map((v) => `${v.id} (${v.nodes.length})`).join(', ');
  expect(serious, `axe violations: ${summary}`).toEqual([]);
});
