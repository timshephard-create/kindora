import { test, expect } from '@playwright/test';
import {
  selectOption,
  fillTextAndContinue,
  setSliderAndContinue,
  selectMultiAndContinue,
  dismissEmailCapture,
  waitForResults,
} from './helpers';

test.describe('Nourish', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/nourish');
  });

  test('Profile 1 — Nut allergy family', async ({ page }) => {
    // Q1: householdSize (auto-advance)
    await selectOption(page, 'Family of 3–4');
    // Q2: budget slider
    await setSliderAndContinue(page, 200);
    // Q3: dietary (multi-select + continue)
    await selectMultiAndContinue(page, ['Nut allergy']);
    // Q4: cookingTime (auto-advance)
    await selectOption(page, 'Moderate — up to 45 minutes');
    // Q5: zip
    await fillTextAndContinue(page, '76009');

    await dismissEmailCapture(page);
    await waitForResults(page);

    // 7-day meal plan visible
    await expect(page.locator('[data-testid="results-container"]')).toBeVisible();
    await expect(page.getByText('Monday')).toBeVisible();
    // Disclaimer visible
    await expect(page.locator('[data-testid="disclaimer"]')).toBeVisible();
    // No error
    await expect(page.getByText('Oops')).not.toBeVisible();
  });

  test('Profile 2 — Vegan family', async ({ page }) => {
    await selectOption(page, 'Family of 3–4');
    await setSliderAndContinue(page, 125);
    await selectMultiAndContinue(page, ['Vegan']);
    await selectOption(page, 'Minimal — 15–20 min meals only');
    await fillTextAndContinue(page, '76009');

    await dismissEmailCapture(page);
    await waitForResults(page);

    await expect(page.locator('[data-testid="results-container"]')).toBeVisible();
    await expect(page.getByText('Oops')).not.toBeVisible();
  });

  test('Profile 3 — Multiple restrictions', async ({ page }) => {
    await selectOption(page, 'Family of 3–4');
    await setSliderAndContinue(page, 200);
    await selectMultiAndContinue(page, ['Gluten-free', 'Dairy-free']);
    await selectOption(page, 'Moderate — up to 45 minutes');
    await fillTextAndContinue(page, '76009');

    await dismissEmailCapture(page);
    await waitForResults(page);

    // Plan generates without error
    await expect(page.locator('[data-testid="results-container"]')).toBeVisible();
    await expect(page.getByText('Monday')).toBeVisible();
  });

  test('Profile 4 — Large family, tight budget', async ({ page }) => {
    await selectOption(page, 'Family of 5+');
    await setSliderAndContinue(page, 100);
    await selectMultiAndContinue(page, ['No restrictions']);
    await selectOption(page, 'Batch cooking — I prep once for the week');
    await fillTextAndContinue(page, '76009');

    await dismissEmailCapture(page);
    await waitForResults(page);

    await expect(page.locator('[data-testid="results-container"]')).toBeVisible();
    // Shopping list present
    await expect(page.getByText('Shopping List')).toBeVisible();
    await expect(page.getByText('Oops')).not.toBeVisible();
  });
});
