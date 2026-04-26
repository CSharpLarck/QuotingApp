import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../../utils/authHelpers';

test.describe('Authentication', () => {
  test('@smoke login page loads', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Designer Blinds/i);
  });

  test('@smoke invalid login shows error message', async ({ page }) => {
    await page.goto('/');

    await page.getByPlaceholder('Email Address').fill('Wrongemail@email.com');
    await page.getByPlaceholder('Password').fill('Wrongpassword');
    await page.getByRole('button', { name: 'Sign In' }).click();

    await expect(page.getByText('Invalid email or password')).toBeVisible();
  });

  test('@smoke valid login redirects to quotes dashboard', async ({ page }) => {
    await loginAsTestUser(page);
    await expect(page).toHaveURL('/');
  });

  test('@smoke valid logout returns user to sign in page', async ({ page }) => {
    await loginAsTestUser(page);

    await expect(page).toHaveURL('/');

    await page.getByRole('button', { name: 'Logout' }).click();

    await expect(page).toHaveURL('/signin');
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
  });

  test('@smoke unauthenticated user is redirected to sign in page', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveURL('/signin');
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
  });

  test('@smoke user can sign in using demo autofill button', async ({ page }) => {
    await page.goto('/signin');

    await page.getByRole('button', { name: 'Try Demo Account' }).click();

    await expect(page.getByPlaceholder('Email Address')).toHaveValue(/.+/);
    await expect(page.getByPlaceholder('Password')).toHaveValue(/.+/);

    await page.getByRole('button', { name: 'Sign In' }).click();

    await expect(page).toHaveURL('/');
  });
});