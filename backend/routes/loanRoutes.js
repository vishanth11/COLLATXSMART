const express = require('express');
const router = express.Router();
const loanController = require('../controllers/loanController');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');

// Loan Application Routes
router.post('/loan-applications', (req, res, next) => {
    // Allows guest or logged in user submission
    if (req.headers['authorization']) {
        requireAuth(req, res, next);
    } else {
        next();
    }
}, loanController.createApplication);

router.get('/loan-applications', requireAuth, loanController.getApplications);
router.get('/loan-applications/:id', requireAuth, loanController.getApplicationById);
router.put('/loan-applications/:id', requireAdmin, loanController.updateApplication);

// Active Loan Routes
router.get('/loans', requireAuth, loanController.getLoans);
router.get('/loans/:id', requireAuth, loanController.getLoanById);

// Repayment Schedule Routes
router.get('/payment-schedule/:loanId', requireAuth, loanController.getPaymentSchedule);

// Custom helper: get active loan details for dashboard
router.get('/loans/customer/:customerId', requireAuth, loanController.getActiveLoanByCustomer);

// Custom helper: get active/unpaid loans list for payments page
const db = require('../database/db');
router.get('/loans/active/customer/:customerId', requireAuth, async (req, res) => {
    try {
        if (req.user.role === 'CUSTOMER' && parseInt(req.params.customerId) !== req.user.customerId) {
            return res.status(403).json({ success: false, message: 'Access denied.' });
        }
        const loans = await db.allAsync(
            'SELECT * FROM loans WHERE customer_id = ? AND status IN (\'Active\', \'Overdue\')',
            [req.params.customerId]
        );
        res.json({ success: true, loans });
    } catch(err) {
        res.status(500).json({ success: false, message: 'Failed to retrieve active customer loans.' });
    }
});

module.exports = router;
