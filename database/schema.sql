-- CollatXSmart SQLite Schema

-- Drop tables if they exist
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS documents;
DROP TABLE IF EXISTS collaterals;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS loan_schedules;
DROP TABLE IF EXISTS loans;
DROP TABLE IF EXISTS loan_applications;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS users;

-- Users Table
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('ADMIN', 'CUSTOMER')),
    language TEXT NOT NULL DEFAULT 'en' CHECK(language IN ('en', 'ta')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Customers Table (Links to user accounts)
CREATE TABLE customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    address TEXT,
    occupation TEXT,
    monthly_income REAL NOT NULL DEFAULT 0.0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Loan Applications Table
CREATE TABLE loan_applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    loan_type TEXT NOT NULL CHECK(loan_type IN ('Personal', 'Home', 'Bike', 'Car', 'Emergency', 'Business')),
    requested_amount REAL NOT NULL,
    purpose TEXT,
    repayment_frequency TEXT NOT NULL CHECK(repayment_frequency IN ('Daily', 'Weekly', 'Monthly')),
    requested_duration_months INTEGER NOT NULL,
    collateral_required INTEGER NOT NULL DEFAULT 0 CHECK(collateral_required IN (0, 1)),
    collateral_type TEXT CHECK(collateral_type IN ('Gold', 'Silver', 'Bike Documents', 'Car Documents', 'Home/Property Documents', 'Mobile', 'Laptop', 'Other')),
    collateral_details TEXT, -- JSON string representing collateral attributes
    status TEXT NOT NULL DEFAULT 'Submitted' CHECK(status IN ('Draft', 'Submitted', 'Under Review', 'Documents Required', 'Verification', 'Approved', 'Rejected', 'Disbursed', 'Active', 'Overdue', 'Completed', 'Closed')),
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Active Loans Table
CREATE TABLE loans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    application_id INTEGER REFERENCES loan_applications(id),
    customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    loan_type TEXT NOT NULL,
    principal_amount REAL NOT NULL,
    approved_amount REAL NOT NULL,
    interest_rate REAL NOT NULL, -- e.g., 5% is stored as 5.0
    interest_method TEXT NOT NULL CHECK(interest_method IN ('Flat', 'Reducing')),
    duration_months INTEGER NOT NULL,
    repayment_frequency TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_payable REAL NOT NULL,
    amount_paid REAL NOT NULL DEFAULT 0.0,
    outstanding_amount REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'Active' CHECK(status IN ('Active', 'Overdue', 'Completed', 'Closed')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Loan Payment Schedules Table
CREATE TABLE loan_schedules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    loan_id INTEGER NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
    installment_number INTEGER NOT NULL,
    due_date DATE NOT NULL,
    amount_due REAL NOT NULL,
    amount_paid REAL NOT NULL DEFAULT 0.0,
    penalty REAL NOT NULL DEFAULT 0.0,
    remaining_amount REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'Upcoming' CHECK(status IN ('Paid', 'Due', 'Upcoming', 'Overdue'))
);

-- Payments Table
CREATE TABLE payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    loan_id INTEGER NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
    customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    amount REAL NOT NULL,
    payment_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    payment_method TEXT NOT NULL CHECK(payment_method IN ('Cash', 'UPI', 'Bank Transfer', 'Other')),
    reference_number TEXT NOT NULL,
    notes TEXT,
    recorded_by INTEGER NOT NULL REFERENCES users(id),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Collateral Table
CREATE TABLE collaterals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    loan_id INTEGER REFERENCES loans(id) ON DELETE SET NULL,
    customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    description TEXT,
    estimated_value REAL NOT NULL DEFAULT 0.0,
    approved_value REAL NOT NULL DEFAULT 0.0,
    verification_status TEXT NOT NULL DEFAULT 'Pending' CHECK(verification_status IN ('Pending', 'Under Verification', 'Verified', 'Rejected')),
    release_status TEXT NOT NULL DEFAULT 'Held' CHECK(release_status IN ('Held', 'Released')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Documents Table
CREATE TABLE documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    loan_id INTEGER REFERENCES loans(id) ON DELETE SET NULL,
    document_type TEXT NOT NULL, -- e.g., Identity Proof, Address Proof, Income Proof, Collateral Documents
    file_name TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    verification_status TEXT NOT NULL DEFAULT 'Pending' CHECK(verification_status IN ('Pending', 'Verified', 'Rejected')),
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    verified_at DATETIME
);

-- Audit Logs Table
CREATE TABLE audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    entity TEXT NOT NULL,
    entity_id INTEGER NOT NULL
);
