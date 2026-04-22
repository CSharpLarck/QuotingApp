# Quoting App – QA Automation / SDET Project

This project is a real-world B2B SaaS quoting application originally built for a remodeling and wholesale supply business, now used as a full QA Automation testing environment.

The application simulates real production workflows such as authentication, quote creation, product selection, and data persistence. It is being actively developed as a portfolio project to demonstrate modern SDET practices using Playwright and TypeScript.

---

## 🚀 Live Demo

https://designerblinds-c482a.web.app

A demo account is available directly on the sign-in page.

---

## 🔧 Tech Stack

### Application

- React
- Firebase Authentication
- Firestore Database
- Firebase Hosting

### Test Automation (In Progress)

- Playwright
- TypeScript
- End-to-End Testing
- API Testing (Playwright APIRequest)

---

## 🧪 Test Automation Focus

This project focuses on testing real user workflows, not just isolated components.

### Core Flows Being Tested

- User authentication (valid + invalid login)
- Route protection and session handling
- Quote creation and editing
- Form validation and required fields
- Data persistence and retrieval

---

## 🧱 Test Architecture (Planned / In Progress)

- Playwright Test Runner
- Page Object Model (POM)
- Modular test structure (e2e / smoke / regression)
- Reusable fixtures and test data
- Environment-based configuration

---

## ⚡ Test Organization

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