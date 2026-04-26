import { Page } from '@playwright/test';

const demoEmail = process.env.DEMO_EMAIL!;
const demoPassword = process.env.DEMO_PASSWORD!;

const testUserEmail = process.env.TEST_USER_EMAIL!;
const testUserPassword = process.env.TEST_USER_PASSWORD!;

export async function loginAsDemoUser(page: Page) {
    await page.goto('/signin')
    await page.getByRole('button', { name: 'Try Demo Account' }).click();
    await page.getByRole('button', { name: 'Sign In' }).click();

}

export async function loginAsTestUser(page: Page) {
    await page.goto('/signin')
    await page.getByPlaceholder('Email Address').fill(testUserEmail);
    await page.getByPlaceholder('Password').fill(testUserPassword);
    await page.getByRole('button', { name: 'Sign In' }).click();
}