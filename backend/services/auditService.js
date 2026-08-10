const db = require('../database/db');

/**
 * Logs an administrative or system action into the audit database
 * 
 * @param {number} userId - The user ID who performed the action
 * @param {string} action - Description of action (e.g., 'Approved Loan')
 * @param {string} entity - Target table / concept (e.g., 'loans')
 * @param {number} entityId - Reference row ID
 */
async function logAction(userId, action, entity, entityId) {
    try {
        await db.runAsync(
            `INSERT INTO audit_logs (user_id, action, entity, entity_id) VALUES (?, ?, ?, ?)`,
            [userId, action, entity, entityId]
        );
        console.log(`[AUDIT LOG] User ${userId} performed action: "${action}" on ${entity}:${entityId}`);
    } catch (err) {
        console.error('Failed to write audit log:', err.message);
    }
}

module.exports = {
    logAction
};
