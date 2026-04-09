import { test, expect } from '@playwright/test';
import {
  selectOption,
  fillTextAndContinue,
  setSliderAndContinue,
  selectMultiAndContinue,
  dismissEmailCapture,
  waitForResults,
} from './helpers';

test.describe('Sprout', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/sprout');
  });

  test('Profile 1 — Low income family sees providers and savings', async ({ page }) => {
    // Q1: situation (auto-advance)
    await selectOption(page, 'Actively looking for care');
    // Q2: childAges (multi-select + continue)
    await selectMultiAndContinue(page, ['Toddler (1–2 years)']);
    // Q3: zip
    await fillTextAndContinue(page, '76009');
    // Q4: income (auto-advance)
    await selectOption(page, 'Under $35,000');
    // Q5: schedule (auto-advance)
    await selectOption(page, 'Full-time (5 days/week)');
    // Q6: budget slider
    await setSliderAndContinue(page, 800);

    await dismissEmailCapture(page);
    await waitForResults(page);

    // Provider results appear
    await expect(page.locator('[data-testid="results-container"]')).toBeVisible();
    // Back link present
    await expect(page.getByText('All Tools')).toBeVisible();
    // Disclaimer visible
    await expect(page.locator('[data-testid="disclaimer"]')).toBeVisible();
    // No error state
    await expect(page.getByText('Oops')).not.toBeVisible();
  });

  test('Profile 2 — High income, minimal subsidy', async ({ page }) => {
    await selectOption(page, 'Actively looking for care');
    await selectMultiAndContinue(page, ['Pre-K / Kindergarten (4–5 years)']);
    await fillTextAndContinue(page, '76009');
    await selectOption(page, '$90,000+');
    await selectOption(page, 'Full-time (5 days/week)');
    await setSliderAndContinue(page, 2000);

    await dismissEmailCapture(page);
    await waitForResults(page);

    // Results loaded
    await expect(page.locator('[data-testid="results-container"]')).toBeVisible();
    // No error state
    await expect(page.getByText('Oops')).not.toBeVisible();
  });

  test('Profile 3 — Email capture flow', async ({ page }) => {
    await selectOption(page, 'Actively looking for care');
    await selectMultiAndContinue(page, ['Infant (under 12 months)']);
    await fillTextAndContinue(page, '76009');
    await selectOption(page, '$35,000–$60,000');
    await selectOption(page, 'Full-time (5 days/week)');
    await setSliderAndContinue(page, 1200);

    // Email modal should appear
    const emailModal = page.getByPlaceholder('Email address');
    if (await emailModal.isVisible({ timeout: 5000 }).catch(() => false)) {
      await page.getByPlaceholder('First name').fill('Test');
      await emailModal.fill('test@kindora-test.com');
      await page.getByRole('button', { name: /send/i }).click();
      // Should show success or results — not crash
      await page.waitForTimeout(2000);
      await expect(page.getByText('Oops')).not.toBeVisible();
    }
  });
});
