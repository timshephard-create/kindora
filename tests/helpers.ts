import { Page } from '@playwright/test';

/**
 * Click a quiz option button by its visible label text.
 * Auto-advance questions don't need a Continue click — just clicking the option advances.
 */
export async function selectOption(page: Page, labelText: string) {
  await page.getByRole('button', { name: labelText }).click();
  // Wait for animation to settle
  await page.waitForTimeout(400);
}

/**
 * Fill a text input (ZIP code etc.) and click Continue.
 */
export async function fillTextAndContinue(page: Page, value: string) {
  await page.locator('input[type="text"]').fill(value);
  await page.getByRole('button', { name: /continue|see my results/i }).click();
  await page.waitForTimeout(400);
}

/**
 * For slider questions, set the value via JS and click Continue.
 * Range inputs don't respond well to fill(), so we use JS evaluation.
 */
export async function setSliderAndContinue(page: Page, value: number) {
  const slider = page.locator('input[type="range"]');
  await slider.evaluate((el: HTMLInputElement, val: number) => {
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype, 'value'
    )?.set;
    nativeInputValueSetter?.call(el, val);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }, value);
  await page.getByRole('button', { name: /continue|see my results/i }).click();
  await page.waitForTimeout(400);
}

/**
 * For multi-select questions, click each option then click Continue.
 */
export async function selectMultiAndContinue(page: Page, labels: string[]) {
  for (const label of labels) {
    await page.getByRole('button', { name: label }).click();
    await page.waitForTimeout(200);
  }
  await page.getByRole('button', { name: /continue|see my results/i }).click();
  await page.waitForTimeout(400);
}

/**
 * Dismiss email capture modal if it appears.
 */
export async function dismissEmailCapture(page: Page) {
  const skipButton = page.getByText('Skip');
  if (await skipButton.isVisible({ timeout: 3000 }).catch(() => false)) {
    await skipButton.click();
    await page.waitForTimeout(500);
  }
}

/**
 * Wait for results to appear.
 */
export async function waitForResults(page: Page, timeout = 30000) {
  await page.waitForSelector('[data-testid="results-container"]', { timeout });
}
