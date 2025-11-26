// models/userModel.js - User Database Operations

const db = require('./db');

const UserModel = {
  // Create a new user
  async create(userData) {
    const { name, email, password, role = 'student', bio = null } = userData;
    const [result] = await db.query(
      'INSERT INTO users (name, email, password, role, bio) VALUES (?, ?, ?, ?, ?)',
      [name, email, password, role, bio]
    );
    return result.insertId;
  },

  // Find user by email
  async findByEmail(email) {
    const [rows] = await db.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return rows[0];
  },

  // Find user by ID
  async findById(id) {
    const [rows] = await db.query(
      'SELECT id, name, email, role, bio, skills, resume_url, profile_picture, created_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0];
  },

  // Get all users (admin only)
  async getAll() {
    const [rows] = await db.query(
      'SELECT id, name, email, role, bio, created_at FROM users ORDER BY created_at DESC'
    );
    return rows;
  },

  // Update user profile
  async update(id, updates) {
    const fields = [];
    const values = [];
    
    // Build dynamic query based on provided fields
    if (updates.name) {
      fields.push('name = ?');
      values.push(updates.name);
    }
    if (updates.bio !== undefined) {
      fields.push('bio = ?');
      values.push(updates.bio);
    }
    if (updates.skills !== undefined) {
      fields.push('skills = ?');
      values.push(updates.skills);
    }
    if (updates.resume_url !== undefined) {
      fields.push('resume_url = ?');
      values.push(updates.resume_url);
    }
    if (updates.profile_picture !== undefined) {
      fields.push('profile_picture = ?');
      values.push(updates.profile_picture);
    }

    if (fields.length === 0) {
      return false;
    }

    values.push(id);
    const [result] = await db.query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return result.affectedRows > 0;
  },

  // Delete user
  async delete(id) {
    const [result] = await db.query('DELETE FROM users WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },

  // Check if email exists
  async emailExists(email) {
    const [rows] = await db.query(
      'SELECT COUNT(*) as count FROM users WHERE email = ?',
      [email]
    );
    return rows[0].count > 0;
  },

  // Set password reset token
  async setResetToken(userId, token, expires) {
    const [result] = await db.query(
      'UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?',
      [token, new Date(expires), userId]
    );
    return result.affectedRows > 0;
  },

  // Find user by reset token
  async findByResetToken(token) {
    const [rows] = await db.query(
      'SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > NOW()',
      [token]
    );
    return rows[0];
  },

  // Update password
  async updatePassword(userId, hashedPassword) {
    const [result] = await db.query(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, userId]
    );
    return result.affectedRows > 0;
  },

  // Clear reset token
  async clearResetToken(userId) {
    const [result] = await db.query(
      'UPDATE users SET reset_token = NULL, reset_token_expires = NULL WHERE id = ?',
      [userId]
    );
    return result.affectedRows > 0;
  }
};

module.exports = UserModel;
