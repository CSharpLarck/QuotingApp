import { Page, expect } from '@playwright/test';

const TEST_USER_EMAIL = process.env.TEST_USER_EMAIL!;
const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD!;

export async function goToSignIn(page: Page) {
  await page.goto('/signin');
  await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
}

export async function fillLoginForm(page: Page, email: string, password: string) {
  await page.getByTestId('email-input').fill(email);
  await page.getByTestId('password-input').fill(password);
}

export async function submitLogin(page: Page) {
  await page.getByRole('button', { name: 'Sign In' }).click();
}

export async function loginAsDemoUser(page: Page) {
  await goToSignIn(page);

  await page.getByRole('button', { name: 'Try Demo Account' }).click();
  await submitLogin(page);

  await expect(page).toHaveURL('/');
}

export async function loginAsTestUser(page: Page) {
  await goToSignIn(page);

  await fillLoginForm(page, TEST_USER_EMAIL, TEST_USER_PASSWORD);
  await submitLogin(page);

  await expect(page).toHaveURL('/');
}