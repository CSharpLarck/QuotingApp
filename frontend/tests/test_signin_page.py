from playwright.sync_api import sync_playwright, expect

def test_signin_page_loads():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()

        page.goto("http://localhost:3000/signin", wait_until="domcontentloaded")

        assert "Designer Blinds" in page.title()
        assert "/signin" in page.url

        print("Signin Page Loads - SUCCESS!")

        browser.close()

def test_signin_fields_visible():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()

        page.goto("http://localhost:3000/signin", wait_until="domcontentloaded")

        email_field = page.locator("input[type='email']")
        password_field = page.locator("input[type='password']")
        signin_button = page.get_by_role("button", name="Sign In")

        expect(email_field).to_be_visible()
        expect(password_field).to_be_visible()
        expect(signin_button).to_be_visible()

        print("Signin Fields Visible - SUCCESS!")

        browser.close()

if __name__ == "__main__":
    test_signin_page_loads()
    test_signin_fields_visible()
