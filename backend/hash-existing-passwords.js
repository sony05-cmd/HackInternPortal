require('dotenv').config();
const bcrypt = require('bcrypt');
const db = require('./models/db');

async function hashExistingPasswords() {
  try {
    console.log('🔄 Hashing existing passwords...\n');
    
    // Get all users with plain text passwords
    const [users] = await db.query('SELECT id, email, password FROM users');
    
    for (const user of users) {
      // Check if password is already hashed (bcrypt hashes start with $2b$)
      if (user.password.startsWith('$2b$')) {
        console.log(`✅ ${user.email} - already hashed`);
        continue;
      }
      
      // Hash the plain text password
      const hashedPassword = await bcrypt.hash(user.password, 10);
      
      // Update in database
      await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, user.id]);
      
      console.log(`✅ ${user.email} - password hashed`);
    }
    
    console.log('\n✨ All passwords have been hashed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

hashExistingPasswords();
