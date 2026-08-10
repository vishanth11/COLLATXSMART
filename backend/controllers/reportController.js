const db = require('../database/db');
const { assessPenalties } = require('../utils/penaltyAssessor');

// 1. Get Aggregated Summary for Admin Dashboard
async function getSummary(req, res) {
    try {
        // Run penalty calculation engine first to ensure stats are accurate
        await assessPenalties();

        const totalCust = await db.getAsync('SELECT COUNT(*) as count FROM customers');
        const pendingReq = await db.getAsync('SELECT COUNT(*) as count FROM loan_applications WHERE status = "Submitted"');
        const activeLn = await db.getAsync('SELECT COUNT(*) as count FROM loans WHERE status = "Active"');
        const overdueLn = await db.getAsync('SELECT COUNT(*) as count FROM loans WHERE status = "Overdue"');

        const disbursed = await db.getAsync('SELECT SUM(approved_amount) as total FROM loans');
        const collected = await db.getAsync('SELECT SUM(amount_paid) as total FROM loans');
        const outstanding = await db.getAsync('SELECT SUM(outstanding_amount) as total FROM loans');
        
        // Today's Collection
        const todaysCol = await db.getAsync(`SELECT SUM(amount) as total FROM payments WHERE date(payment_date) = date('now')`);

        res.json({
            success: true,
            summary: {
                totalCustomers: totalCust?.count || 0,
                pendingRequests: pendingReq?.count || 0,
                activeLoans: activeLn?.count || 0,
                overdueLoans: overdueLn?.count || 0,
                totalDisbursed: disbursed?.total || 0,
                totalCollected: collected?.total || 0,
                totalOutstanding: outstanding?.total || 0,
                todaysCollection: todaysCol?.total || 0
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Failed to compile dashboard summary.' });
    }
}

// 2. Get Loan Distribution Data
async function getDistribution(req, res) {
    try {
        const distribution = await db.allAsync(
            `SELECT loan_type, COUNT(*) as count FROM loans GROUP BY loan_type`
        );
        res.json({ success: true, distribution });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Failed to load distribution statistics.' });
    }
}

// 3. Get Monthly Collection Trend
async function getCollectionTrend(req, res) {
    try {
        const trend = await db.allAsync(
            `SELECT strftime('%Y-%m', payment_date) as month, SUM(amount) as amount 
             FROM payments 
             GROUP BY month 
             ORDER BY month ASC`
        );
        res.json({ success: true, trend });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Failed to read collection trends.' });
    }
}

// 4. Export database reports as CSV using Node.js stream chunks directly to client
async function exportCSVReport(req, res) {
    const { type } = req.params;
    const { from, to } = req.query;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="collatx_${type}_report.csv"`);

    try {
        let sql = '';
        let params = [];
        let headers = [];

        let dateColumn = 'created_at';

        if (type === 'loans') {
            headers = ['Loan ID', 'Client Name', 'Loan Type', 'Approved Amount', 'Interest Rate', 'Method', 'Duration Months', 'Repayment Freq', 'Start Date', 'End Date', 'Outstanding Balance', 'Status'];
            sql = `
                SELECT l.id, c.full_name, l.loan_type, l.approved_amount, l.interest_rate, l.interest_method, l.duration_months, l.repayment_frequency, l.start_date, l.end_date, l.outstanding_amount, l.status, l.created_at
                FROM loans l
                JOIN customers c ON l.customer_id = c.id
            `;
            dateColumn = 'l.created_at';
        } else if (type === 'payments') {
            headers = ['Payment ID', 'Loan ID', 'Client Name', 'Payment Amount', 'Payment Date', 'Payment Method', 'Reference Code', 'Notes'];
            sql = `
                SELECT p.id, p.loan_id, c.full_name, p.amount, p.payment_date, p.payment_method, p.reference_number, p.notes
                FROM payments p
                JOIN customers c ON p.customer_id = c.id
            `;
            dateColumn = 'p.payment_date';
        } else if (type === 'outstanding') {
            headers = ['Loan ID', 'Client Name', 'Loan Type', 'Approved Principal', 'Amount Paid', 'Outstanding Debt', 'Status'];
            sql = `
                SELECT l.id, c.full_name, l.loan_type, l.approved_amount, l.amount_paid, l.outstanding_amount, l.status, l.created_at
                FROM loans l
                JOIN customers c ON l.customer_id = c.id
                WHERE l.outstanding_amount > 0
            `;
            dateColumn = 'l.created_at';
        } else if (type === 'overdue') {
            headers = ['Installment ID', 'Loan ID', 'Client Name', 'Repayment Freq', 'Installment No', 'Due Date', 'Amount Due', 'Amount Paid', 'Penalty', 'Remaining Due'];
            sql = `
                SELECT s.id, s.loan_id, c.full_name, l.repayment_frequency, s.installment_number, s.due_date, s.amount_due, s.amount_paid, s.penalty, (s.amount_due + s.penalty - s.amount_paid) as remaining
                FROM loan_schedules s
                JOIN loans l ON s.loan_id = l.id
                JOIN customers c ON l.customer_id = c.id
                WHERE s.status = 'Overdue'
            `;
            dateColumn = 's.due_date';
        } else if (type === 'collateral') {
            headers = ['Collateral ID', 'Loan ID', 'Client Name', 'Asset Type', 'Description', 'Est Value', 'Approved Val', 'Holding Status', 'Release Status'];
            sql = `
                SELECT col.id, col.loan_id, c.full_name, col.type, col.description, col.estimated_value, col.approved_value, col.verification_status, col.release_status, col.created_at
                FROM collaterals col
                JOIN customers c ON col.customer_id = c.id
            `;
            dateColumn = 'col.created_at';
        } else {
            return res.status(400).end('Invalid report type specified.');
        }

        // Apply Date Filters if present
        let filterClauses = [];
        if (from) {
            filterClauses.push(`date(${dateColumn}) >= date(?)`);
            params.push(from);
        }
        if (to) {
            filterClauses.push(`date(${dateColumn}) <= date(?)`);
            params.push(to);
        }

        if (filterClauses.length > 0) {
            if (sql.includes('WHERE')) {
                sql += ' AND ' + filterClauses.join(' AND ');
            } else {
                sql += ' WHERE ' + filterClauses.join(' AND ');
            }
        }

        // Run query and fetch dataset
        const dataset = await db.allAsync(sql, params);

        // CLF DEMO: Write headers and records sequentially to the Writable Response Stream
        res.write(headers.join(',') + '\n');
        
        for (const row of dataset) {
            const values = Object.values(row).map(val => {
                if (val === null || val === undefined) return '';
                // Escape quotes and commas
                const str = String(val).replace(/"/g, '""');
                return str.includes(',') ? `"${str}"` : str;
            });
            res.write(values.join(',') + '\n');
        }

        // End Response Writable Stream
        res.end();

    } catch (err) {
        console.error('Export report error:', err);
        res.status(500).end('Database streaming export failed.');
    }
}

module.exports = {
    getSummary,
    getDistribution,
    getCollectionTrend,
    exportCSVReport
};
