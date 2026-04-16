import pytest   
from playwright.sync_api import sync_playwright


BASE_URL = "http://localhost:3000"


@pytest.fixture
def page():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        yield page
        browser.close()


@pytest.fixture
def base_url():
    return BASE_URL