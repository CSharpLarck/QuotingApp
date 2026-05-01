import { test, expect } from '@playwright/test';
import { deleteQuotesByCustomerName } from '../../utils/firebaseCleanup';
import { validQuoteItem } from '../../utils/testData/quoteTestData';
import {
  startNewQuoteAsTestUser,
  fillCustomerDetails,
  fillValidQuoteItem,
} from '../../utils/quoteHelpers';

test.describe('Quote Workflow', () => {
  test('@regression user can add an item when required quote fields are completed', async ({ page }) => {
    const id = Date.now();
    const uniqueCustomerName = `Customer-${id}`;
    const uniqueSideMark = `Quote-${id}`;

    try {
      await startNewQuoteAsTestUser(page);

      await fillCustomerDetails(page, uniqueCustomerName, uniqueSideMark);
      await fillValidQuoteItem(page, validQuoteItem);

      // Verify key field values persisted before submitting.
      const widthInput = page.getByTestId('width-input');
      const heightInput = page.getByTestId('height-input');
      const roomInput = page.getByTestId('window-location-input');

      await expect(widthInput).toHaveValue(validQuoteItem.width);
      await expect(heightInput).toHaveValue(validQuoteItem.height);
      await expect(roomInput).toHaveValue(validQuoteItem.room);

        // Verify calculated price is populated
        const totalPrice = page.getByTestId('total-price');

        await expect(totalPrice).toBeVisible({ timeout: 10000 });

        await expect(totalPrice).not.toHaveText(/Total Price:\s*\$0$/, {
        timeout: 10000,
        });

        const priceText = await totalPrice.textContent();

        const numericPrice = Number(
        priceText
        ?.replace('Total Price:', '')
        .replace('$', '')
        .replace(',', '')
        .trim()
        );

        expect(numericPrice).toBeGreaterThan(0);
        
      const addItemButton = page.getByRole('button', { name: 'Add Item(s) to Quote' });

      await expect(addItemButton).toBeVisible();
      await expect(addItemButton).toBeEnabled();

      await addItemButton.scrollIntoViewIfNeeded();
      await addItemButton.click();

      const goToQuoteButton = page.getByRole('button', { name: 'Go to Quote' });

      await expect(goToQuoteButton).toBeVisible({ timeout: 15000 });

      await goToQuoteButton.click();

      await expect(page).toHaveURL(/\/quote\/[^/]+$/);
    } finally {
      await deleteQuotesByCustomerName(uniqueCustomerName);
    }
  });
});