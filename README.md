# CollatXSmart — Smart Loan Management and Financial Services Platform

CollatXSmart is a modern, responsive, bilingual web application designed for a finance company operating in Coimbatore and nearby areas of Tamil Nadu, India. It functions as a public finance company portal, a client loan ledger manager, and an administrative platform for loan approvals and payment collections.

Simultaneously, this project functions as a **CLF (Client-side/Full-stack Web Development) laboratory project**, demonstrating 20 key academic syllabus requirements.

---

## 1. Features

### Public Website & Branding
- **Fintech Brand Aesthetic**: Premium charcoal/dark layout, warm orange accent highlights, cream/pearl sections, rounded cards, and smooth micro-animations inspired by modern financial interfaces.
- **Bilingual Interface**: Toggle between English and Tamil (`EN | தமிழ்`) instantly across all pages, navbars, forms, and validation alerts.
- **Dynamic Multi-Step Loan Application**: Wizard form for applicants including personal details, configurable loan parameters, conditional collateral subforms, and document uploads.

### Administrative Panel (Admin Portal)
- **Aggregated Analytics Summary**: Aggregate customer counts, active loans, pending requests, overdue states, and collection totals (Today vs. Cumulative). Renders line charts of collection trends and pie charts of loan distributions.
- **Administrative Loan Inspector**: Review applications and configure approved principal, interest rates, interest methods (Flat vs. Reducing Balance), repayment frequency (Daily, Weekly, Monthly), and start dates.
- **Manual Payment Recorder**: Record UPI and cash payments. Automatically credits balances, recalculates installments sequentially, and triggers audit logs.
- **Collateral & Documents Auditor**: Inspect and update collateral holdings (Verified vs. Released) and verify uploaded KYC files.

### Customer Portal
- **Core Financial Card**: Live balances showing approved principal, paid amounts, outstanding debts, next payment due, and due date.
- **Schedules Timeline**: Interactive schedules showing installment statuses: Paid, Due, Overdue, or Upcoming.
- **Transaction Logs**: tabular list of cash credits and UPI receipts.
- **Secure File Locker**: Upload KYC/deeds and download files securely.

---

## 2. Technology Stack

- **Frontend**: React (Vite SPA, React Router DOM, Tailwind CSS/Vanilla CSS, Recharts, Lucide React, CDN-loaded jQuery in lab context).
- **Backend API**: Node.js, Express, Multer (file uploads), JWT (Role authorization), Crypto (hashing).
- **Database Layer**: SQLite (Zero-config, relational SQL file-based engine).
- **CLF Demonstration Server**: Native Node.js `http.createServer` instance running on Port 5001.

---

## 3. Architecture Overview

```text
CollatXSmart/
├── database/
│   ├── schema.sql         <-- Relational SQL tables
│   └── collatxsmart.db    <-- Generated SQLite file
├── backend/
│   ├── server.js          <-- Server entrypoint (Express + Native Node HTTP)
│   ├── config/            <-- Environment and Config loaders
│   ├── database/
│   │   └── db.js          <-- Database Connection and Seeds helper
│   ├── controllers/       <-- Handlers for Auth, Loans, Payments, Docs, Reports
│   ├── routes/            <-- REST API routes
│   ├── middleware/        <-- JWT Auth and Multer uploads middleware
│   ├── services/          <-- Loan Calculation and Audit log services
│   ├── events/            <-- paymentReceived EventEmitter listeners
│   ├── utils/             <-- Late penalty assessors
│   └── uploads/           <-- Secure directory for document uploads
└── frontend/
    ├── index.html
    ├── src/
    │   ├── App.jsx        <-- SPA router config
    │   ├── index.css      <-- Custom CSS Box model style tokens
    │   ├── context/       <-- Language and Authentication context providers
    │   ├── components/    <-- Navigation bars, Footers, and Route protectors
    │   └── pages/         <-- Public, Customer, Admin, and CLF Lab page bundles
    └── package.json
```

---

## 4. Setup & Running the Application

### Prerequisites
- Node.js (v16.x or newer)
- npm (Node package manager)

### 1. Environment Variables Configuration
Create a `.env` file in the root directory:
```env
PORT=5000
JWT_SECRET=super_secret_key_change_me_in_production
DATABASE_PATH=../database/collatxsmart.db
UPLOAD_DIR=./uploads
LAB_SERVER_PORT=5001
```

### 2. Running Backend Server
Install dependencies and launch the backend:
```bash
cd backend
npm install
npm start
```
*Note: This automatically initializes the SQLite database at `database/collatxsmart.db` and loads schema/seed profiles on the first boot.*

### 3. Running Frontend Server
Install dependencies and launch Vite:
```bash
cd ../frontend
npm install
npm run dev
```
Open your browser at `http://localhost:5173/` to view the application.

---

## 5. API Documentation

### Auth Endpoints
- `POST /api/auth/login`: Accepts `email` and `password`. Returns JWT and user context.
- `GET /api/auth/me`: Reads authorization header token. Returns verified profile details.

### Loan Endpoints
- `POST /api/loan-applications`: Submits a dynamic application (personal details + dynamic collateral + credentials).
- `GET /api/loan-applications`: Lists submitted applications.
- `PUT /api/loan-applications/:id`: Admin reviews parameters and approves/rejects application.
- `GET /api/loans`: Lists active/overdue loans.
- `GET /api/payment-schedule/:loanId`: Repayment schedule installments.

### Payment Endpoints
- `POST /api/payments`: Records a payment and allocates funds. Triggers events and updates outstanding values.
- `GET /api/payments/customer/:customerId`: Payment history logs.

---

## 6. CLF Concepts Covered

Open the **CLF Concepts Lab** page (`http://localhost:5173/clf-lab`) to interactively test academic syllabus points:
- **JS Hoisting**: Interactive simulation comparing `var` vs. `let` TDZ.
- **Callbacks**: Delayed calculation executing callback arguments.
- **Async/Await**: Dynamic fetch querying Express health routes.
- **DOM Manipulation**: Text and border-color manipulation using browser APIs.
- **JSON Serialization**: Serialization (`stringify`) and Reconstruction (`parse`).
- **jQuery Integration**: Fade-in and fade-out animation demo.
- **Node.js Native Server**: Button fetching from native port `5001`.
- **Node.js Buffers / Streams / Events**: Code details highlighting magic byte checking, secure download streaming, and decoupled post-payment event emitting.
