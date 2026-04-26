# Quoting App — QA Automation / SDET Portfolio Project

[![Playwright Tests](https://github.com/matthewlarck-portfolio/QuotingApp/actions/workflows/playwright.yml/badge.svg)](https://github.com/matthewlarck-portfolio/QuotingApp/actions/workflows/playwright.yml)

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

Portfolio project demonstrating junior SDET practices using Playwright, TypeScript, UI/API testing, and CI/CD automation with GitHub Actions.

This is a real-world B2B SaaS quoting application originally built for business use and now used as a live automation testing environment for test design, debugging, and continuous testing.

The application includes workflows involving:

- Authentication  
- Quote creation  
- Pricing logic  
- Form validation  
- Firestore data persistence

---

## Live Demo

https://designerblinds-c482a.web.app

A demo account is available on the sign-in page.

---

## Tech Stack

### Application
- React  
- Firebase Authentication  
- Firestore  
- Firebase Hosting

### Test Automation
- Playwright  
- TypeScript  
- End-to-End Testing  
- API Testing (in progress)

### CI/CD
- GitHub Actions  
- Test-gated deployment workflow

---

## Current Test Coverage

Current automated coverage includes:

- Authentication workflows  
- Quote creation validation  
- Required field validation  
- Pricing section checks  
- Critical-path smoke tests

Additional regression coverage in progress.

---

## Test Architecture

- Playwright Test Runner  
- Reusable helper abstractions  
- Page Object Model patterns (in progress)  
- Fixture-driven test setup  
- Environment-based configuration  

```text
tests/
 ├── auth/
 └── quotes/

utils/
fixtures/
.github/workflows/
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm
- Playwright browsers

### Clone repository

```bash
git clone https://github.com/matthewlarck-portfolio/QuotingApp.git
cd QuotingApp
```

### Install root dependencies

```bash
npm ci
```

### Install frontend dependencies

```bash
cd frontend
npm ci
```

### Install Playwright browsers

```bash
cd ..
npx playwright install
```

### Start the development server

```bash
cd frontend
npm start
```

### Run tests (from project root)

Open a second terminal:

```bash
# From project root
npm run test:e2e
npm run test:smoke
npm run test:regression
```

### Notes

- Local development currently uses a two-terminal workflow:
  - Terminal 1 runs the React development server
  - Terminal 2 runs Playwright tests

- GitHub Actions runs smoke and regression suites in CI.

- Test credentials are managed through environment variables using:

```bash
.env
.env.example
GitHub Actions secrets
```

---

## Recent Improvements

- Added smoke test tagging for critical workflows  
- Refactored reusable helpers for auth and quote setup  
- Investigating flaky add-item modal behavior  
- Improving condition-based waits to reduce flakiness

---

## Roadmap

- Expand regression coverage  
- Add quote edit/delete coverage  
- Expand API validation  
- Continue reducing flaky behavior
