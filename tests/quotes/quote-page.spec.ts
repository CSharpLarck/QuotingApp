import { test, expect } from '@playwright/test';

test.describe('Quote Page', () => {
    test('authenticated user can start a new quote', async ({ page }) => {
        await page.goto('/signin'); 

        await page.getByRole('button', { name: 'Try Demo Account' }).click();
        await page.getByRole('button', { name: 'Sign In' }).click();

        await expect(page).toHaveURL('/');

        await page.getByRole('button', { name: 'Start New Quote' }).click();
        await expect(page).toHaveURL('/quote');

 
});



// Test for customer information     
    test('new quote page loads customer section', async ({ page }) => { 
        await page.goto('/signin');

        await page.getByRole('button', { name: 'Try Demo Account' }).click();
        await page.getByRole('button', { name: 'Sign In' }).click();

        await expect(page).toHaveURL('/');

        await page.getByRole('button', {name: 'Start New Quote' }).click();
        await expect(page).toHaveURL('/quote');

        await expect(page.getByPlaceholder('Enter customer name')).toBeVisible({ timeout: 15000 });
       
// Checking customer information is rendering properly      
        await expect(page.getByPlaceholder('Enter customer name')).toBeVisible;
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

        await expect(page.getByPlaceholder('Enter customer name')).toBeVisible({ timeout: 15000 });

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

        await expect(page.getByPlaceholder('Enter customer name')).toBeVisible({ timeout: 15000 });
        
// Checking total price is rendering properly              
        await expect(page.getByText('Total Price: $0')).toBeVisible();
        await expect(page.getByText('Quantity:')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Add Item(s) to Quote'})).toBeVisible();

    
    });



// Validation errors appear for required fields when user submits form before field submissions are entered
    test('validation errors appear when user tries to add item with empty required fields', async ({ page }) => {
        await page.goto('/signin');

        await page.getByRole('button', { name: 'Try Demo Account' }).click();
        await page.getByRole('button', { name: 'Sign In'}).click();

        await expect(page).toHaveURL('/');

        await page.getByRole('button', { name: 'Start New Quote' }).click();
        await expect(page).toHaveURL('/quote');

        await expect(page.getByPlaceholder('Enter customer name')).toBeVisible({ timeout: 15000 });

        const addItemButton = page.getByRole('button', { name: 'Add Item(s) to Quote' });

        await expect(addItemButton).toBeVisible({ timeout: 10000 });
        await addItemButton.scrollIntoViewIfNeeded();
        await addItemButton.click();

        await expect(page.getByText('Customer name is required.')).toBeVisible();
        await expect(page.getByText('Sidemark is required.')).toBeVisible();
        await expect(page.getByText('Address is required.')).toBeVisible();
        await expect(page.getByText('Phone Number is required.')).toBeVisible();

    });
    
// User can add an item when required quote fields are completed
    test('user can add an item when required quote fields are completed', async ({ page }) => {
        await page.goto('/signin');

        await page.getByRole('button', { name: 'Try Demo Account' }).click();
        await page.getByRole('button', { name: 'Sign In' }).click();
        await expect(page).toHaveURL('/');

        await page.getByRole('button', { name: 'Start New Quote' }).click();
        await expect(page).toHaveURL('/quote');

        await expect(page.getByPlaceholder('Enter customer name')).toBeVisible({ timeout: 15000 });
// Enter required customer information
        await page.getByPlaceholder('Enter customer name').fill('John Smith');
        await page.getByPlaceholder('Enter sidemark').fill('Test 1');
        await page.getByPlaceholder('Enter address').fill('123 Test Rd.');
        await page.getByPlaceholder('Enter phone number').fill('1232343455');

// Enter required quoting details
        const dropdowns = page.locator('select');
        await dropdowns.nth(0).selectOption({ label: 'Blinds' });
        await dropdowns.nth(1).selectOption({ label: '2" Faux Wood Blinds' });
        
// Wait for color dropdown to appear after product selectio
        await expect(dropdowns.nth(2)).toBeVisible({ timeout: 10000 });
        await dropdowns.nth(2).selectOption({ label: 'Alabaster' });

        await page.getByPlaceholder('Width (inches)').fill('24');
        await page.getByPlaceholder('Height (inches)').fill('42');

// Wait for mounting postion dropdown too
        const mountingDropdown = page.locator('select').filter({ has: page.locator('option', { hasText: 'Inside Mount' })}).first();
        await expect(mountingDropdown).toBeVisible({ timeout: 10000 });
        await mountingDropdown.selectOption({ label: 'Inside Mount' });


        await page.getByPlaceholder('(e.g., Living Room, Master Bedroom)').fill('Bathroom'); 

        const addItemButton = page.getByRole('button', { name: 'Add Item(s) to Quote' });

        await expect(addItemButton).toBeVisible();
        await addItemButton.scrollIntoViewIfNeeded();
        await addItemButton.click()

        await expect(page.getByText('Success!')).toBeVisible();

        await page.getByRole('button', { name: 'OK' }).click();

        await expect(page).toHaveURL('/quote');

    })

});