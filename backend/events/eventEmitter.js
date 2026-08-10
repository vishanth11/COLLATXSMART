const EventEmitter = require('events');
const { logAction } = require('../services/auditService');

class PaymentEmitter extends EventEmitter {}

const paymentEmitter = new PaymentEmitter();

// Decoupled listeners for the paymentReceived event
paymentEmitter.on('paymentReceived', async (data) => {
    const { paymentId, loanId, customerId, amount, recordedBy } = data;
    console.log(`\n--- [EVENT TRIGGERED] paymentReceived ---`);
    console.log(`Payment PAY-${paymentId.toString().padStart(6, '0')} recorded for Loan LN-${loanId.toString().padStart(6, '0')}`);
    console.log(`Amount Credited: ₹${amount}`);
    
    // 1. Audit log
    await logAction(
        recordedBy, 
        `Recorded client payment of ₹${amount.toLocaleString('en-IN')} for active loan ID ${loanId}`, 
        'payments', 
        paymentId
    );

    // 2. Simulate receipts generation
    generateReceipt(paymentId, amount, customerId);
});

function generateReceipt(paymentId, amount, customerId) {
    console.log(`[RECEIPT SERVICE] Generating transaction print-receipt for Client CUST-${customerId}`);
    console.log(`[RECEIPT SERVICE] Receipt Ref: RCPT-${paymentId}-${Date.now().toString().substring(8)}`);
    console.log(`[RECEIPT SERVICE] Verified Status: SUCCESS\n`);
}

module.exports = paymentEmitter;
