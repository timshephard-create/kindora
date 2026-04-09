import { test, expect } from '@playwright/test';
import {
  selectAutoAdvance,
  dismissEmailCapture,
  waitForResults,
  assertNoError,
} from './helpers';

test.describe('BrightWatch', () => {
  test.setTimeout(60000);

  test('Query 1 — Young child, TV shows', async ({ page }) => {
    await page.goto('/bright-watch');
    await page.waitForSelector('h2', { timeout: 10000 });

    // All 3 questions are auto-advance
    await selectAutoAdvance(page, 'How old is your child', '2\u20133 years');
    await selectAutoAdvance(page, 'viewing context', 'Learning time');
    await selectAutoAdvance(page, 'type of content', 'TV shows');

    await dismissEmailCapture(page);
    await waitForResults(page);

    await expect(page.locator('[data-testid="results-container"]')).toBeVisible();
    // Common Sense Media link
    await expect(page.locator('a[href*="commonsensemedia.org"]').first()).toBeVisible();
    await expect(page.locator('[data-testid="disclaimer"]')).toBeVisible();
    await assertNoError(page);
  });

  test('Query 2 — Older child, both media', async ({ page }) => {
    await page.goto('/bright-watch');
    await page.waitForSelector('h2', { timeout: 10000 });

    await selectAutoAdvance(page, 'How old is your child', '4\u20135 years');
    await selectAutoAdvance(page, 'viewing context', 'Co-viewing with parent');
    await selectAutoAdvance(page, 'type of content', 'Both');

    await dismissEmailCapture(page);
    await waitForResults(page);

    await expect(page.locator('[data-testid="results-container"]')).toBeVisible();
    await assertNoError(page);
  });

  test('Query 3 — Wind-down, apps', async ({ page }) => {
    await page.goto('/bright-watch');
    await page.waitForSelector('h2', { timeout: 10000 });

    await selectAutoAdvance(page, 'How old is your child', '12\u201324 months');
    await selectAutoAdvance(page, 'viewing context', 'Wind-down before bed');
    await selectAutoAdvance(page, 'type of content', 'Apps & games');

    await dismissEmailCapture(page);
    await waitForResults(page);

    await expect(page.locator('[data-testid="results-container"]')).toBeVisible();
    await assertNoError(page);
  });

  test('Query 4 — Youngest, independent play', async ({ page }) => {
    await page.goto('/bright-watch');
    await page.waitForSelector('h2', { timeout: 10000 });

    await selectAutoAdvance(page, 'How old is your child', 'Under 12 months');
    await selectAutoAdvance(page, 'viewing context', 'Independent play');
    await selectAutoAdvance(page, 'type of content', 'Both');

    await dismissEmailCapture(page);
    await waitForResults(page);

    await expect(page.locator('[data-testid="results-container"]')).toBeVisible();
    await expect(page.locator('[data-testid="disclaimer"]')).toBeVisible();
  });
});
