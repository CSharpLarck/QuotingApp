import pytest
import urllib.request
import urllib.error
from playwright.sync_api import sync_playwright


BASE_URL = "http://localhost:3000"


def is_server_up(url: str) -> bool:
    try: 
        with urllib.request.urlopen(url, timeout=5) as response:
            return 200 <= response.status < 500
    except (urllib.error.URLError, ValueError):
        return False


@pytest.fixture
def base_url():
    return BASE_URL


@pytest.fixture
def page(base_url):
    if not is_server_up(base_url):
        pytest.fail(
            f"Frontend server is not reachable at {base_url}. "
            "Start the app with 'npm start' before running tests."
        )

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        yield page
        browser.close()

