from playwright.sync_api import expect

def test_invalid_login_shows_error(page):
    page.goto("http://localhost:3000/signin", wait_until="domcontentloaded", timeout=30000)

    assert "Designer Blinds" in page.title()
    assert "/signin" in page.url

    page.locator("input[type='email']").fill("fake@test.com")
    page.locator("input[type='password']").fill("password")
    page.get_by_role("button", name = "Sign In").click()

    error_message = page.get_by_text("invalid-credential")
    expect(error_message).to_be_visible()

    assert "/signin" in page.url

