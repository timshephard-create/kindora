import { Page, expect } from '@playwright/test';

/**
 * Click a single-select auto-advance option. Waits for the question
 * heading to appear, clicks the option, then waits for the question
 * to change (auto-advance fires after 250ms).
 */
export async function selectAutoAdvance(page: Page, questionText: string, answerText: string) {
  // Wait for question to be visible
  await page.waitForSelector(`h2:has-text("${questionText}")`, { timeout: 10000 });
  // Click the option button containing the answer text
  await page.locator(`button:has-text("${answerText}")`).click();
  // Wait for auto-advance animation (250ms delay + 250ms animation)
  await page.waitForTimeout(600);
}

/**
 * Click a single-select option that does NOT auto-advance,
 * then click Continue.
 */
export async function selectAndContinue(page: Page, questionText: string, answerText: string) {
  await page.waitForSelector(`h2:has-text("${questionText}")`, { timeout: 10000 });
  await page.locator(`button:has-text("${answerText}")`).click();
  await page.waitForTimeout(200);
  await page.locator('button:has-text("Continue"), button:has-text("See my results")').click();
  await page.waitForTimeout(600);
}

/**
 * Fill a text input (ZIP code etc.) and click Continue.
 */
export async function fillTextAndContinue(page: Page, questionText: string, value: string) {
  await page.waitForSelector(`h2:has-text("${questionText}")`, { timeout: 10000 });
  await page.locator('input[type="text"]').fill(value);
  await page.waitForTimeout(200);
  await page.locator('button:has-text("Continue"), button:has-text("See my results")').click();
  await page.waitForTimeout(600);
}

/**
 * Set a range slider value via JS (native range input doesn't respond
 * to fill), then click Continue.
 */
export async function setSliderAndContinue(page: Page, questionText: string, value: number) {
  await page.waitForSelector(`h2:has-text("${questionText}")`, { timeout: 10000 });
  await page.evaluate((val) => {
    const slider = document.querySelector('input[type="range"]') as HTMLInputElement;
    if (!slider) return;
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype, 'value'
    )?.set;
    nativeInputValueSetter?.call(slider, val);
    slider.dispatchEvent(new Event('input', { bubbles: true }));
    slider.dispatchEvent(new Event('change', { bubbles: true }));
  }, value);
  await page.waitForTimeout(300);
  await page.locator('button:has-text("Continue"), button:has-text("See my results")').click();
  await page.waitForTimeout(600);
}

/**
 * For multi-select questions: click each option, then click Continue.
 */
export async function selectMultiAndContinue(page: Page, questionText: string, answers: string[]) {
  await page.waitForSelector(`h2:has-text("${questionText}")`, { timeout: 10000 });
  for (const answer of answers) {
    await page.locator(`button:has-text("${answer}")`).click();
    await page.waitForTimeout(200);
  }
  await page.locator('button:has-text("Continue"), button:has-text("See my results")').click();
  await page.waitForTimeout(600);
}

/**
 * Dismiss email capture modal if it appears (click "Skip").
 */
export async function dismissEmailCapture(page: Page) {
  try {
    const skipLink = page.getByText('Skip', { exact: false });
    await skipLink.waitFor({ state: 'visible', timeout: 5000 });
    await skipLink.click();
    await page.waitForTimeout(500);
  } catch {
    // Modal didn't appear — that's fine
  }
}

/**
 * Wait for results container to appear after quiz completion.
 */
export async function waitForResults(page: Page, timeout = 45000) {
  await page.waitForSelector('[data-testid="results-container"]', { timeout });
}

/**
 * Assert the page didn't crash to error state.
 */
export async function assertNoError(page: Page) {
  await expect(page.getByText('Oops')).not.toBeVisible();
}
