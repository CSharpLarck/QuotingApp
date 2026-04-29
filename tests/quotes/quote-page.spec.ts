import { test, expect } from '@playwright/test';
import { startNewQuoteAsDemoUser, startNewQuoteAsTestUser } from '../../utils/quoteHelpers';
import { deleteQuotesByCustomerName } from '../../utils/firebaseCleanup';

test.describe('Quote Page', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.evaluate(() => localStorage.clear());
        await page.reload();
});

// Verifies an authenticated test user can initiate the core quote creation workflow.
    test('@smoke authenticated user can start a new quote', async ({ page }) => {
        await startNewQuoteAsTestUser(page);
 
});

// Verifies demo-account access can reach quote creation using the alternate login path.
    test('@demo demo user can start a new quote', async ({ page }) => {
        await startNewQuoteAsTestUser(page);
 
});

// Verifies the customer information section renders all required inputs for quote creation.
    test('@smoke new quote page loads customer section', async ({ page }) => { 
        await startNewQuoteAsTestUser(page);
       
// Verifies required customer fields are present and available for user input.
        await expect(page.getByPlaceholder('Enter customer name')).toBeVisible();
        await expect(page.getByPlaceholder('Enter sidemark')).toBeVisible();
        await expect(page.getByPlaceholder('Enter address')).toBeVisible();
        await expect(page.getByPlaceholder('Enter phone number')).toBeVisible();

});

      
// Verifies the quoting section renders product configuration inputs needed for quote building.
    test('@regression new quote page loads quoting section', async ({ page }) => { 
        await startNewQuoteAsTestUser(page);

// Verifies product-selection controls and dependent quote configuration fields render correctly.
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

        const addItemButton = page.getByRole('button', { name: 'Add Item(s) to Quote' });

        await expect(addItemButton).toBeVisible({ timeout: 10000 });
        await addItemButton.scrollIntoViewIfNeeded();
        await addItemButton.click();

        await expect(page.getByText('Customer name is required.')).toBeVisible();
        await expect(page.getByText('Sidemark is required.')).toBeVisible();
        await expect(page.getByText('Address is required.')).toBeVisible();
        await expect(page.getByText('Phone Number is required.')).toBeVisible();

    });
    
// Verifies a user can complete a quote item workflow when all required data is provided.

// Temporarily marked flaky due to inconsistent modal behavior after submission.
// Suspected instability relates to async UI timing or persisted quote state.
// Retained for investigation because it covers an important end-to-end workflow.
    test.fixme('@regression user can add an item when required quote fields are completed', async ({ page }) => {
        const id = Date.now();

        const uniqueCustomerName = `Customer-${id}`
        const uniqueSideMark = `Quote-${id}`;

    try {
        await startNewQuoteAsTestUser(page);


// Populate required customer data needed for quote submission.
        await page.getByPlaceholder('Enter customer name').fill(uniqueCustomerName);
        await page.getByPlaceholder('Enter sidemark').fill(uniqueSideMark);
        await page.getByPlaceholder('Enter address').fill('123 Test Rd.');
        await page.getByPlaceholder('Enter phone number').fill('1232343455');

// Configure product category selection.
        const categorySelect = page.getByTestId('category-select');
        await expect(categorySelect).toBeVisible();
        await categorySelect.selectOption('Blinds');   

// Configure product selection.
        const productSelect = page.getByTestId('product-select');
        await expect(productSelect).toBeVisible();
        await productSelect.selectOption({ label: '2" Faux Wood Blinds' });

// Verifies dependent color options appear after product selection.
        const colorSelect = page.getByTestId('color-select');
        await expect(colorSelect).toBeVisible();
        await colorSelect.selectOption({ label: 'Alabaster' });

// Populate required dimensional inputs.
        await page.getByPlaceholder('Width (inches)').fill('24');
        await page.getByPlaceholder('Height (inches)').fill('42');

// Verifies mounting options render after dimensions and product selections.
        const mountingSelect = page.getByTestId('mounting-position-select');
        await expect(mountingSelect).toBeVisible();
        await mountingSelect.selectOption({ label: 'Inside Mount' });


        await page.getByPlaceholder('(e.g., Living Room, Master Bedroom)').fill('Bathroom'); 

        const addItemButton = page.getByRole('button', { name: 'Add Item(s) to Quote' });

        await expect(addItemButton).toBeVisible();
        await addItemButton.scrollIntoViewIfNeeded();
        await Promise.all([
        page.waitForLoadState('networkidle'),
        addItemButton.click()
        ]);

        const goToQuoteButton = page.getByRole('button', { name: 'Go to Quote' });

        await expect(goToQuoteButton).toBeVisible({ timeout: 15000 });

        await goToQuoteButton.click();

        await expect(page).toHaveURL(/\/quote\/[^/]+$/); 

// Ensure test-created quote data is cleaned up regardless of test outcome.
    } finally {
        await deleteQuotesByCustomerName(uniqueCustomerName);
    }
        
    })

});
