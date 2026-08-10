const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');
const { logAction } = require('../services/auditService');

// 1. Get all collateral records (Admin gets all, Customer gets own)
router.get('/collateral', requireAuth, async (req, res) => {
    try {
        let query = `
            SELECT col.*, c.full_name 
            FROM collaterals col
            JOIN customers c ON col.customer_id = c.id
        `;
        let params = [];

        if (req.user.role === 'CUSTOMER') {
            query += ' WHERE col.customer_id = ?';
            params.push(req.user.customerId);
        }

        query += ' ORDER BY col.created_at DESC';
        const collaterals = await db.allAsync(query, params);
        res.json({ success: true, collaterals });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Failed to retrieve collateral assets.' });
    }
});

// 2. Admin updates collateral verification or release status
router.put('/collateral/:id', requireAdmin, async (req, res) => {
    const { id } = req.params;
    const { verification_status, release_status } = req.body;

    try {
        const col = await db.getAsync('SELECT * FROM collaterals WHERE id = ?', [id]);
        if (!col) {
            return res.status(404).json({ success: false, message: 'Collateral record not found.' });
        }

        let updateFields = [];
        let params = [];

        if (verification_status) {
            updateFields.push('verification_status = ?');
            params.push(verification_status);
        }
        if (release_status) {
            updateFields.push('release_status = ?');
            params.push(release_status);
        }

        if (updateFields.length === 0) {
            return res.status(400).json({ success: false, message: 'No status changes provided.' });
        }

        params.push(id);
        const query = `UPDATE collaterals SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
        
        await db.runAsync(query, params);

        // Audit log
        await logAction(
            req.user.userId,
            `Updated collateral COL-${id} attributes: ${JSON.stringify(req.body)}`,
            'collaterals',
            id
        );

        res.json({ success: true, message: 'Collateral attributes updated successfully.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Failed to update collateral.' });
    }
});

module.exports = router;
