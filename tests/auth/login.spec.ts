import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
    test('login page loads', async ({ page }) => {
        await page.goto('/');

        await expect(page).toHaveTitle(/Designer Blinds/i);
    });



    // Testing user cannot login with incorrect email or password
    test('invalid login shows error message', async ({ page }) => {
        await page.goto('/');

        await page.getByPlaceholder('Email Address').fill('Wrongemail@email.com');
        await page.getByPlaceholder('Password').fill('Wrongpassword');

        await page.getByRole('button', { name: 'Sign In' }).click();

        await expect(page.getByText('Invalid email or password')).toBeVisible();    });
    });



// Testing user can login with correct email and password
    test('valid login redirects to qoutes dashboard', async ({ page }) => {
        await page.goto('/');

        await page.getByPlaceholder('Email Address').fill('demo@designerblindsapp.com');
        await page.getByPlaceholder('Password').fill('Demo1234!');

        await page.getByRole('button', { name: 'Sign In' }).click();

        await expect(page).toHaveURL('/');
    });



// Testing logout functionailty works as expected
    test('valid logout returns user to sign in page', async ({ page }) => {
        await page.goto('/');

        await page.getByPlaceholder('Email Address').fill('demo@designerblindsapp.com');
        await page.getByPlaceholder('Password').fill('Demo1234!');

        await page.getByRole('button', { name: 'Sign In' }).click();

        await expect(page).toHaveURL('/');

        await page.getByRole('button', { name: 'Logout' }).click();

        await expect(page).toHaveURL('/signin');
        await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
    })



// Testing protected routes are redirected to signin page
    test('Unauthenticated user is redirected to sign in page', async ({ page }) => {
        await page.goto('/');

        await expect(page).toHaveURL('/signin');
        await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();

    });



// Testing that try demo button autofills email and password inputs
    test('user can sign in using demo autofill button', async ({ page }) => {
        await page.goto('/signin');

        await page.getByRole('button', { name: 'Try Demo Account' }).click();

        await expect(
            page.getByPlaceholder('Email Address')
        ).toHaveValue('demo@designerblindsapp.com');

        await expect(
            page.getByPlaceholder('Password')
        ).toHaveValue('Demo1234!');

        await page.getByRole('button', { name: 'Sign In' }).click();

        await expect(page).toHaveURL('/');
    });