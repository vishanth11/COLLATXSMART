const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireAuth } = require('../middleware/authMiddleware');

// Auth routes
router.post('/login', authController.login);
router.get('/me', requireAuth, authController.getProfile);

module.exports = router;
