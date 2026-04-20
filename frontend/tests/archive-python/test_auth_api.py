import os
from pathlib import Path

import pytest
import requests
from dotenv import load_dotenv

ENV_PATH = Path(__file__).resolve().parents[1] / ".env"
load_dotenv(dotenv_path=ENV_PATH)


#Regression Marker
def get_firebase_id_token():
    api_key = os.getenv("FIREBASE_API_KEY")
    email = os.getenv("TEST_USER_EMAIL")
    password = os.getenv("TEST_USER_PASSWORD")

    url = f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={api_key}"

    payload = {
        "email": email,
        "password": password,
        "returnSecureToken": True
    }

    response = requests.post(url, json=payload)

    assert response.status_code == 200, f"Sign-in failed: {response.text}"

    data = response.json()

    assert "idToken" in data
    return data["idToken"]


@pytest.mark.smoke
def test_lookup_account_returns_user_data():
    api_key = os.getenv("FIREBASE_API_KEY")
    email = os.getenv("TEST_USER_EMAIL")

    id_token = get_firebase_id_token()

    url = f"https://identitytoolkit.googleapis.com/v1/accounts:lookup?key={api_key}"

    payload = {
        "idToken": id_token
    }

    response = requests.post(url, json=payload)

    assert response.status_code == 200, f"Lookup failed: {response.text}"

    data = response.json()

    assert data["kind"] == "identitytoolkit#GetAccountInfoResponse"
    assert "users" in data
    assert len(data["users"]) > 0
    assert data["users"][0]["email"] == email


@pytest.mark.regression
def test_signin_fails_with_invalid_password():
    api_key = os.getenv("FIREBASE_API_KEY")
    email = os.getenv("TEST_USER_EMAIL")

    url = f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={api_key}"

    payload = {
        "email": email,
        "password": "wrongpassword",
        "returnSecureToken": True
    }

    response = requests.post(url, json=payload)

    assert response.status_code == 400

    data = response.json()

    assert data["error"]["message"] == "INVALID_LOGIN_CREDENTIALS"
