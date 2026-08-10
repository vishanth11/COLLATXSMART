const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Resolve database file to the root database/ directory
const dbPath = path.resolve(__dirname, '../../database/collatxsmart.db');
const schemaPath = path.resolve(__dirname, '../../database/schema.sql');

// Helper to hash password using SHA-256 (standard crypto)
function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

// Make sure parent directory of dbPath exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Database connection error:', err.message);
    } else {
        console.log('Connected to the CollatXSmart SQLite database at:', dbPath);
        initDb();
    }
});

// Convert db methods to promises for easier async/await usage
db.runAsync = function (sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve(this); // returns object with .lastID and .changes
        });
    });
};

db.getAsync = function (sql, params = []) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
};

db.allAsync = function (sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

async function initDb() {
    try {
        // Check if users table exists
        const tableCheck = await db.getAsync("SELECT name FROM sqlite_master WHERE type='table' AND name='users'");
        if (!tableCheck) {
            console.log('Database tables not found. Initializing schema...');
            const schemaSql = fs.readFileSync(schemaPath, 'utf8');
            
            const statements = schemaSql
                .split(';')
                .map(s => s.trim())
                .filter(s => s.length > 0);

            for (const statement of statements) {
                await db.runAsync(statement);
            }
            console.log('Schema loaded successfully.');
            await seedData();
        } else {
            console.log('Database already initialized.');
        }
    } catch (err) {
        console.error('Failed to initialize database:', err);
    }
}

async function seedData() {
    try {
        console.log('Seeding initial data...');
        
        const hashedPassword = hashPassword('password123');
        const usersToSeed = [
            { name: 'CollatX Admin', email: 'admin@collatxsmart.com', phone: '9876543210', password: hashedPassword, role: 'ADMIN' },
            { name: 'Arun Kumar', email: 'arun@example.com', phone: '9876543211', password: hashedPassword, role: 'CUSTOMER' },
            { name: 'Priya Sundar', email: 'priya@example.com', phone: '9876543212', password: hashedPassword, role: 'CUSTOMER' },
            { name: 'Ravi Chandran', email: 'ravi@example.com', phone: '9876543213', password: hashedPassword, role: 'CUSTOMER' },
            { name: 'Karthik Raja', email: 'karthik@example.com', phone: '9876543214', password: hashedPassword, role: 'CUSTOMER' },
            { name: 'Divya Nathan', email: 'divya@example.com', phone: '9876543215', password: hashedPassword, role: 'CUSTOMER' }
        ];

        for (const u of usersToSeed) {
            const userResult = await db.runAsync(
                `INSERT INTO users (name, email, phone, password_hash, role, language) VALUES (?, ?, ?, ?, ?, 'en')`,
                [u.name, u.email, u.phone, u.password, u.role]
            );

            if (u.role === 'CUSTOMER') {
                let address = '';
                let occupation = '';
                let income = 0;
                
                if (u.name === 'Arun Kumar') {
                    address = '12, Gandhipuram, Coimbatore - 641012';
                    occupation = 'Software Engineer';
                    income = 85000;
                } else if (u.name === 'Priya Sundar') {
                    address = '45, R.S. Puram, Coimbatore - 641002';
                    occupation = 'Business Owner';
                    income = 120000;
                } else if (u.name === 'Ravi Chandran') {
                    address = '78, Ramanathapuram, Coimbatore - 641045';
                    occupation = 'Govt Employee';
                    income = 55000;
                } else if (u.name === 'Karthik Raja') {
                    address = '101, Peelamedu, Coimbatore - 641004';
                    occupation = 'Self-employed Driver';
                    income = 35000;
                } else if (u.name === 'Divya Nathan') {
                    address = '204, Saibaba Colony, Coimbatore - 641011';
                    occupation = 'School Teacher';
                    income = 42000;
                }

                await db.runAsync(
                    `INSERT INTO customers (user_id, full_name, phone, email, address, occupation, monthly_income) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [userResult.lastID, u.name, u.phone, u.email, address, occupation, income]
                );
            }
        }

        console.log('Seeding completed successfully.');
    } catch (err) {
        console.error('Failed to seed database:', err);
    }
}

module.exports = db;
