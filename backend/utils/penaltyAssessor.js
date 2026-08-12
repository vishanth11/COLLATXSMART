const db = require('../database/db');
const fs = require('fs');
const path = require('path');

const policyPath = path.resolve(__dirname, '../config/penaltyPolicy.json');

// Default policy: Flat ₹100 penalty after 5 days grace period
const defaultPolicy = {
    penaltyType: 'Flat', // 'Flat' or 'Percentage'
    penaltyValue: 100.0, // ₹100 or 2%
    gracePeriodDays: 5,
    maxPenaltyLimit: 1000.0
};

// Get policy (or write default if not exists)
function getPolicy() {
    try {
        if (!fs.existsSync(policyPath)) {
            fs.mkdirSync(path.dirname(policyPath), { recursive: true });
            fs.writeFileSync(policyPath, JSON.stringify(defaultPolicy, null, 2), 'utf8');
            return defaultPolicy;
        }
        return JSON.parse(fs.readFileSync(policyPath, 'utf8'));
    } catch (err) {
        console.error('Error reading penalty policy:', err.message);
        return defaultPolicy;
    }
}

/**
 * Assesses penalties on all overdue installments.
 * Called dynamically when loading active loans or dashboard summaries.
 */
async function assessPenalties() {
    const policy = getPolicy();
    const today = new Date();
    console.log(`[PENALTY ENGINE] Assessing schedules using policy: ${policy.penaltyType} value=${policy.penaltyValue} grace=${policy.gracePeriodDays} days...`);

    try {
        // Find all unpaid installments whose due date has passed
        const overdueInstallments = await db.allAsync(
            `SELECT s.*, l.status as loan_status, l.outstanding_amount, l.total_payable
             FROM loan_schedules s
             JOIN loans l ON s.loan_id = l.id
             WHERE s.status != 'Paid' AND date(s.due_date) < date('now')`
        );

        for (const inst of overdueInstallments) {
            const dueDate = new Date(inst.due_date);
            const diffTime = Math.abs(today - dueDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays > policy.gracePeriodDays) {
                // Calculate penalty
                let calculatedPenalty = 0;
                if (policy.penaltyType === 'Flat') {
                    calculatedPenalty = policy.penaltyValue;
                } else {
                    // Percentage of amount due
                    calculatedPenalty = Math.round((inst.amount_due * (policy.penaltyValue / 100)) * 100) / 100;
                }

                // Cap penalty at max limit
                calculatedPenalty = Math.min(calculatedPenalty, policy.maxPenaltyLimit);

                // If penalty changed (unapplied penalty or new penalty amount), update installment
                if (calculatedPenalty > inst.penalty) {
                    const penaltyDiff = calculatedPenalty - inst.penalty;
                    
                    // Update schedule item status to Overdue and add penalty
                    await db.runAsync(
                        `UPDATE loan_schedules 
                         SET penalty = ?, remaining_amount = remaining_amount + ?, status = 'Overdue' 
                         WHERE id = ?`,
                        [calculatedPenalty, penaltyDiff, inst.id]
                    );

                    // Update parent loan outstanding balance and status to Overdue
                    await db.runAsync(
                        `UPDATE loans 
                         SET outstanding_amount = outstanding_amount + ?, status = 'Overdue', updated_at = CURRENT_TIMESTAMP 
                         WHERE id = ?`,
                        [penaltyDiff, inst.loan_id]
                    );

                    console.log(`[PENALTY ASSESSED] Applied ₹${penaltyDiff} penalty to Installment #${inst.installment_number} on Loan ID ${inst.loan_id}`);
                } else if (inst.status !== 'Overdue') {
                    // Update status only
                    await db.runAsync(`UPDATE loan_schedules SET status = 'Overdue' WHERE id = ?`, [inst.id]);
                    await db.runAsync(`UPDATE loans SET status = 'Overdue' WHERE id = ?`, [inst.loan_id]);
                }
            }
        }
    } catch (err) {
        console.error('Error assessing penalties:', err.message);
    }
}

module.exports = {
    assessPenalties,
    getPolicy
};
