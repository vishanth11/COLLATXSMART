const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Document routes
router.post('/documents', requireAuth, upload.single('document'), documentController.uploadDocument);
router.get('/documents/download/:id', requireAuth, documentController.downloadDocument);
router.put('/documents/:id/verify', requireAdmin, documentController.verifyDocument);
router.get('/documents', requireAdmin, documentController.getAllDocuments);
router.get('/documents/customer/:customerId', requireAuth, documentController.getCustomerDocuments);

module.exports = router;
