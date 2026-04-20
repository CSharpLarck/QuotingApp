import pytest
from playwright.sync_api import expect


@pytest.mark.regression
def test_empty_login_shows_validation(page, base_url):
    page.goto(f"{base_url}", wait_until="domcontentloaded", timeout=30000)

    #Click signin without filling inputs
    page.get_by_role("button", name = "Sign In").click()

    #Stay on signin page
    assert "/signin" in page.url

    #Check email field is invalid (HTML Validaiton)
    email_field = page.locator("input[type='email']")
    assert email_field.evaluate("el => el.checkValidity()") is False

    
@pytest.mark.regression
def test_invalid_login_shows_error(page, base_url):
    page.goto(f"{base_url}/signin", wait_until="domcontentloaded", timeout=30000)

    assert "Designer Blinds" in page.title()
    assert "/signin" in page.url

    page.locator("input[type='email']").fill("fake@test.com")
    page.locator("input[type='password']").fill("fakepassword")
    page.get_by_role("button", name="Sign In").click()

    error_message = page.get_by_text("invalid-credential")
    expect(error_message).to_be_visible()

    assert "/signin" in page.url