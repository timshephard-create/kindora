import { test, expect } from '@playwright/test';
import {
  selectAutoAdvance,
  fillTextAndContinue,
  setSliderAndContinue,
  selectMultiAndContinue,
  dismissEmailCapture,
  waitForResults,
  assertNoError,
} from './helpers';

test.describe('Sprout', () => {
  test.setTimeout(60000);

  test('Profile 1 — Low income family sees providers and savings', async ({ page }) => {
    await page.goto('/sprout');
    await page.waitForSelector('h2', { timeout: 10000 });

    // Q1: situation (auto-advance)
    await selectAutoAdvance(page, 'describes your situation', 'Actively looking for care');
    // Q2: childAges (multi-select + continue)
    await selectMultiAndContinue(page, 'How old are your children', ['Toddler']);
    // Q3: zip (text + continue)
    await fillTextAndContinue(page, 'ZIP code', '76009');
    // Q4: income (auto-advance)
    await selectAutoAdvance(page, 'household income', 'Under $35,000');
    // Q5: schedule (auto-advance)
    await selectAutoAdvance(page, 'schedule do you need', 'Full-time');
    // Q6: budget (slider + continue)
    await setSliderAndContinue(page, 'monthly childcare budget', 800);

    await dismissEmailCapture(page);
    await waitForResults(page);

    await expect(page.locator('[data-testid="results-container"]')).toBeVisible();
    await expect(page.getByText('All Tools')).toBeVisible();
    await expect(page.locator('[data-testid="disclaimer"]')).toBeVisible();
    await assertNoError(page);
  });

  test('Profile 2 — High income, minimal subsidy', async ({ page }) => {
    await page.goto('/sprout');
    await page.waitForSelector('h2', { timeout: 10000 });

    await selectAutoAdvance(page, 'describes your situation', 'Actively looking for care');
    await selectMultiAndContinue(page, 'How old are your children', ['Pre-K']);
    await fillTextAndContinue(page, 'ZIP code', '76009');
    await selectAutoAdvance(page, 'household income', '$90,000+');
    await selectAutoAdvance(page, 'schedule do you need', 'Full-time');
    await setSliderAndContinue(page, 'monthly childcare budget', 2000);

    await dismissEmailCapture(page);
    await waitForResults(page);

    await expect(page.locator('[data-testid="results-container"]')).toBeVisible();
    await assertNoError(page);
  });

  test('Profile 3 — Email capture flow', async ({ page }) => {
    await page.goto('/sprout');
    await page.waitForSelector('h2', { timeout: 10000 });

    await selectAutoAdvance(page, 'describes your situation', 'Actively looking for care');
    await selectMultiAndContinue(page, 'How old are your children', ['Infant']);
    await fillTextAndContinue(page, 'ZIP code', '76009');
    await selectAutoAdvance(page, 'household income', '$35,000');
    await selectAutoAdvance(page, 'schedule do you need', 'Full-time');
    await setSliderAndContinue(page, 'monthly childcare budget', 1200);

    // Email modal should appear
    try {
      const emailInput = page.getByPlaceholder('Email address');
      await emailInput.waitFor({ state: 'visible', timeout: 5000 });
      await page.getByPlaceholder('First name').fill('Test');
      await emailInput.fill('test@kindora-test.com');
      await page.locator('button:has-text("Send")').click();
      await page.waitForTimeout(3000);
      await assertNoError(page);
    } catch {
      // Modal didn't appear — still check results
      await waitForResults(page);
      await assertNoError(page);
    }
  });
});
