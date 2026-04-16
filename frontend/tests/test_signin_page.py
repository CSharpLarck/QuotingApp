from playwright.sync_api import expect


def test_signin_page_loads(page):
    page.goto("http://localhost:3000/signin", wait_until="domcontentloaded", timeout=30000)

    assert "Designer Blinds" in page.title()
    assert "/signin" in page.url


def test_signin_fields_visible(page):
    page.goto("http://localhost:3000/signin", wait_until="domcontentloaded", timeout=30000)

    email_field = page.locator("input[type='email']")
    password_field = page.locator("input[type='password']")
    signin_button = page.get_by_role("button", name="Sign in")

    expect(email_field).to_be_visible
    expect(password_field).to_be_visible
    expect(signin_button).to_be_visible

    