import { test, expect } from '@playwright/test';
import {
  selectAutoAdvance,
  fillTextAndContinue,
  setSliderAndContinue,
  dismissEmailCapture,
  waitForResults,
  assertNoError,
} from './helpers';

test.describe('HealthGuide', () => {
  test.setTimeout(60000);

  test('Profile 1 — Coverage gap family shows CHIP and gap cards', async ({ page }) => {
    await page.goto('/health-guide');
    await page.waitForSelector('h2', { timeout: 10000 });

    // Triage questions (all auto-advance)
    await selectAutoAdvance(page, 'Why are you looking for coverage', "I've never had insurance");
    await selectAutoAdvance(page, 'children under 19', 'Yes');
    // Q3 skipped (not lost_job)
    await selectAutoAdvance(page, 'faith community', 'No');

    // Profile questions
    await fillTextAndContinue(page, 'ZIP code', '76009');
    await selectAutoAdvance(page, 'household size', 'Family of 3');
    await setSliderAndContinue(page, 'annual household income', 28000);
    // Q8 skipped (never_had)
    await selectAutoAdvance(page, 'family use healthcare', 'Minimal');
    await selectAutoAdvance(page, 'matters most', 'Lowest monthly premium');
    await selectAutoAdvance(page, 'doctors you want', 'Open to finding');
    await selectAutoAdvance(page, 'financial risk', 'Low');

    // Utilization questions (all auto-advance)
    await selectAutoAdvance(page, 'How many people', 'Whole family');
    await selectAutoAdvance(page, 'ongoing prescriptions', 'None');
    await selectAutoAdvance(page, 'Specialist visits', 'None');
    await selectAutoAdvance(page, 'planned procedures', 'None');
    await selectAutoAdvance(page, '$3,000 medical bill', 'No');
    // Q18 skipped (never_had)
    await selectAutoAdvance(page, 'income bracket', '$30k or under');

    await dismissEmailCapture(page);
    await waitForResults(page);

    // Assertions
    await expect(page.locator('[data-testid="coverage-gap-card"]')).toBeVisible();
    await expect(page.locator('[data-testid="chip-card"]')).toBeVisible();
    await assertNoError(page);
    await expect(page.locator('[data-testid="disclaimer"]')).toContainText('Creative Mind Ventures LLC');
  });

  test('Profile 2 — Job loss shows COBRA card, Q8 and Q18 skipped', async ({ page }) => {
    await page.goto('/health-guide');
    await page.waitForSelector('h2', { timeout: 10000 });

    await selectAutoAdvance(page, 'Why are you looking for coverage', 'recently lost job-based coverage');
    await selectAutoAdvance(page, 'children under 19', 'No');
    await selectAutoAdvance(page, 'How long ago', 'Less than 30 days');
    await selectAutoAdvance(page, 'faith community', 'No');

    await fillTextAndContinue(page, 'ZIP code', '76009');
    await selectAutoAdvance(page, 'household size', 'Just me');
    await setSliderAndContinue(page, 'annual household income', 55000);
    // Q8 skipped (lost_job)
    await selectAutoAdvance(page, 'family use healthcare', 'Minimal');
    await selectAutoAdvance(page, 'matters most', 'Balance of both');
    await selectAutoAdvance(page, 'doctors you want', 'Preferred but flexible');
    await selectAutoAdvance(page, 'financial risk', 'Medium');

    await selectAutoAdvance(page, 'How many people', 'Just me');
    await selectAutoAdvance(page, 'ongoing prescriptions', 'None');
    await selectAutoAdvance(page, 'Specialist visits', 'None');
    await selectAutoAdvance(page, 'planned procedures', 'None');
    await selectAutoAdvance(page, '$3,000 medical bill', 'Yes, comfortably');
    // Q18 skipped (lost_job)
    await selectAutoAdvance(page, 'income bracket', '$31');

    await dismissEmailCapture(page);
    await waitForResults(page);

    await expect(page.locator('[data-testid="cobra-card"]')).toBeVisible();
    await assertNoError(page);
    await expect(page.locator('[data-testid="disclaimer"]')).toBeVisible();
  });

  test('Profile 3 — HDHP user sees cash pay and HSA sections', async ({ page }) => {
    await page.goto('/health-guide');
    await page.waitForSelector('h2', { timeout: 10000 });

    await selectAutoAdvance(page, 'Why are you looking for coverage', 'current plan is too expensive');
    await selectAutoAdvance(page, 'children under 19', 'Yes');
    // Q3 skipped
    await selectAutoAdvance(page, 'faith community', 'No');

    await fillTextAndContinue(page, 'ZIP code', '76009');
    await selectAutoAdvance(page, 'household size', 'Family of 5');
    await setSliderAndContinue(page, 'annual household income', 80000);
    await selectAutoAdvance(page, 'employer-sponsored', 'good coverage');
    await selectAutoAdvance(page, 'family use healthcare', 'Moderate');
    await selectAutoAdvance(page, 'matters most', 'I want an HSA');
    await selectAutoAdvance(page, 'doctors you want', 'Preferred but flexible');
    await selectAutoAdvance(page, 'financial risk', 'Medium');

    await selectAutoAdvance(page, 'How many people', 'Whole family');
    await selectAutoAdvance(page, 'ongoing prescriptions', 'Generic only');
    await selectAutoAdvance(page, 'Specialist visits', '1');
    await selectAutoAdvance(page, 'planned procedures', 'None');
    await selectAutoAdvance(page, '$3,000 medical bill', 'Yes, but it would hurt');
    await selectAutoAdvance(page, 'employer offer an HSA', 'Yes');
    await selectAutoAdvance(page, 'income bracket', '$61');

    await dismissEmailCapture(page);
    await waitForResults(page);

    await expect(page.locator('[data-testid="cash-pay-section"]')).toBeVisible();
    await expect(page.locator('[data-testid="hsa-guide"]')).toBeVisible();
    await assertNoError(page);
  });

  test('Profile 4 — Life change, above subsidy threshold', async ({ page }) => {
    await page.goto('/health-guide');
    await page.waitForSelector('h2', { timeout: 10000 });

    await selectAutoAdvance(page, 'Why are you looking for coverage', 'Life change');
    await selectAutoAdvance(page, 'children under 19', 'Yes');
    await selectAutoAdvance(page, 'faith community', 'No');

    await fillTextAndContinue(page, 'ZIP code', '76009');
    await selectAutoAdvance(page, 'household size', 'Family of 5');
    await setSliderAndContinue(page, 'annual household income', 150000);
    await selectAutoAdvance(page, 'employer-sponsored', 'No employer coverage');
    await selectAutoAdvance(page, 'family use healthcare', 'Minimal');
    await selectAutoAdvance(page, 'matters most', 'Balance of both');
    await selectAutoAdvance(page, 'doctors you want', 'Preferred but flexible');
    await selectAutoAdvance(page, 'financial risk', 'Low');

    await selectAutoAdvance(page, 'How many people', 'Whole family');
    await selectAutoAdvance(page, 'ongoing prescriptions', 'None');
    await selectAutoAdvance(page, 'Specialist visits', 'None');
    await selectAutoAdvance(page, 'planned procedures', 'None');
    await selectAutoAdvance(page, '$3,000 medical bill', 'Yes, comfortably');
    // Q18 skipped (employerCoverage=none)
    await selectAutoAdvance(page, 'income bracket', '$101k');

    await dismissEmailCapture(page);
    await waitForResults(page);

    await expect(page.getByText('Your Plan Analysis')).toBeVisible();
    await assertNoError(page);
    await expect(page.locator('[data-testid="disclaimer"]')).toBeVisible();
  });

  test('Profile 5 — Bad ZIP, no crash', async ({ page }) => {
    await page.goto('/health-guide');
    await page.waitForSelector('h2', { timeout: 10000 });

    await selectAutoAdvance(page, 'Why are you looking for coverage', "I've never had insurance");
    await selectAutoAdvance(page, 'children under 19', 'No');
    await selectAutoAdvance(page, 'faith community', 'No');

    await fillTextAndContinue(page, 'ZIP code', '00000');
    await selectAutoAdvance(page, 'household size', 'Just me');
    await setSliderAndContinue(page, 'annual household income', 40000);
    await selectAutoAdvance(page, 'family use healthcare', 'Minimal');
    await selectAutoAdvance(page, 'matters most', 'Balance of both');
    await selectAutoAdvance(page, 'doctors you want', 'Preferred but flexible');
    await selectAutoAdvance(page, 'financial risk', 'Medium');

    await selectAutoAdvance(page, 'How many people', 'Just me');
    await selectAutoAdvance(page, 'ongoing prescriptions', 'None');
    await selectAutoAdvance(page, 'Specialist visits', 'None');
    await selectAutoAdvance(page, 'planned procedures', 'None');
    await selectAutoAdvance(page, '$3,000 medical bill', 'Yes, comfortably');
    await selectAutoAdvance(page, 'income bracket', '$31');

    await dismissEmailCapture(page);

    // Should not crash — either results or graceful error
    await page.waitForTimeout(8000);
    await expect(page.locator('nav')).toContainText('Kindora');
    const bodyText = await page.textContent('body');
    expect(bodyText!.length).toBeGreaterThan(100);
  });
});
