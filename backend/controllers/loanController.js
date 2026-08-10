const db = require('../database/db');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const config = require('../config');
const { calculateLoan } = require('../services/calculationEngine');
const { logAction } = require('../services/auditService');
const { assessPenalties } = require('../utils/penaltyAssessor');

// Hash password using SHA-256
function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

// 1. Submit a new loan application (Customer or Guest)
async function createApplication(req, res) {
    const {
        fullName, phone, email, address, occupation, monthlyIncome, password,
        loanType, requestedAmount, purpose, repaymentFrequency, requestedDurationMonths,
        hasCollateral, collateralType, collateralValue, collateralDetails
    } = req.body;

    let customerId = req.user ? req.user.customerId : null;
    let token = null;
    let newUser = null;

    try {
        // If guest (not logged in), create a User and Customer profile automatically
        if (!customerId) {
            if (!email || !phone || !password) {
                return res.status(400).json({ success: false, message: 'Email, phone, and password are required to create an account.' });
            }

            // Check if user already exists
            const existingUser = await db.getAsync('SELECT id FROM users WHERE email = ? OR phone = ?', [email.toLowerCase(), phone]);
            if (existingUser) {
                return res.status(400).json({ success: false, message: 'An account with this email or phone number already exists.' });
            }

            // Hash password
            const passwordHash = hashPassword(password);
            
            // Insert user
            const userResult = await db.runAsync(
                `INSERT INTO users (name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, 'CUSTOMER')`,
                [fullName, email.toLowerCase(), phone, passwordHash]
            );

            // Insert customer
            const custResult = await db.runAsync(
                `INSERT INTO customers (user_id, full_name, phone, email, address, occupation, monthly_income) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [userResult.lastID, fullName, phone, email.toLowerCase(), address, occupation, monthlyIncome]
            );

            customerId = custResult.lastID;
            
            // Create user login token so they don't have to re-authenticate immediately
            token = jwt.sign(
                { userId: userResult.lastID, email, role: 'CUSTOMER', name: fullName, customerId },
                config.JWT_SECRET,
                { expiresIn: '24h' }
            );

            newUser = {
                id: userResult.lastID,
                name: fullName,
                email,
                role: 'CUSTOMER',
                customerId
            };
        }

        // Insert loan application
        const appResult = await db.runAsync(
            `INSERT INTO loan_applications (
                customer_id, loan_type, requested_amount, purpose, repayment_frequency, 
                requested_duration_months, collateral_required, collateral_type, collateral_details, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Submitted')`,
            [
                customerId, loanType, requestedAmount, purpose, repaymentFrequency, 
                requestedDurationMonths, hasCollateral, collateralType, collateralDetails
            ]
        );

        res.status(211).json({
            success: true,
            message: 'Loan application submitted successfully.',
            applicationId: `CX-${new Date().getFullYear()}-${appResult.lastID.toString().padStart(6, '0')}`,
            customerId,
            token,
            user: newUser
        });

    } catch (err) {
        console.error('Submit application error:', err);
        res.status(500).json({ success: false, message: 'Internal server error submitting application.' });
    }
}

// 2. Get all loan applications (Admin gets all, Customer gets own)
async function getApplications(req, res) {
    try {
        let query = `
            SELECT la.*, c.full_name, c.phone, c.email, c.occupation, c.monthly_income 
            FROM loan_applications la
            JOIN customers c ON la.customer_id = c.id
        `;
        let params = [];

        if (req.user.role === 'CUSTOMER') {
            query += ' WHERE la.customer_id = ?';
            params.push(req.user.customerId);
        }

        query += ' ORDER BY la.submitted_at DESC';
        const apps = await db.allAsync(query, params);
        
        res.json({ success: true, applications: apps });
    } catch (err) {
        console.error('Get applications error:', err);
        res.status(500).json({ success: false, message: 'Failed to retrieve loan applications.' });
    }
}

// 3. Get single application details
async function getApplicationById(req, res) {
    try {
        const query = `
            SELECT la.*, c.full_name, c.phone, c.email, c.occupation, c.monthly_income 
            FROM loan_applications la
            JOIN customers c ON la.customer_id = c.id
            WHERE la.id = ?
        `;
        const app = await db.getAsync(query, [req.params.id]);

        if (!app) {
            return res.status(404).json({ success: false, message: 'Application not found.' });
        }

        // Authorization check: Customer can only view their own
        if (req.user.role === 'CUSTOMER' && app.customer_id !== req.user.customerId) {
            return res.status(403).json({ success: false, message: 'Access denied.' });
        }

        res.json({ success: true, application: app });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Failed to fetch application details.' });
    }
}

// 4. Update Application status (Approve/Reject) by Admin
async function updateApplication(req, res) {
    const { id } = req.params;
    const { status, approved_amount, interest_rate, interest_method, duration_months, repayment_frequency, start_date } = req.body;

    try {
        const app = await db.getAsync('SELECT * FROM loan_applications WHERE id = ?', [id]);
        if (!app) {
            return res.status(404).json({ success: false, message: 'Application not found.' });
        }

        if (status === 'Approved') {
            // Calculate Repayment Schedule
            const calc = calculateLoan(approved_amount, interest_rate, interest_method, duration_months, repayment_frequency, start_date);
            const endDate = calc.installments[calc.installments.length - 1].due_date;

            // 1. Create Active Loan
            const loanResult = await db.runAsync(
                `INSERT INTO loans (
                    application_id, customer_id, loan_type, principal_amount, approved_amount, 
                    interest_rate, interest_method, duration_months, repayment_frequency, 
                    start_date, end_date, total_payable, amount_paid, outstanding_amount, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0.0, ?, 'Active')`,
                [
                    id, app.customer_id, app.loan_type, app.requested_amount, approved_amount,
                    interest_rate, interest_method, duration_months, repayment_frequency,
                    start_date, endDate, calc.totalPayable, calc.totalPayable
                ]
            );

            const loanId = loanResult.lastID;

            // 2. Create Schedules
            for (const inst of calc.installments) {
                await db.runAsync(
                    `INSERT INTO loan_schedules (
                        loan_id, installment_number, due_date, amount_due, amount_paid, penalty, remaining_amount, status
                    ) VALUES (?, ?, ?, ?, 0.0, 0.0, ?, 'Upcoming')`,
                    [loanId, inst.installment_number, inst.due_date, inst.amount_due, inst.remaining_amount]
                );
            }

            // 3. Register Pledged Collateral if applicable
            if (app.collateral_required === 1) {
                await db.runAsync(
                    `INSERT INTO collaterals (loan_id, customer_id, type, description, estimated_value, approved_value, verification_status, release_status)
                     VALUES (?, ?, ?, ?, ?, ?, 'Verified', 'Held')`,
                    [
                        loanId, app.customer_id, app.collateral_type, 
                        app.collateral_details, app.requested_amount, approved_amount
                    ]
                );
            }

            // 4. Update Application Status
            await db.runAsync('UPDATE loan_applications SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', ['Approved', id]);
            
            // Log Admin action
            await logAction(req.user.userId, `Approved application CX-${id} and disbursed active loan of ₹${approved_amount}`, 'loans', loanId);

            res.json({ success: true, message: 'Application approved. Loan account and repayment schedule generated successfully.' });
        } else {
            // Rejected status
            await db.runAsync('UPDATE loan_applications SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', ['Rejected', id]);
            await logAction(req.user.userId, `Rejected loan application CX-${id}`, 'loan_applications', id);
            res.json({ success: true, message: 'Application status marked as Rejected.' });
        }
    } catch (err) {
        console.error('Update application error:', err);
        res.status(500).json({ success: false, message: 'Failed to update application status.' });
    }
}

// 5. Get all active loans (Admin: all, Customer: own)
async function getLoans(req, res) {
    try {
        await assessPenalties();
        let query = `
            SELECT l.*, c.full_name, c.phone, c.email 
            FROM loans l
            JOIN customers c ON l.customer_id = c.id
        `;
        let params = [];

        if (req.user.role === 'CUSTOMER') {
            query += ' WHERE l.customer_id = ?';
            params.push(req.user.customerId);
        }

        query += ' ORDER BY l.created_at DESC';
        const loans = await db.allAsync(query, params);
        res.json({ success: true, loans });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Failed to retrieve active loans.' });
    }
}

// 6. Get Active Loan for single customer
async function getActiveLoanByCustomer(req, res) {
    try {
        await assessPenalties();
        // Enforce role authorization
        if (req.user.role === 'CUSTOMER' && parseInt(req.params.customerId) !== req.user.customerId) {
            return res.status(403).json({ success: false, message: 'Access denied.' });
        }

        const loan = await db.getAsync(
            'SELECT * FROM loans WHERE customer_id = ? AND status IN (\'Active\', \'Overdue\') ORDER BY id DESC LIMIT 1',
            [req.params.customerId]
        );
        res.json({ success: true, loan });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Failed to read active loan.' });
    }
}

// 7. Get single loan details by ID
async function getLoanById(req, res) {
    try {
        await assessPenalties();
        const query = `
            SELECT l.*, c.full_name, c.phone, c.email 
            FROM loans l
            JOIN customers c ON l.customer_id = c.id
            WHERE l.id = ?
        `;
        const loan = await db.getAsync(query, [req.params.id]);

        if (!loan) {
            return res.status(404).json({ success: false, message: 'Loan account not found.' });
        }

        if (req.user.role === 'CUSTOMER' && loan.customer_id !== req.user.customerId) {
            return res.status(403).json({ success: false, message: 'Access denied.' });
        }

        res.json({ success: true, loan });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Failed to fetch loan details.' });
    }
}

// 8. Get Repayment Schedule for a loan
async function getPaymentSchedule(req, res) {
    try {
        // Fetch loan owner to verify access
        const loan = await db.getAsync('SELECT customer_id FROM loans WHERE id = ?', [req.params.loanId]);
        if (!loan) {
            return res.status(404).json({ success: false, message: 'Loan schedule not found.' });
        }

        if (req.user.role === 'CUSTOMER' && loan.customer_id !== req.user.customerId) {
            return res.status(403).json({ success: false, message: 'Access denied.' });
        }

        const schedule = await db.allAsync(
            'SELECT * FROM loan_schedules WHERE loan_id = ? ORDER BY installment_number ASC',
            [req.params.loanId]
        );
        res.json({ success: true, schedule });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Failed to read repayment schedules.' });
    }
}

module.exports = {
    createApplication,
    getApplications,
    getApplicationById,
    updateApplication,
    getLoans,
    getLoanById,
    getActiveLoanByCustomer,
    getPaymentSchedule
};
