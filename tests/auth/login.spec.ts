import { test, expect } from '@playwright/test';
import { loginAsDemoUser, loginAsTestUser } from '../../utils/authHelpers';

test.describe('Authentication', () => {
    test('@smoke login page loads', async ({ page }) => {
        await page.goto('/');

        await expect(page).toHaveTitle(/Designer Blinds/i);
    });



    // Testing user cannot login with incorrect email or password
    test('@smoke invalid login shows error message', async ({ page }) => {
        await page.goto('/');

        await page.getByPlaceholder('Email Address').fill('Wrongemail@email.com');
        await page.getByPlaceholder('Password').fill('Wrongpassword');
        await page.getByRole('button', { name: 'Sign In' }).click();
        await expect(page.getByText('Invalid email or password')).toBeVisible();    });
    });



// Testing user can login with correct email and password
    test('@smoke valid login redirects to qoutes dashboard', async ({ page }) => {
        await loginAsTestUser(page);
        await expect(page).toHaveURL('/');
    });



// Testing logout functionailty works as expected
    test('@smoke valid logout returns user to sign in page', async ({ page }) => {
        await loginAsTestUser(page);
        await expect(page).toHaveURL('/');

        await page.getByRole('button', { name: 'Logout' }).click();

        await expect(page).toHaveURL('/signin');
        await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
    })



// Testing protected routes are redirected to signin page
    test('@smoke Unauthenticated user is redirected to sign in page', async ({ page }) => {
        await page.goto('/');

        await expect(page).toHaveURL('/signin');
        await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();

    });



// Testing that try demo button autofills email and password inputs
    test('@smoke user can sign in using demo autofill button', async ({ page }) => {
        await page.goto('/signin');

        await page.getByRole('button', { name: 'Try Demo Account' }).click();

        await expect(page.getByPlaceholder('Email Address')).toHaveValue(process.env.DEMO_EMAIL!);

        await expect(page.getByPlaceholder('Password')).toHaveValue(process.env.DEMO_PASSWORD!);

        await page.getByRole('button', { name: 'Sign In' }).click();

        await expect(page).toHaveURL('/');
    });