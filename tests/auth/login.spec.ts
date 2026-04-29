import { test, expect } from '@playwright/test';
import { goToSignIn, fillLoginForm, submitLogin, loginAsTestUser } from '../../utils/authHelpers';


test.describe('Authentication', () => {

  // Verifies the sign-in page loads successfully and application title renders.
  test('@smoke login page loads', async ({ page }) => {
    await goToSignIn(page);

    await expect(page).toHaveTitle(/Designer Blinds/i);
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();

  });

  // Verifies invalid credentials display the expected authentication error.
  test('@smoke invalid login shows error message', async ({ page }) => {
    await goToSignIn(page);

    await fillLoginForm(page, 'Wrongemail@email.com', 'Wrongpassword');

    await submitLogin(page);

    await expect(page.getByText('Invalid email or password')).toBeVisible();

  });

  // Verifies a valid test user can authenticate and reach the quotes dashboard.
  test('@smoke valid login redirects to quotes dashboard', async ({ page }) => {
    await loginAsTestUser(page);

  });

  // Verifies authenticated users can log out and are returned to the sign-in page.
  test('@smoke valid logout returns user to sign in page', async ({ page }) => {
    await loginAsTestUser(page);

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

  // Kept as regression coverage because it validates a convenience UI flow, not a critical authentication path.
  test('@regression user can sign in using demo autofill button', async ({ page }) => {
    await goToSignIn(page);
    
    await page.getByRole('button', { name: 'Try Demo Account' }).click();

    await expect(page.getByPlaceholder('Email Address')).toHaveValue(/.+/);
    await expect(page.getByPlaceholder('Password')).toHaveValue(/.+/);

    await submitLogin(page);

    await expect(page).toHaveURL('/');


  });
});