import { Page } from '@playwright/test';

export async function loginAsDemoUser(page: Page) {
    await page.goto('/signin')
    await page.getByRole('button', { name: 'Try Demo Account' }).click();
    await page.getByRole('button', { name: 'Sign In' }).click();

}

export async function loginAsTestUser(page: Page) {
    await page.goto('/signin')
    await page.getByPlaceholder('Email Address').fill('Testuser1@gmail.com');
    await page.getByPlaceholder('Password').fill('Password');
    await page.getByRole('button', { name: 'Sign In' }).click();
}