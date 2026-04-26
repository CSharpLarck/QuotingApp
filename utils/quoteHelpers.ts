import { expect, Page } from '@playwright/test';
import { loginAsDemoUser, loginAsTestUser } from './authHelpers';

export async function startNewQuoteAsDemoUser(page: Page) {
    await loginAsDemoUser(page);
    await expect(page).toHaveURL('/');
    await page.getByRole('button', { name: 'Start New Quote' }).click();
    await expect(page).toHaveURL('/quote');
    await expect(page.getByTestId('category-select')).toBeVisible({ timeout: 10000 });
    
}

export async function startNewQuoteAsTestUser(page: Page) {
    await loginAsTestUser(page);
    await expect(page).toHaveURL('/');
    await page.getByRole('button', { name: 'Start New Quote' }).click();
    await expect(page).toHaveURL('/quote');
    await expect(page.getByTestId('category-select')).toBeVisible({ timeout: 10000 });
    
}