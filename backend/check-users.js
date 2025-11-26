require('dotenv').config();
const db = require('./models/db');

async function checkUsers() {
  try {
    const [rows] = await db.query('SELECT id, name, email, role FROM users');
    console.log('\n=== USERS IN DATABASE ===\n');
    console.table(rows);
    console.log('\nTotal users:', rows.length);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkUsers();
