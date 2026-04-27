import { expect, Page } from '@playwright/test';
import { loginAsDemoUser, loginAsTestUser } from './authHelpers';

async function startNewQuote(page: Page) {
  await expect(page).toHaveURL('/');

  const startQuoteButton = page.getByRole('button', { name: 'Start New Quote' });
  await expect(startQuoteButton).toBeVisible({ timeout: 10000 });

  await startQuoteButton.click();

  await page.waitForURL('**/quote', { timeout: 10000 });
  await expect(page.getByTestId('category-select')).toBeVisible({ timeout: 15000 });
}

export async function startNewQuoteAsDemoUser(page: Page) {
  await loginAsDemoUser(page);
  await startNewQuote(page);
}

export async function startNewQuoteAsTestUser(page: Page) {
  await loginAsTestUser(page);
  await startNewQuote(page);
}