const jwt = require('jsonwebtoken');
const config = require('../config');

// Authenticate JWT Token from Header
function requireAuth(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({ success: false, message: 'Authorization header is missing.' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ success: false, message: 'Authentication token is missing.' });
    }

    jwt.verify(token, config.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ success: false, message: 'Token is invalid or expired.' });
        }
        
        req.user = decoded;
        next();
    });
}

// Authenticate and restrict to Admin only
function requireAdmin(req, res, next) {
    requireAuth(req, res, () => {
        if (req.user && req.user.role === 'ADMIN') {
            next();
        } else {
            res.status(403).json({ success: false, message: 'Access denied. Administrator privileges required.' });
        }
    });
}

module.exports = {
    requireAuth,
    requireAdmin
};
