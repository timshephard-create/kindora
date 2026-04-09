import { test, expect } from '@playwright/test';
import {
  selectOption,
  fillTextAndContinue,
  setSliderAndContinue,
  dismissEmailCapture,
  waitForResults,
} from './helpers';

test.describe('HealthGuide', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/health-guide');
  });

  test('Profile 1 — Coverage gap family shows CHIP and gap cards', async ({ page }) => {
    // Q1: never_had (auto-advance)
    await selectOption(page, "I've never had insurance");
    // Q2: hasChildren yes (auto-advance)
    await selectOption(page, 'Yes');
    // Q3 skipped (never_had)
    // Q4: faith no (auto-advance)
    await selectOption(page, 'No');
    // Q5: zip
    await fillTextAndContinue(page, '76009');
    // Q6: household (auto-advance)
    await selectOption(page, 'Family of 3–4');
    // Q7: income slider
    await setSliderAndContinue(page, 28000);
    // Q8 skipped (never_had)
    // Q9: healthUsage (auto-advance)
    await selectOption(page, 'Minimal — yearly checkup only');
    // Q10: priority (auto-advance)
    await selectOption(page, 'Lowest monthly premium');
    // Q11: doctor (auto-advance)
    await selectOption(page, 'Open to finding new doctors');
    // Q12: risk (auto-advance)
    await selectOption(page, 'Low — I want predictability');
    // Q13: planMembers (auto-advance)
    await selectOption(page, 'Whole family');
    // Q14: prescriptions (auto-advance)
    await selectOption(page, 'None');
    // Q15: specialist (auto-advance)
    await selectOption(page, 'None');
    // Q16: procedures (auto-advance)
    await selectOption(page, 'None');
    // Q17: cashFlow (auto-advance)
    await selectOption(page, 'No');
    // Q18 skipped (never_had)
    // Q19: incomeBracket (auto-advance)
    await selectOption(page, '$30k or under');

    await dismissEmailCapture(page);
    await waitForResults(page);

    // Coverage gap card visible
    await expect(page.locator('[data-testid="coverage-gap-card"]')).toBeVisible();
    // CHIP card visible
    await expect(page.locator('[data-testid="chip-card"]')).toBeVisible();
    // No error state
    await expect(page.getByText('Oops')).not.toBeVisible();
    // Disclaimer
    await expect(page.locator('[data-testid="disclaimer"]')).toContainText('Creative Mind Ventures LLC');
  });

  test('Profile 2 — Job loss shows COBRA card, skips Q8 and Q18', async ({ page }) => {
    // Q1: lost_job (auto-advance)
    await selectOption(page, 'I recently lost job-based coverage');
    // Q2: no kids (auto-advance)
    await selectOption(page, 'No');
    // Q3: under_30 (auto-advance — only shows for lost_job)
    await selectOption(page, 'Less than 30 days ago');
    // Q4: faith no (auto-advance)
    await selectOption(page, 'No');
    // Q5: zip
    await fillTextAndContinue(page, '76009');
    // Q6: household (auto-advance)
    await selectOption(page, 'Just me');
    // Q7: income slider
    await setSliderAndContinue(page, 55000);
    // Q8 SKIPPED (lost_job)
    // Q9: healthUsage (auto-advance)
    await selectOption(page, 'Minimal — yearly checkup only');
    // Q10: priority (auto-advance)
    await selectOption(page, 'Balance of both');
    // Q11: doctor (auto-advance)
    await selectOption(page, 'Preferred but flexible');
    // Q12: risk (auto-advance)
    await selectOption(page, 'Medium — some risk is fine');
    // Q13: planMembers (auto-advance)
    await selectOption(page, 'Just me');
    // Q14: prescriptions (auto-advance)
    await selectOption(page, 'None');
    // Q15: specialist (auto-advance)
    await selectOption(page, 'None');
    // Q16: procedures (auto-advance)
    await selectOption(page, 'None');
    // Q17: cashFlow (auto-advance)
    await selectOption(page, 'Yes, comfortably');
    // Q18 SKIPPED (lost_job)
    // Q19: incomeBracket (auto-advance)
    await selectOption(page, '$31–$60k');

    await dismissEmailCapture(page);
    await waitForResults(page);

    // COBRA card visible
    await expect(page.locator('[data-testid="cobra-card"]')).toBeVisible();
    // No error state
    await expect(page.getByText('Oops')).not.toBeVisible();
    // Disclaimer visible
    await expect(page.locator('[data-testid="disclaimer"]')).toBeVisible();
  });

  test('Profile 3 — HDHP power user sees cash pay and HSA sections', async ({ page }) => {
    // Q1: too_expensive (auto-advance)
    await selectOption(page, 'My current plan is too expensive');
    // Q2: yes kids (auto-advance)
    await selectOption(page, 'Yes');
    // Q3 skipped (not lost_job)
    // Q4: faith no (auto-advance)
    await selectOption(page, 'No');
    // Q5: zip
    await fillTextAndContinue(page, '76009');
    // Q6: household (auto-advance)
    await selectOption(page, 'Family of 5+');
    // Q7: income slider
    await setSliderAndContinue(page, 80000);
    // Q8: employer (auto-advance)
    await selectOption(page, 'Yes — good coverage (70%+)');
    // Q9: healthUsage (auto-advance)
    await selectOption(page, 'Moderate — a few visits per year');
    // Q10: priority (auto-advance)
    await selectOption(page, 'I want an HSA');
    // Q11: doctor (auto-advance)
    await selectOption(page, 'Preferred but flexible');
    // Q12: risk (auto-advance)
    await selectOption(page, 'Medium — some risk is fine');
    // Q13: planMembers (auto-advance)
    await selectOption(page, 'Whole family');
    // Q14: prescriptions (auto-advance)
    await selectOption(page, 'Generic only');
    // Q15: specialist (auto-advance)
    await selectOption(page, '1–3 visits');
    // Q16: procedures (auto-advance)
    await selectOption(page, 'None');
    // Q17: cashFlow (auto-advance)
    await selectOption(page, 'Yes, but it would hurt');
    // Q18: employerHsa (auto-advance)
    await selectOption(page, 'Yes');
    // Q19: incomeBracket (auto-advance)
    await selectOption(page, '$61–$100k');

    await dismissEmailCapture(page);
    await waitForResults(page);

    // Cash pay section visible
    await expect(page.locator('[data-testid="cash-pay-section"]')).toBeVisible();
    // HSA guide visible
    await expect(page.locator('[data-testid="hsa-guide"]')).toBeVisible();
    // No error state
    await expect(page.getByText('Oops')).not.toBeVisible();
  });

  test('Profile 4 — Life change, above subsidy threshold', async ({ page }) => {
    await selectOption(page, 'Life change (marriage, baby, moved states)');
    await selectOption(page, 'Yes');
    // Q3 skipped
    await selectOption(page, 'No');
    await fillTextAndContinue(page, '76009');
    await selectOption(page, 'Family of 5+');
    await setSliderAndContinue(page, 150000);
    await selectOption(page, 'No employer coverage');
    await selectOption(page, 'Minimal — yearly checkup only');
    await selectOption(page, 'Balance of both');
    await selectOption(page, 'Preferred but flexible');
    await selectOption(page, 'Low — I want predictability');
    await selectOption(page, 'Whole family');
    await selectOption(page, 'None');
    await selectOption(page, 'None');
    await selectOption(page, 'None');
    await selectOption(page, 'Yes, comfortably');
    // Q18 skipped (employerCoverage=none)
    await selectOption(page, '$101k+');

    await dismissEmailCapture(page);
    await waitForResults(page);

    // Results loaded
    await expect(page.getByText('Your Plan Analysis')).toBeVisible();
    // No unhandled error
    await expect(page.getByText('Oops')).not.toBeVisible();
    await expect(page.locator('[data-testid="disclaimer"]')).toBeVisible();
  });

  test('Profile 5 — Bad ZIP, no crash', async ({ page }) => {
    await selectOption(page, "I've never had insurance");
    await selectOption(page, 'No');
    await selectOption(page, 'No');
    await fillTextAndContinue(page, '00000');
    await selectOption(page, 'Just me');
    await setSliderAndContinue(page, 40000);
    await selectOption(page, 'Minimal — yearly checkup only');
    await selectOption(page, 'Balance of both');
    await selectOption(page, 'Preferred but flexible');
    await selectOption(page, 'Medium — some risk is fine');
    await selectOption(page, 'Just me');
    await selectOption(page, 'None');
    await selectOption(page, 'None');
    await selectOption(page, 'None');
    await selectOption(page, 'Yes, comfortably');
    await selectOption(page, '$31–$60k');

    await dismissEmailCapture(page);

    // No white screen crash — either results or graceful error
    await page.waitForTimeout(5000);
    await expect(page.locator('nav')).toContainText('Kindora');
    // Page rendered something (results or error message, but not blank)
    const bodyText = await page.textContent('body');
    expect(bodyText?.length).toBeGreaterThan(100);
  });
});
