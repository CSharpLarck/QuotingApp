import { Page } from '@playwright/test';

export async function loginAsDemoUser(page: Page) {
    await page.goto('/signin')
    await page.getByRole('button', { name: 'Try Demo Account' }).click();
    await page.getByRole('button', { name: 'Sign In' }).click();

}