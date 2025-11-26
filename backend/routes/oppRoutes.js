const express = require('express');
const { 
  getAllOpportunities, 
  getRecommendedOpportunities,
  createOpportunity,
  deleteOpportunity,
  applyToOpportunity,
  getOpportunityApplications,
  updateApplicationStatus
} = require('../controllers/oppController');
const { isAuthenticated, isRecruiterOrAdmin } = require('../middleware/auth');
const { validateOpportunity } = require('../middleware/validation');
const router = express.Router();

// Route to get all opportunities (with search/filter) - public
router.get('/', getAllOpportunities);

// Protected routes - require authentication
router.use(isAuthenticated);

// Route to get recommended opportunities
router.get('/recommended', getRecommendedOpportunities);

// Route to create a new opportunity (recruiters and admins only, with validation)
router.post('/', isRecruiterOrAdmin, validateOpportunity, createOpportunity);

// Route to get applications for a specific opportunity (recruiters and admins only)
router.get('/:id/applications', isRecruiterOrAdmin, getOpportunityApplications);

// Route to update application status (recruiters and admins only)
router.put('/applications/:appId/status', isRecruiterOrAdmin, updateApplicationStatus);

// Route to delete an opportunity (recruiters and admins only)
router.delete('/:id', isRecruiterOrAdmin, deleteOpportunity);

// Route to apply to an opportunity
router.post('/:id/apply', applyToOpportunity);

module.exports = router;
