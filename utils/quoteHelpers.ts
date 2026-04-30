import { expect, Page } from '@playwright/test';
import { loginAsDemoUser, loginAsTestUser } from './authHelpers';
import { validQuoteItem } from './testData/quoteTestData';


export async function clickStartNewQuote(page: Page) {
  const startQuoteButton = page.getByRole('button', { name: 'Start New Quote' });

  await expect(startQuoteButton).toBeVisible({ timeout: 10000 });
  await startQuoteButton.click();
}

export async function expectQuotePageLoaded(page: Page) {
  await page.waitForURL('**/new-quote/**', { timeout: 10000 });
  await expect(page.getByTestId('category-select')).toBeVisible({ timeout: 15000 });
}

export async function startNewQuote(page: Page) {
  await expect(page).toHaveURL('/');

  await clickStartNewQuote(page);
  await expectQuotePageLoaded(page);
}

export async function startNewQuoteAsDemoUser(page: Page) {
  await loginAsDemoUser(page);
  await startNewQuote(page);
}

export async function startNewQuoteAsTestUser(page: Page) {
  await loginAsTestUser(page);
  await startNewQuote(page);
}

export async function clickAddItemsToQuote(page: Page) {
  const addItemButton = page.getByRole('button', { name: 'Add Item(s) to Quote' });

  await expect(addItemButton).toBeVisible({ timeout: 10000 });
  await addItemButton.scrollIntoViewIfNeeded();
  await addItemButton.click();
}

export async function expectRequiredCustomerFieldErrors(page: Page) {
  await expect(page.getByText('Customer name is required.')).toBeVisible();
  await expect(page.getByText('Sidemark is required.')).toBeVisible();
  await expect(page.getByText('Address is required.')).toBeVisible();
  await expect(page.getByText('Phone Number is required.')).toBeVisible();
}

export async function fillValidQuoteItem(page: Page, quoteItem = validQuoteItem) {
  const categorySelect = page.getByTestId('category-select');
  await expect(categorySelect).toBeVisible();
  await categorySelect.selectOption(quoteItem.category);

  const productSelect = page.getByTestId('product-select');
  await expect(productSelect).toBeVisible();
  await productSelect.selectOption({ label: quoteItem.product });

  const colorSelect = page.getByTestId('color-select');
  await expect(colorSelect).toBeVisible();
  await colorSelect.selectOption({ label: quoteItem.color });

  await page.getByTestId('width-input').fill(quoteItem.width);
  await page.getByTestId('height-input').fill(quoteItem.height);

  const mountingSelect = page.getByTestId('mounting-position-select');
  await expect(mountingSelect).toBeVisible();
  await mountingSelect.selectOption({ label: quoteItem.mountingPosition });

  await page
    .getByTestId('window-location-input')
    .fill(quoteItem.room);
}

export async function fillCustomerDetails(
  page: Page,
  customerName: string,
  sidemark: string
) {
  await page.getByTestId('customer-name-input').fill(customerName);
  await page.getByTestId('sidemark-input').fill(sidemark);
  await page.getByTestId('customer-address-input').fill('123 Test Rd.');
  await page.getByTestId('customer-phone-number-input').fill('1232343455');
}