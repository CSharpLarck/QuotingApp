import { test, expect } from '@playwright/test';
import { startNewQuoteAsTestUser } from '../../utils/quoteHelpers';
import { deleteQuotesByCustomerName } from '../../utils/firebaseCleanup';
import { validQuoteItem } from '../data/quoteTestData';


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
        await categorySelect.selectOption(validQuoteItem.category);

// Configure product selection.
        const productSelect = page.getByTestId('product-select');
        await expect(productSelect).toBeVisible();
        await productSelect.selectOption({label: validQuoteItem.product});

// Verifies dependent color options appear after product selection.
        const colorSelect = page.getByTestId('color-select');
        await expect(colorSelect).toBeVisible();
        await colorSelect.selectOption({label: validQuoteItem.color});

// Populate required dimensional inputs.
        await page.getByPlaceholder('Width (inches)').fill(validQuoteItem.width);
        await page.getByPlaceholder('Height (inches)').fill(validQuoteItem.height);

// Verifies mounting options render after dimensions and product selections.
        const mountingSelect = page.getByTestId('mounting-position-select');
        await expect(mountingSelect).toBeVisible();
        await mountingSelect.selectOption({label: validQuoteItem.mountingPosition});

        await page.getByPlaceholder('(e.g., Living Room, Master Bedroom)').fill(validQuoteItem.room); 

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