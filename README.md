# Quoting App – QA Automation / SDET Project

Portfolio project demonstrating junior SDET practices using Playwright, TypeScript, UI/API testing, and CI/CD automation with GitHub Actions.

This is a real-world B2B SaaS quoting application originally built for a remodeling and wholesale supply business, now used as a live automation testing environment for test design, debugging, and continuous testing.

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

### DevOps / CI/CD
- GitHub  Actions  
- Automated Test Pipelines  
- Test-Gated Deployment Workflow  
- Firebase Hosting Deployment Automation

---

## Current Test Coverage

- 20+ automated tests  
- Smoke and regression suites implemented  
- Critical quote workflow coverage in place  
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


- Refactored test setup using reusable helper functions for authentication and quote creation flows
- Investigated and documented flaky UI modal behavior in add-item workflow

// TODO: Investigate flaky add-item modal test (possible localStorage or async timing issue)