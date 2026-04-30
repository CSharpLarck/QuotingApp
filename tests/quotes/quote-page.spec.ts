import { test, expect } from '@playwright/test';
import { validQuoteItem } from '../../utils/testData/quoteTestData';
import {   startNewQuoteAsDemoUser, 
            startNewQuoteAsTestUser, 
            clickAddItemsToQuote, 
            expectRequiredCustomerFieldErrors
        } from '../../utils/quoteHelpers';

test.describe('Quote Page', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.evaluate(() => localStorage.clear());
        await page.reload();
});

// Verifies demo-account access can reach quote creation using the alternate login path.
    test('@regression demo user can start a new quote', async ({ page }) => {
        await startNewQuoteAsDemoUser(page);
 
});

// Verifies an authenticated test user can initiate the core quote creation workflow.
    test('@smoke authenticated user can start a new quote', async ({ page }) => {
        await startNewQuoteAsTestUser(page);
 
});

// Verifies the customer information section renders all required inputs for quote creation.
    test('@smoke new quote page loads customer section', async ({ page }) => { 
        await startNewQuoteAsTestUser(page);
       
// Verifies required customer fields are present and available for user input.
        await expect(page.getByTestId('customer-name-input')).toBeVisible();
        await expect(page.getByTestId('sidemark-input')).toBeVisible();
        await expect(page.getByTestId('customer-address-input')).toBeVisible();
        await expect(page.getByTestId('customer-phone-number-input')).toBeVisible();

});

      
// Verifies the quoting section renders product configuration inputs needed for quote building.
    test('@regression new quote page loads quoting section', async ({ page }) => { 
        await startNewQuoteAsTestUser(page);

// Verifies product-selection controls and dependent quote configuration fields render correctly.
        const categorySelect = page.getByTestId('category-select');
        await expect(categorySelect).toBeVisible();
        await categorySelect.selectOption(validQuoteItem.category);        
        await expect(page.getByTestId('product-select')).toBeVisible();

        await expect(page.getByText('Enter Width:')).toBeVisible();
        await expect(page.getByTestId('width-input')).toBeVisible();

        await expect(page.getByText('Enter Height:')).toBeVisible();
        await expect(page.getByTestId('height-input')).toBeVisible();

        const mountingSelect = page.getByTestId('mounting-position-select');
        await expect(mountingSelect).toBeVisible();

        await expect(page.getByText('Window Location')).toBeVisible();
        await expect(page.getByTestId('window-location-input')).toBeVisible();

});

        
// Verifies pricing components and add-item controls are present in the quote workflow.
    test('@smoke new quote page loads pricing section', async ({ page }) => { 
        await startNewQuoteAsTestUser(page);
        
        await expect(page.getByText(/Total Price/i)).toBeVisible();
        await expect(page.getByText('Quantity:')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Add Item(s) to Quote'})).toBeVisible();

    });



// Verifies required-field validation blocks incomplete quote submissions.
    test('@regression validation errors appear when user tries to add item with empty required fields', async ({ page }) => {
        await startNewQuoteAsTestUser(page);

        await clickAddItemsToQuote(page);

        await expectRequiredCustomerFieldErrors(page);


    });
    
});
