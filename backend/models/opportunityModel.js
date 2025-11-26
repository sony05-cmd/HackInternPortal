// models/opportunityModel.js - Opportunity Database Operations

const db = require('./db');

const OpportunityModel = {
  // Create a new opportunity
  async create(oppData) {
    const {
      title,
      company,
      type = 'internship',
      description,
      requirements = null,
      location,
      duration = null,
      pay = null,
      deadline = null,
      created_by,
      status = 'active'
    } = oppData;

    const [result] = await db.query(
      `INSERT INTO opportunities 
      (title, company, type, description, requirements, location, duration, pay, deadline, created_by, status) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, company, type, description, requirements, location, duration, pay, deadline, created_by, status]
    );
    return result.insertId;
  },

  // Get all opportunities with optional filters
  async getAll(filters = {}) {
    let query = `
      SELECT o.*, u.name as created_by_name,
      (SELECT COUNT(*) FROM applications WHERE opportunity_id = o.id) as application_count
      FROM opportunities o
      LEFT JOIN users u ON o.created_by = u.id
      WHERE 1=1
    `;
    const params = [];

    // Apply filters
    if (filters.status) {
      query += ' AND o.status = ?';
      params.push(filters.status);
    } else {
      query += ' AND o.status = "active"'; // Default to active only
    }

    if (filters.type) {
      query += ' AND o.type = ?';
      params.push(filters.type);
    }

    if (filters.location) {
      query += ' AND o.location LIKE ?';
      params.push(`%${filters.location}%`);
    }

    if (filters.search) {
      query += ' AND (o.title LIKE ? OR o.company LIKE ? OR o.description LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY o.created_at DESC';

    const [rows] = await db.query(query, params);
    return rows;
  },

  // Get opportunity by ID
  async findById(id) {
    const [rows] = await db.query(
      `SELECT o.*, u.name as created_by_name, u.email as created_by_email
      FROM opportunities o
      LEFT JOIN users u ON o.created_by = u.id
      WHERE o.id = ?`,
      [id]
    );
    return rows[0];
  },

  // Get recommended opportunities (simple algorithm - can be enhanced)
  async getRecommended(userId = null, limit = 5) {
    // For now, return most recent active opportunities
    // In future, can be enhanced based on user skills, past applications, etc.
    const [rows] = await db.query(
      `SELECT o.*, u.name as created_by_name,
      (SELECT COUNT(*) FROM applications WHERE opportunity_id = o.id) as application_count
      FROM opportunities o
      LEFT JOIN users u ON o.created_by = u.id
      WHERE o.status = 'active'
      ORDER BY o.created_at DESC
      LIMIT ?`,
      [limit]
    );
    return rows;
  },

  // Update opportunity
  async update(id, updates) {
    const fields = [];
    const values = [];

    // Build dynamic query
    const allowedFields = ['title', 'company', 'type', 'description', 'requirements', 
                          'location', 'duration', 'pay', 'deadline', 'status'];
    
    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        fields.push(`${field} = ?`);
        values.push(updates[field]);
      }
    });

    if (fields.length === 0) {
      return false;
    }

    values.push(id);
    const [result] = await db.query(
      `UPDATE opportunities SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return result.affectedRows > 0;
  },

  // Delete opportunity
  async delete(id) {
    const [result] = await db.query('DELETE FROM opportunities WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },

  // Get opportunities created by a specific user
  async getByCreator(userId) {
    const [rows] = await db.query(
      `SELECT o.*,
      (SELECT COUNT(*) FROM applications WHERE opportunity_id = o.id) as application_count
      FROM opportunities o
      WHERE o.created_by = ?
      ORDER BY o.created_at DESC`,
      [userId]
    );
    return rows;
  }
};

module.exports = OpportunityModel;
