from playwright.sync_api import sync_playwright, expect

def test_invalid_login_shows_error():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()

        page.goto("http://localhost:3000/signin", wait_until="domcontentloaded")

        # Verify Starting State
        assert "Designer Blinds" in page.title()
        assert "/signin" in page.url

        # Fill in invalid credentials
        page.locator("input[type='email']").fill("fake@test.com")
        page.locator("input[type='password']").fill("password")

        # Click Sign In
        page.get_by_role("button", name = "Sign In").click()

        # Verify error appears in UI
        error_message = page.get_by_text("invalid-credential)")
        expect(error_message).to_be_visible()

        # Verify user is still on sign-in page
        assert "/signin" in page.url

        print("Invalid login test passed")

        page.wait_for_timeout(5000)
        browser.close()

if __name__ == "__main__":
    test_invalid_login_shows_error()

            