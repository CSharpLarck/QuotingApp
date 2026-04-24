import { expect, Page } from '@playwright/test';
import { loginAsDemoUser } from './authHelpers';

export async function startNewQuoteAsDemoUser(page: Page) {
    await loginAsDemoUser(page);

    await expect(page).toHaveURL('/');

    await page.getByRole('button', { name: 'Start New Quote' }).click();

    await expect(page).toHaveURL('/quote');

}