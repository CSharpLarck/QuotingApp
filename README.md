# Quoting App – QA Automation / SDET Project

Portfolio project demonstrating junior SDET practices using Playwright, TypeScript, UI/API testing, and CI automation via GitHub Actions.

This is a real-world B2B SaaS quoting application originally built for a remodeling and wholesale supply business, now used as a live automation testing environment.

The application simulates production workflows including authentication, quote creation, pricing logic, form validation, and data persistence.

---

## Live Demo

https://designerblinds-c482a.web.app

A demo account is available directly on the sign-in page.

---

## Tech Stack

### Application
- React  
- Firebase Authentication  
- Firestore Database  
- Firebase Hosting  

### Test Automation
- Playwright  
- TypeScript  
- End-to-End Testing  
- API Testing (Playwright APIRequest)  
- GitHub Actions (CI)

---

## Current Test Coverage

- 20+ automated tests  
- 5 critical user workflows covered  
- Smoke and regression suites implemented  
- UI and API validation coverage in progress  

### Core Flows Tested
- User authentication (valid + invalid login)  
- Route protection and session handling  
- Quote creation and editing  
- Form validation and required fields  
- Data persistence and retrieval  

---

## Test Architecture

- Playwright Test Runner  
- Page Object Model (POM)  
- Modular test structure (e2e / smoke / regression)  
- Reusable fixtures and test data  
- Environment-based configuration  

```text
tests/
  e2e/
    auth/
    quotes/
  smoke/
  regression/
  pages/
  fixtures/
  utils/
```

---

## CI/CD

Automated UI tests run through GitHub Actions on every push to `main`.

Pipeline:
- Installs dependencies  
- Executes Playwright test suite  
- Surfaces failures during CI before changes are merged  

---

## Why This Project

Unlike tutorial automation projects, this framework tests a real application used in business workflows, including pricing logic, authentication, and persisted quote data.

The goal is to demonstrate practical SDET skills around automation design, system validation, and continuous testing.

---

## Example Test

```ts
test('invalid login shows validation error', async ({ page }) => {
  await page.goto('/signin');
  await page.fill('#email', 'bad@test.com');
  await page.fill('#password', 'wrongpass');
  await page.click('text=Sign In');

  await expect(
    page.getByText(/invalid/i)
  ).toBeVisible();
});
```

---

## Run Tests Locally

```bash
npm install
npx playwright test
```

Run smoke suite only:

```bash
npx playwright test -m smoke
```

---

## Repository Purpose

This repository serves as:
- QA Automation / SDET portfolio project  
- Real-world Playwright testing framework  
- Sandbox for expanding UI and API automation coverage  
- Continuous learning project focused on scalable test engineering