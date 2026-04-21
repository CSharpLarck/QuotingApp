import { test, expect } from '@playwright/test';

test.describe('Quote Page', () => {
    test('authenticated user can start a new quote', async ({ page }) => {
        await page.goto('/signin'); 

        await page.getByRole('button', { name: 'Try Demo Account' }).click();
        await page.getByRole('button', { name: 'Sign In' }).click();

        await expect(page).toHaveURL('/');

        await page.getByRole('button', { name: 'Start New Quote' }).click();
        await expect(page).toHaveURL('/quote');

    })
});



// Test for customer information     
    test('new quote page loads customer section', async ({ page }) => { 
        await page.goto('/signin');

        await page.getByRole('button', { name: 'Try Demo Account' }).click();
        await page.getByRole('button', { name: 'Sign In' }).click();

        await expect(page).toHaveURL('/');

        await page.getByRole('button', {name: 'Start New Quote' }).click();
        await expect(page).toHaveURL('/quote');

       
// Checking customer information is rendering properly      
        await expect(page.getByPlaceholder('Enter customer name')).toBeVisible();
        await expect(page.getByPlaceholder('Enter sidemark')).toBeVisible();
        await expect(page.getByPlaceholder('Enter address')).toBeVisible();
        await expect(page.getByPlaceholder('Enter phone number')).toBeVisible();



});

      
// Test for quoting section      
    test('new quote page loads quoting section', async ({ page }) => { 
        await page.goto('/signin');

        await page.getByRole('button', { name: 'Try Demo Account' }).click();
        await page.getByRole('button', { name: 'Sign In' }).click();

        await expect(page).toHaveURL('/');

        await page.getByRole('button', {name: 'Start New Quote' }).click();
        await expect(page).toHaveURL('/quote');

// Checking quoting details is rendering properly              
        await expect(page.getByText('Select Category:')).toBeVisible();
        await expect(page.getByRole('combobox').nth(0)).toBeVisible(); // Category

        await expect(page.getByText('Select Product:')).toBeVisible();
        await expect(page.getByRole('combobox').nth(1)).toBeVisible(); // Product

        await expect(page.getByText('Enter Width:')).toBeVisible();
        await expect(page.getByPlaceholder('Width (inches)')).toBeVisible();

        await expect(page.getByText('Enter Height')).toBeVisible();
        await expect(page.getByPlaceholder('Height (inches)')).toBeVisible();

        await expect(page.getByText('Mounting Position:')).toBeVisible();
        await expect(page.getByRole('combobox').nth(2)).toBeVisible(); // Mounting Position

        await expect(page.getByText('Window Location')).toBeVisible();
        await expect(page.getByPlaceholder('(e.g., Living Room, Master Bedroom)')).toBeVisible();


   
});

        

// Test for Pricing Section 
    test('new quote page loads pricing section', async ({ page }) => { 
        await page.goto('/signin');

        await page.getByRole('button', { name: 'Try Demo Account' }).click();
        await page.getByRole('button', { name: 'Sign In' }).click();

        await expect(page).toHaveURL('/');

        await page.getByRole('button', {name: 'Start New Quote' }).click();
        await expect(page).toHaveURL('/quote');
        
// Checking total price is rendering properly              
        await expect(page.getByText('Total Price: $0')).toBeVisible();
        await expect(page.getByText('Quantity:')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Add Item(s) to Quote'})).toBeVisible();

    
    });