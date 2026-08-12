const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

module.exports = {
    PORT: process.env.PORT || 5000,
    JWT_SECRET: process.env.JWT_SECRET || 'fallback_secret_for_local_dev',
    DATABASE_PATH: path.resolve(__dirname, '../../database/collatxsmart.db'),
    UPLOAD_DIR: path.resolve(__dirname, '../uploads'),
    LAB_SERVER_PORT: process.env.LAB_SERVER_PORT || 5001
};
