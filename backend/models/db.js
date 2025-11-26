// models/db.js - MySQL Database Connection

const mysql = require('mysql2');

// Create connection pool (better for handling multiple requests)
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hackathon_portal',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Get promise-based pool for async/await
const promisePool = pool.promise();

// Test database connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
    console.error('💡 Make sure MySQL is running and credentials are correct in .env file');
  } else {
    console.log('✅ Database connected successfully!');
    connection.release();
  }
});

module.exports = promisePool;
