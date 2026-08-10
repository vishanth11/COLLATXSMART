const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const http = require('http');
const config = require('./config');
const db = require('./database/db'); // Triggers connection & table creation

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Ensure uploads folder exists
if (!fs.existsSync(config.UPLOAD_DIR)) {
    fs.mkdirSync(config.UPLOAD_DIR, { recursive: true });
    console.log('Created uploads directory:', config.UPLOAD_DIR);
}

// REST API Base Route
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        status: 'ok',
        service: 'CollatXSmart Express API Server',
        timestamp: new Date()
    });
});

// Load Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api', require('./routes/loanRoutes'));
app.use('/api', require('./routes/paymentRoutes'));
app.use('/api', require('./routes/documentRoutes'));
app.use('/api', require('./routes/reportRoutes'));
app.use('/api', require('./routes/collateralRoutes'));
app.use('/api', require('./routes/customerRoutes'));

// Start Express Server
const expressServer = app.listen(config.PORT, () => {
    console.log(`Express API Server running on port ${config.PORT}`);
});

// CLF REQUIREMENT: Demonstrate Native Node.js HTTP Server
// Create a separate server on LAB_SERVER_PORT demonstrating native http createServer
const nativeServer = http.createServer((req, res) => {
    console.log(`Native HTTP Server received request: ${req.method} ${req.url}`);
    
    // Set headers
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    if (req.url === '/api/health' && req.method === 'GET') {
        res.writeHead(200);
        res.end(JSON.stringify({
            status: 'ok',
            service: 'CollatXSmart Native HTTP Server',
            message: 'This endpoint demonstrates the native Node.js http.createServer module.',
            clfConcept: 'Node.js HTTP Server'
        }));
    } else {
        res.writeHead(404);
        res.end(JSON.stringify({
            error: 'Not Found',
            message: 'Use GET /api/health to test the native HTTP server.'
        }));
    }
});

nativeServer.listen(config.LAB_SERVER_PORT, () => {
    console.log(`Native Node.js HTTP Server running on port ${config.LAB_SERVER_PORT} for CLF demonstration`);
});
