// Test script to check database users
require('dotenv').config();
const db = require('./models/db');

async function testUsers() {
  try {
    const [rows] = await db.query('SELECT id, name, email, password, role FROM users');
    console.log('Users in database:');
    console.table(rows);
    
    // Test finding a user
    const [student] = await db.query('SELECT * FROM users WHERE email = ?', ['student@example.com']);
    console.log('\nStudent user details:');
    console.log(student[0]);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testUsers();
