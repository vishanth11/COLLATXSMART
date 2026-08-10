const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../database/db');
const config = require('../config');

// SHA-256 hash helper matching database/db.js
function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

// User Login Controller
async function login(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    try {
        // Query user details
        const user = await db.getAsync('SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()]);
        
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid email or password.' });
        }

        const hashedInput = hashPassword(password);
        if (hashedInput !== user.password_hash) {
            return res.status(401).json({ success: false, message: 'Invalid email or password.' });
        }

        // If customer, retrieve the customer ID
        let customerId = null;
        if (user.role === 'CUSTOMER') {
            const customer = await db.getAsync('SELECT id FROM customers WHERE user_id = ?', [user.id]);
            if (customer) {
                customerId = customer.id;
            }
        }

        // Sign JWT Token
        const token = jwt.sign(
            { 
                userId: user.id, 
                email: user.email, 
                role: user.role, 
                name: user.name,
                customerId: customerId
            },
            config.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Return user context (excluding password hash)
        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                language: user.language,
                customerId: customerId
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ success: false, message: 'Internal server error during login.' });
    }
}

// User profile fetch controller
async function getProfile(req, res) {
    try {
        const user = await db.getAsync('SELECT id, name, email, phone, role, language FROM users WHERE id = ?', [req.user.userId]);
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User profile not found.' });
        }

        let customerId = null;
        if (user.role === 'CUSTOMER') {
            const customer = await db.getAsync('SELECT id FROM customers WHERE user_id = ?', [user.id]);
            if (customer) {
                customerId = customer.id;
            }
        }

        res.json({
            success: true,
            user: {
                ...user,
                customerId
            }
        });
    } catch (err) {
        console.error('Get profile error:', err);
        res.status(500).json({ success: false, message: 'Internal server error reading profile.' });
    }
}

module.exports = {
    login,
    getProfile
};
