from playwright.sync_api import expect


def test_empty_login_shows_validation(page, base_url):
    page.goto(f"{base_url}", wait_until="domcontentloaded", timeout=30000)

    #Click signin without filling inputs
    page.get_by_role("button", name = "Sign In").click()

    #Stay on signin page
    assert "/signin" in page.url

    #Check email field is invalid (HTML Validaiton)
    email_field = page.locator("input[type='email']")
    assert email_field.evaluate("el => el.checkValidity()") is False

    print("Empty form validation test passed")