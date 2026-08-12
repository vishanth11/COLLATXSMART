const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');

// Report routes
router.get('/reports/summary', requireAdmin, reportController.getSummary);
router.get('/reports/distribution', requireAdmin, reportController.getDistribution);
router.get('/reports/collection-trend', requireAdmin, reportController.getCollectionTrend);
router.get('/reports/export/:type', requireAdmin, reportController.exportCSVReport);

module.exports = router;
