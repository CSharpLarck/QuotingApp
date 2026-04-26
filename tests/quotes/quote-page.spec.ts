import { test, expect } from '@playwright/test';
import { startNewQuoteAsDemoUser, startNewQuoteAsTestUser } from '../../utils/quoteHelpers';
import { deleteQuotesByCustomerName } from '../../utils/firebaseCleanup';

test.describe('Quote Page', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.evaluate(() => localStorage.clear());
        await page.reload();
});

// Authenticated user can start a new quote    
    test('@smoke authenticated user can start a new quote', async ({ page }) => {
        await startNewQuoteAsTestUser(page);
 
});

// Demo User can Sign In
    test('@smoke demo user can start a new quote', async ({ page }) => {
        await startNewQuoteAsDemoUser(page);
 
});
// Test for customer information     
    test('@smoke new quote page loads customer section', async ({ page }) => { 
        await startNewQuoteAsTestUser(page);
       
// Checking customer information is rendering properly      
        await expect(page.getByPlaceholder('Enter customer name')).toBeVisible();
        await expect(page.getByPlaceholder('Enter sidemark')).toBeVisible();
        await expect(page.getByPlaceholder('Enter address')).toBeVisible();
        await expect(page.getByPlaceholder('Enter phone number')).toBeVisible();

});

      
// Test for quoting section      
    test('@regression new quote page loads quoting section', async ({ page }) => { 
        await startNewQuoteAsTestUser(page);

// Checking quoting details is rendering properly              
        const categorySelect = page.getByTestId('category-select');
        await expect(categorySelect).toBeVisible();
        await categorySelect.selectOption('Blinds');
        await expect(page.getByTestId('product-select')).toBeVisible();


        await expect(page.getByText('Enter Width:')).toBeVisible();
        await expect(page.getByPlaceholder('Width (inches)')).toBeVisible();

        await expect(page.getByText('Enter Height')).toBeVisible();
        await expect(page.getByPlaceholder('Height (inches)')).toBeVisible();

        const mountingSelect = page.getByTestId('mounting-position-select');
        await expect(mountingSelect).toBeVisible();

        await expect(page.getByText('Window Location')).toBeVisible();
        await expect(page.getByPlaceholder('(e.g., Living Room, Master Bedroom)')).toBeVisible();

   
});

        

// Test for Pricing Section 
    test('@smoke new quote page loads pricing section', async ({ page }) => { 
        await startNewQuoteAsTestUser(page);
        
// Checking total price is rendering properly              
        await expect(page.getByText(/Total Price/i)).toBeVisible();
        await expect(page.getByText('Quantity:')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Add Item(s) to Quote'})).toBeVisible();

    
    });



// Validation errors appear for required fields when user submits form before field submissions are entered
    test('@regression validation errors appear when user tries to add item with empty required fields', async ({ page }) => {
        await startNewQuoteAsTestUser(page);

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

// TODO: Test is currently flaky due to inconsistent success modal rendering.
// Suspected causes: client validation timing or persisted quote state.
// Kept under investigation.
    test('@flaky user can add an item when required quote fields are completed', async ({ page }) => {
        await startNewQuoteAsTestUser(page);

        const id = Date.now();
        const uniqueCustomerName = `Customer-${id}`
        const uniqueSideMark = `Quote-${id}`;

// Enter required customer information
        await page.getByPlaceholder('Enter customer name').fill(uniqueCustomerName);
        await page.getByPlaceholder('Enter sidemark').fill(uniqueSideMark);
        await page.getByPlaceholder('Enter address').fill('123 Test Rd.');
        await page.getByPlaceholder('Enter phone number').fill('1232343455');

// Category Selection
        const categorySelect = page.getByTestId('category-select');
        await expect(categorySelect).toBeVisible();
        await categorySelect.selectOption('Blinds');   

// Product Selection        
        const productSelect = page.getByTestId('product-select');
        await expect(productSelect).toBeVisible();
        await productSelect.selectOption({ label: '2" Faux Wood Blinds' });

// Wait for color dropdown to appear after product selection
        const colorSelect = page.getByTestId('color-select');
        await expect(colorSelect).toBeVisible();
        await colorSelect.selectOption({ label: 'Alabaster' });

// Dimensions
        await page.getByPlaceholder('Width (inches)').fill('24');
        await page.getByPlaceholder('Height (inches)').fill('42');

// Wait for mounting postion dropdown too
        const mountingSelect = page.getByTestId('mounting-position-select');
        await expect(mountingSelect).toBeVisible();
        await mountingSelect.selectOption({ label: 'Inside Mount' });


        await page.getByPlaceholder('(e.g., Living Room, Master Bedroom)').fill('Bathroom'); 

        const addItemButton = page.getByRole('button', { name: 'Add Item(s) to Quote' });

        await expect(addItemButton).toBeVisible();
        await addItemButton.scrollIntoViewIfNeeded();
        await addItemButton.click();
       

        const okButton = page.getByRole('button', { name: 'OK' });
        await expect(okButton).toBeVisible({ timeout: 10000 });
        await okButton.click();

        await expect(page.getByRole('button', { name: 'Go to Quote' })).toBeVisible({ timeout: 10000 });
        await page.getByRole('button', { name: 'Go to Quote' }).click();


        await expect(page).toHaveURL(/\/quote\/.+/);
    
    })

});
