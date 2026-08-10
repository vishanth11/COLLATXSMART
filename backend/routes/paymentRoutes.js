const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');

// Payment routes
router.post('/payments', requireAdmin, paymentController.recordPayment);
router.get('/payments/customer/:customerId', requireAuth, paymentController.getCustomerPayments);

module.exports = router;
