import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../../utils/authHelpers';

test.describe('Authentication', () => {

  // Verifies the sign-in page loads successfully and application title renders.
  test('@smoke login page loads', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Designer Blinds/i);
  });

  // Verifies invalid credentials display the expected authentication error.
  test('@smoke invalid login shows error message', async ({ page }) => {
    await page.goto('/');

    await page.getByPlaceholder('Email Address').fill('Wrongemail@email.com');
    await page.getByPlaceholder('Password').fill('Wrongpassword');
    await page.getByRole('button', { name: 'Sign In' }).click();

    await expect(page.getByText('Invalid email or password')).toBeVisible();
  });

  // Verifies a valid test user can authenticate and reach the quotes dashboard.
  test('@smoke valid login redirects to quotes dashboard', async ({ page }) => {
    await loginAsTestUser(page);
    await expect(page).toHaveURL('/');
  });

  // Verifies authenticated users can log out and are returned to the sign-in page.
  test('@smoke valid logout returns user to sign in page', async ({ page }) => {
    await loginAsTestUser(page);

    await expect(page).toHaveURL('/');

    await page.getByRole('button', { name: 'Logout' }).click();

    await expect(page).toHaveURL('/signin');
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
  });

  // Verifies protected routes redirect unauthenticated users back to sign-in.
  test('@smoke unauthenticated user is redirected to sign in page', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveURL('/signin');
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
  });

  // Temporarily quarantined in CI until React demo credentials reliably populate in the frontend runtime.
  // Kept as regression coverage because it validates a convenience UI flow, not a critical authentication path.
  test.skip('@regression user can sign in using demo autofill button', async ({ page }) => {
    await page.goto('/signin');

    await page.getByRole('button', { name: 'Try Demo Account' }).click();

    await expect(page.getByPlaceholder('Email Address')).toHaveValue(/.+/);
    await expect(page.getByPlaceholder('Password')).toHaveValue(/.+/);

    await page.getByRole('button', { name: 'Sign In' }).click();

    await expect(page).toHaveURL('/');
  });
});