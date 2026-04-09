import { test, expect } from '@playwright/test';
import {
  selectOption,
  dismissEmailCapture,
  waitForResults,
} from './helpers';

test.describe('BrightWatch', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/bright-watch');
  });

  test('Query 1 — Young child, TV shows', async ({ page }) => {
    // Q1: age (auto-advance)
    await selectOption(page, '2–3 years');
    // Q2: context (auto-advance)
    await selectOption(page, 'Learning time');
    // Q3: medium (auto-advance)
    await selectOption(page, 'TV shows');

    await dismissEmailCapture(page);
    await waitForResults(page);

    // At least 1 result card
    await expect(page.locator('[data-testid="results-container"]')).toBeVisible();
    // Common Sense Media link present
    await expect(page.locator('a[href*="commonsensemedia.org"]').first()).toBeVisible();
    // Disclaimer visible
    await expect(page.locator('[data-testid="disclaimer"]')).toBeVisible();
    // No error state
    await expect(page.getByText('Oops')).not.toBeVisible();
  });

  test('Query 2 — Older child, both media types', async ({ page }) => {
    await selectOption(page, '4–5 years');
    await selectOption(page, 'Co-viewing with parent');
    await selectOption(page, 'Both');

    await dismissEmailCapture(page);
    await waitForResults(page);

    await expect(page.locator('[data-testid="results-container"]')).toBeVisible();
    await expect(page.getByText('Oops')).not.toBeVisible();
  });

  test('Query 3 — Wind-down context, apps', async ({ page }) => {
    await selectOption(page, '12–24 months');
    await selectOption(page, 'Wind-down before bed');
    await selectOption(page, 'Apps & games');

    await dismissEmailCapture(page);
    await waitForResults(page);

    // Results or fallback shown — no crash
    await expect(page.locator('[data-testid="results-container"]')).toBeVisible();
    await expect(page.getByText('Oops')).not.toBeVisible();
  });

  test('Query 4 — Independent play, youngest age', async ({ page }) => {
    await selectOption(page, 'Under 12 months');
    await selectOption(page, 'Independent play');
    await selectOption(page, 'Both');

    await dismissEmailCapture(page);
    await waitForResults(page);

    await expect(page.locator('[data-testid="results-container"]')).toBeVisible();
    await expect(page.locator('[data-testid="disclaimer"]')).toBeVisible();
  });
});
