# Quoting App – QA Automation Project

This project is a real-world SaaS quoting application originally built for business use and now used as a testing environment for QA automation.

It includes both UI and API test coverage and is designed to simulate real-world SDET workflows.

---

## 🔧 Tech Stack

**Frontend / App**

* React (local dev server)
* Firebase Authentication

**Test Automation**

* Python
* Pytest
* Playwright (UI testing)
* Requests (API testing)
* python-dotenv (environment config)

---

## 🧪 Test Automation Coverage

### UI Testing (Playwright)

* Sign-in page validation
* Field visibility checks
* Invalid login handling
* Required field validation
* Successful login flow

### API Testing (Pytest + Requests)

* Firebase authentication (signInWithPassword)
* Authenticated account lookup
* Negative auth testing (invalid credentials)
* Backend response validation (status codes + JSON)

---

## 🧱 Test Architecture

* Pytest fixtures for setup/teardown
* Session-scoped browser for faster execution
* Page-level isolation for test reliability
* Environment-based configuration via `.env`
* Modular and reusable test structure

---

## ⚡ Test Organization

Tests are grouped using Pytest markers:

* **smoke** → critical flows (login, core functionality)
* **regression** → deeper validation and negative test cases

Run specific groups:

```bash
# Run smoke tests
python -m pytest -m smoke

# Run regression tests
python -m pytest -m regression

# Run full suite
python -m pytest
```

---

## 🚀 Running the Project Locally

### 1. Start the frontend app

```bash
cd frontend
npm install
npm start
```

App runs on:

```
http://localhost:3000
```

---

### 2. Install Python dependencies

```bash
pip install -r requirements.txt
```

---

### 3. Set up environment variables

Create a `.env` file in the `frontend` directory:

```text
FIREBASE_API_KEY=your_api_key_here
TEST_USER_EMAIL=your_test_email
TEST_USER_PASSWORD=your_test_password
```

⚠️ Do not commit `.env` to version control.

---

### 4. Run tests

```bash
python -m pytest
```

Optional:

```bash
# Run in parallel
python -m pytest -n auto
```

---

## 🎯 Purpose

This project demonstrates:

* End-to-end UI automation using Playwright
* API testing and validation using Requests
* Authentication flow testing (positive + negative)
* Test organization using pytest fixtures and markers
* Real-world debugging and environment handling

---

## 📌 Current Status

* UI and API test coverage implemented
* Authentication flows fully tested
* Test suite optimized for speed (parallel execution)
* Environment-based configuration in place

🚧 Next Steps:

* Expand quote workflow API testing
* Add end-to-end UI + API validation
* Introduce CI/CD pipeline (GitHub Actions)
