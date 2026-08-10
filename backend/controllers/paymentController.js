const db = require('../database/db');
const paymentEmitter = require('../events/eventEmitter');

// 1. Record a new payment (Admin only)
async function recordPayment(req, res) {
    const { loan_id, customer_id, amount, payment_date, payment_method, reference_number, notes } = req.body;
    const recordedBy = req.user.userId;

    if (!loan_id || !customer_id || !amount || !referenceNumberCheck(reference_number)) {
        return res.status(400).json({ success: false, message: 'Missing required payment transaction parameters.' });
    }

    const payVal = parseFloat(amount);
    if (payVal <= 0) {
        return res.status(400).json({ success: false, message: 'Payment amount must be greater than zero.' });
    }

    try {
        // Fetch corresponding active loan
        const loan = await db.getAsync('SELECT * FROM loans WHERE id = ?', [loan_id]);
        if (!loan) {
            return res.status(404).json({ success: false, message: 'Loan account not found.' });
        }

        // Check if loan is already fully paid
        if (loan.outstanding_amount <= 0) {
            return res.status(400).json({ success: false, message: 'This loan account is already fully completed.' });
        }

        // 1. Insert payment record
        const payResult = await db.runAsync(
            `INSERT INTO payments (loan_id, customer_id, amount, payment_date, payment_method, reference_number, notes, recorded_by)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [loan_id, customer_id, payVal, payment_date, payment_method, reference_number, notes, recordedBy]
        );

        const paymentId = payResult.lastID;

        // 2. Update Loan ledger totals
        const newAmountPaid = Math.round((loan.amount_paid + payVal) * 100) / 100;
        const newOutstanding = Math.max(0, Math.round((loan.total_payable - newAmountPaid) * 100) / 100);
        const newStatus = newOutstanding <= 0 ? 'Completed' : loan.status;

        await db.runAsync(
            `UPDATE loans SET amount_paid = ?, outstanding_amount = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
            [newAmountPaid, newOutstanding, newStatus, loan_id]
        );

        // 3. Allocate Payment to schedules sequentially
        const schedules = await db.allAsync(
            `SELECT * FROM loan_schedules WHERE loan_id = ? ORDER BY installment_number ASC`,
            [loan_id]
        );

        let paymentPool = payVal;

        for (const inst of schedules) {
            if (paymentPool <= 0) break;

            const instTotalDue = Math.round((inst.amount_due + inst.penalty) * 100) / 100;
            const remainingToPayOnInst = Math.max(0, Math.round((instTotalDue - inst.amount_paid) * 100) / 100);

            if (remainingToPayOnInst > 0) {
                const allocation = Math.min(paymentPool, remainingToPayOnInst);
                const newInstPaid = Math.round((inst.amount_paid + allocation) * 100) / 100;
                
                paymentPool -= allocation;

                // Determine new installment status
                let instStatus = 'Upcoming';
                if (newInstPaid >= instTotalDue) {
                    instStatus = 'Paid';
                } else {
                    instStatus = 'Due';
                }

                await db.runAsync(
                    `UPDATE loan_schedules SET amount_paid = ?, remaining_amount = ?, status = ? WHERE id = ?`,
                    [newInstPaid, Math.max(0, Math.round((instTotalDue - newInstPaid) * 100) / 100), instStatus, inst.id]
                );
            }
        }

        // 4. Trigger decoupled paymentReceived event listeners
        paymentEmitter.emit('paymentReceived', {
            paymentId,
            loanId: loan_id,
            customerId: customer_id,
            amount: payVal,
            recordedBy
        });

        res.json({
            success: true,
            message: 'Payment recorded successfully.',
            paymentId,
            outstandingAmount: newOutstanding,
            loanStatus: newStatus
        });

    } catch (err) {
        console.error('Record payment error:', err);
        res.status(500).json({ success: false, message: 'Internal database error recording payment.' });
    }
}

function referenceNumberCheck(ref) {
    return ref && ref.trim().length > 0;
}

// 2. Get Payments history for a specific customer
async function getCustomerPayments(req, res) {
    const { customerId } = req.params;

    try {
        if (req.user.role === 'CUSTOMER' && parseInt(customerId) !== req.user.customerId) {
            return res.status(403).json({ success: false, message: 'Access denied.' });
        }

        const payments = await db.allAsync(
            `SELECT p.*, l.loan_type 
             FROM payments p
             JOIN loans l ON p.loan_id = l.id
             WHERE p.customer_id = ? 
             ORDER BY p.payment_date DESC`,
            [customerId]
        );
        res.json({ success: true, payments });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Failed to retrieve payments history.' });
    }
}

module.exports = {
    recordPayment,
    getCustomerPayments
};
