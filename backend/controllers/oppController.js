// controllers/oppController.js

const OpportunityModel = require('../models/opportunityModel');
const ApplicationModel = require('../models/applicationModel');
const UserModel = require('../models/userModel');
const { sendApplicationStatusEmail } = require('../services/emailService');

// Get all opportunities with search/filter
exports.getAllOpportunities = async (req, res) => {
  try {
    const { q, loc, type } = req.query;
    
    const filters = {};
    if (q) filters.search = q;
    if (loc) filters.location = loc;
    if (type) filters.type = type;
    
    const opportunities = await OpportunityModel.getAll(filters);
    res.json(opportunities);
  } catch (error) {
    console.error('Get opportunities error:', error);
    res.status(500).json({ message: 'Server error fetching opportunities' });
  }
};

// Get recommended opportunities
exports.getRecommendedOpportunities = async (req, res) => {
  try {
    const userId = req.session.userId;
    const opportunities = await OpportunityModel.getRecommended(userId, 5);
    res.json(opportunities);
  } catch (error) {
    console.error('Get recommended error:', error);
    res.status(500).json({ message: 'Server error fetching recommendations' });
  }
};

// Create new opportunity
exports.createOpportunity = async (req, res) => {
  try {
    const { title, company, type, location, duration, pay, description, requirements } = req.body;

    if (!title || !company || !type || !location) {
      return res.status(400).json({ message: 'Title, company, type, and location are required' });
    }

    const createdBy = req.session.userId || null;

    const opportunityId = await OpportunityModel.create({
      title,
      company,
      type,
      location,
      duration,
      pay,
      description,
      requirements,
      created_by: createdBy
    });

    res.status(201).json({ 
      message: 'Opportunity added successfully', 
      opportunityId 
    });
  } catch (error) {
    console.error('Create opportunity error:', error);
    res.status(500).json({ message: 'Server error creating opportunity' });
  }
};

// Delete opportunity
exports.deleteOpportunity = async (req, res) => {
  try {
    const oppId = parseInt(req.params.id);
    
    const deleted = await OpportunityModel.delete(oppId);
    if (!deleted) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }
    
    res.status(200).json({ message: 'Opportunity deleted successfully' });
  } catch (error) {
    console.error('Delete opportunity error:', error);
    res.status(500).json({ message: 'Server error deleting opportunity' });
  }
};

// Apply to opportunity
exports.applyToOpportunity = async (req, res) => {
  try {
    const oppId = parseInt(req.params.id);
    const userId = req.session.userId;
    const { coverLetter } = req.body;
    
    console.log('Apply request - oppId:', oppId, 'userId:', userId);
    
    if (!userId) {
      return res.status(401).json({ message: 'Please login to apply' });
    }
    
    // Check if opportunity exists
    const opportunity = await OpportunityModel.findById(oppId);
    if (!opportunity) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }
    
    // Check if already applied
    const hasApplied = await ApplicationModel.hasApplied(userId, oppId);
    if (hasApplied) {
      return res.status(400).json({ message: 'You have already applied to this opportunity' });
    }
    
    // Create application
    const applicationId = await ApplicationModel.create(userId, oppId, coverLetter);
    
    res.status(200).json({ 
      message: 'Application submitted successfully', 
      applicationId 
    });
  } catch (error) {
    console.error('Apply to opportunity error:', error);
    if (error.message === 'You have already applied to this opportunity') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error submitting application' });
  }
};

// Get applications for a specific opportunity (recruiter/admin)
exports.getOpportunityApplications = async (req, res) => {
  try {
    const oppId = parseInt(req.params.id);
    const userId = req.session.userId;
    
    // Check if opportunity exists and belongs to user (or user is admin)
    const opportunity = await OpportunityModel.findById(oppId);
    if (!opportunity) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }
    
    // Allow if user created the opportunity or is admin
    if (opportunity.created_by !== userId && req.session.userRole !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized to view these applications' });
    }
    
    const applications = await ApplicationModel.getByOpportunity(oppId);
    res.json(applications);
  } catch (error) {
    console.error('Get opportunity applications error:', error);
    res.status(500).json({ message: 'Server error fetching applications' });
  }
};

// Update application status (recruiter/admin)
exports.updateApplicationStatus = async (req, res) => {
  try {
    const applicationId = parseInt(req.params.appId);
    const { status } = req.body;
    
    // Validate status
    const validStatuses = ['pending', 'accepted', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be: pending, accepted, or rejected' });
    }
    
    // Get application details to verify ownership
    const application = await ApplicationModel.findById(applicationId);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    // Get opportunity to check if user is the creator
    const opportunity = await OpportunityModel.findById(application.opportunity_id);
    const userId = req.session.userId;
    
    // Allow if user created the opportunity or is admin
    if (opportunity.created_by !== userId && req.session.userRole !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized to update this application' });
    }
    
    // Update status
    const updated = await ApplicationModel.updateStatus(applicationId, status);
    if (!updated) {
      return res.status(404).json({ message: 'Failed to update application' });
    }
    
    // Send email notification (don't wait for it, don't fail if it doesn't work)
    if (status === 'accepted' || status === 'rejected') {
      sendApplicationStatusEmail(
        application.user_email,
        application.user_name,
        application.opportunity_title,
        status
      ).catch(err => console.error('Email notification failed:', err));
    }
    
    res.json({ 
      message: `Application ${status} successfully`,
      application: {
        id: applicationId,
        status
      }
    });
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({ message: 'Server error updating application status' });
  }
};
