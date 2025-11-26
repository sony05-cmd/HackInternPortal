// models/applicationModel.js - Application Database Operations

const db = require('./db');

const ApplicationModel = {
  // Create a new application
  async create(userId, opportunityId, coverLetter = null) {
    try {
      const [result] = await db.query(
        'INSERT INTO applications (user_id, opportunity_id, cover_letter) VALUES (?, ?, ?)',
        [userId, opportunityId, coverLetter]
      );
      return result.insertId;
    } catch (error) {
      // Handle duplicate application error
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('You have already applied to this opportunity');
      }
      throw error;
    }
  },

  // Get all applications for a user
  async getByUser(userId) {
    const [rows] = await db.query(
      `SELECT a.*, o.title, o.company, o.type, o.location, o.pay
      FROM applications a
      JOIN opportunities o ON a.opportunity_id = o.id
      WHERE a.user_id = ?
      ORDER BY a.applied_at DESC`,
      [userId]
    );
    return rows;
  },

  // Get all applications for an opportunity
  async getByOpportunity(opportunityId) {
    const [rows] = await db.query(
      `SELECT a.*, u.name, u.email, u.bio, u.skills, u.resume_url
      FROM applications a
      JOIN users u ON a.user_id = u.id
      WHERE a.opportunity_id = ?
      ORDER BY a.applied_at DESC`,
      [opportunityId]
    );
    return rows;
  },

  // Check if user has already applied
  async hasApplied(userId, opportunityId) {
    const [rows] = await db.query(
      'SELECT COUNT(*) as count FROM applications WHERE user_id = ? AND opportunity_id = ?',
      [userId, opportunityId]
    );
    return rows[0].count > 0;
  },

  // Update application status
  async updateStatus(id, status) {
    const [result] = await db.query(
      'UPDATE applications SET status = ? WHERE id = ?',
      [status, id]
    );
    return result.affectedRows > 0;
  },

  // Get application by ID
  async findById(id) {
    const [rows] = await db.query(
      `SELECT a.*, u.name as user_name, u.email as user_email,
      o.title as opportunity_title, o.company
      FROM applications a
      JOIN users u ON a.user_id = u.id
      JOIN opportunities o ON a.opportunity_id = o.id
      WHERE a.id = ?`,
      [id]
    );
    return rows[0];
  },

  // Delete application (withdraw)
  async delete(id, userId) {
    const [result] = await db.query(
      'DELETE FROM applications WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return result.affectedRows > 0;
  },

  // Get all applications (admin view)
  async getAll() {
    const [rows] = await db.query(
      `SELECT a.*, u.name as user_name, u.email as user_email,
      o.title as opportunity_title, o.company
      FROM applications a
      JOIN users u ON a.user_id = u.id
      JOIN opportunities o ON a.opportunity_id = o.id
      ORDER BY a.applied_at DESC`
    );
    return rows;
  }
};

module.exports = ApplicationModel;
