// CollatXSmart Loan Calculation Engine

/**
 * Calculates payment schedule and totals for a loan.
 * 
 * @param {number} principal - Approved loan amount
 * @param {number} rate - Annual interest rate (e.g. 5% = 5.0)
 * @param {string} method - 'Flat' or 'Reducing'
 * @param {number} durationMonths - Loan term in months
 * @param {string} frequency - 'Daily', 'Weekly', or 'Monthly'
 * @param {string} startDateStr - Start date in YYYY-MM-DD
 * @returns {object} { totalPayable, totalInterest, installments }
 */
function calculateLoan(principal, rate, method, durationMonths, frequency, startDateStr) {
    const P = parseFloat(principal);
    const r = parseFloat(rate) / 100; // annual decimal rate
    const n = parseInt(durationMonths);
    const startDate = new Date(startDateStr);

    let N = 0; // Total number of payments
    let annualPayments = 12; // Frequency divisor per year

    if (frequency === 'Monthly') {
        N = n;
        annualPayments = 12;
    } else if (frequency === 'Weekly') {
        N = Math.round(n * 4.33); // 52 / 12 = 4.33 approx
        annualPayments = 52;
    } else if (frequency === 'Daily') {
        N = n * 30; // 360 / 12 = 30 approx
        annualPayments = 365;
    }

    const installments = [];
    let totalPayable = 0;
    let totalInterest = 0;

    // Helper to calculate installment due date
    const getDueDate = (installmentIndex) => {
        const d = new Date(startDate);
        if (frequency === 'Monthly') {
            d.setMonth(d.getMonth() + installmentIndex);
        } else if (frequency === 'Weekly') {
            d.setDate(d.getDate() + (installmentIndex * 7));
        } else if (frequency === 'Daily') {
            d.setDate(d.getDate() + installmentIndex);
        }
        return d.toISOString().substring(0, 10);
    };

    if (method === 'Flat') {
        // Flat interest formula
        const interestPerYear = P * r;
        const totalInterestCharged = interestPerYear * (n / 12);
        totalInterest = Math.round(totalInterestCharged * 100) / 100;
        totalPayable = Math.round((P + totalInterest) * 100) / 100;
        
        const installmentAmount = Math.round((totalPayable / N) * 100) / 100;
        const principalPerInstallment = Math.round((P / N) * 100) / 100;
        const interestPerInstallment = Math.round((totalInterest / N) * 100) / 100;

        let outstanding = totalPayable;

        for (let k = 1; k <= N; k++) {
            outstanding -= installmentAmount;
            if (k === N) {
                // Adjust rounding errors on the final payment
                outstanding = 0;
            }
            installments.push({
                installment_number: k,
                due_date: getDueDate(k),
                amount_due: installmentAmount,
                amount_paid: 0.0,
                penalty: 0.0,
                remaining_amount: Math.max(0, Math.round(outstanding * 100) / 100),
                status: 'Upcoming'
            });
        }
    } else {
        // Reducing Balance compounding formula
        const i = r / annualPayments; // periodic interest rate
        
        // Calculate payment amount A
        let A = 0;
        if (i === 0) {
            A = P / N;
        } else {
            A = P * (i * Math.pow(1 + i, N)) / (Math.pow(1 + i, N) - 1);
        }
        A = Math.round(A * 100) / 100;

        let outstanding = P;
        let cumulativePayable = 0;

        for (let k = 1; k <= N; k++) {
            const interestPortion = Math.round((outstanding * i) * 100) / 100;
            const principalPortion = Math.round((A - interestPortion) * 100) / 100;
            
            outstanding -= principalPortion;
            cumulativePayable += A;
            
            let remaining = Math.round(outstanding * 100) / 100;
            
            if (k === N) {
                // Adjust final installment
                remaining = 0;
            }

            installments.push({
                installment_number: k,
                due_date: getDueDate(k),
                amount_due: A,
                amount_paid: 0.0,
                penalty: 0.0,
                remaining_amount: Math.max(0, remaining),
                status: 'Upcoming'
            });
        }

        totalPayable = Math.round(cumulativePayable * 100) / 100;
        totalInterest = Math.round((totalPayable - P) * 100) / 100;
        
        // Populate correct remaining installment outstanding totals
        // For reducing balance, remaining installment ledger represents remaining outstanding total debt
        let currentOutstandingDebt = totalPayable;
        for (let k = 1; k <= N; k++) {
            currentOutstandingDebt -= installments[k - 1].amount_due;
            installments[k - 1].remaining_amount = Math.max(0, Math.round(currentOutstandingDebt * 100) / 100);
        }
    }

    return {
        totalPayable,
        totalInterest,
        installments
    };
}

module.exports = {
    calculateLoan
};
