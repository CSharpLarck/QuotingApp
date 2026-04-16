from playwright.sync_api import expect


def test_valid_login_redirects(page, base_url):
    page.goto(f"{base_url}/signin", wait_until="domcontentloaded", timeout=5000)

    # Fill valid credentials
    page.locator("input[type='email']").fill("testuser1@gmail.com")
    page.locator("input[type='password']").fill("Password")

    # Click login
    page.get_by_role("button", name="Sign In").click()

    # Wait for navigation
    page.wait_for_timeout(5000)

    # Assert user is on the home page after signin
    assert "/" in page.url

    # Expect user to see "Start New Quote" on home page (Double Verification)
    expect(page.get_by_text("Start New Quote")).to_be_visible()

    print("Valid login test passed")

