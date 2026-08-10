const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');

// 1. Get all customers (Admin only)
router.get('/customers', requireAdmin, async (req, res) => {
    try {
        const customers = await db.allAsync('SELECT * FROM customers ORDER BY created_at DESC');
        res.json({ success: true, customers });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to retrieve customers.' });
    }
});

// 2. Get customer by profile ID
router.get('/customers/:id', requireAuth, async (req, res) => {
    try {
        const customer = await db.getAsync('SELECT * FROM customers WHERE id = ?', [req.params.id]);
        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer profile not found.' });
        }
        
        // Authorization check: Customer can only view their own
        if (req.user.role === 'CUSTOMER' && customer.id !== req.user.customerId) {
            return res.status(403).json({ success: false, message: 'Access denied.' });
        }

        res.json({ success: true, customer });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to retrieve customer details.' });
    }
});

// 3. Get customer by User ID (useful for profile loading)
router.get('/customers/user/:userId', requireAuth, async (req, res) => {
    try {
        const customer = await db.getAsync('SELECT * FROM customers WHERE user_id = ?', [req.params.userId]);
        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer profile not found.' });
        }

        if (req.user.role === 'CUSTOMER' && customer.id !== req.user.customerId) {
            return res.status(403).json({ success: false, message: 'Access denied.' });
        }

        res.json({ success: true, customer });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch customer profile.' });
    }
});

module.exports = router;
