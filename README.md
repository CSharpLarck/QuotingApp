# Quoting App — QA Automation / SDET Portfolio Project

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
- Environment-based configuration (planned)

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

```bash
npm ci
npx playwright install
npm start
npm run test:e2e
npm run test:smoke
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