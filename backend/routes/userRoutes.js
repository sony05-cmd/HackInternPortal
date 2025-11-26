const express = require('express');
const { 
  getCurrentUserProfile,
  getUserProfileById,
  getAllUsers,
  updateUserProfile,
  getUserApplications,
  uploadResume
} = require('../controllers/userController');
const { isAuthenticated, isAdmin } = require('../middleware/auth');
const { validateProfileUpdate } = require('../middleware/validation');
const { uploadResume: multerUpload } = require('../middleware/upload');
const router = express.Router();

// All user routes require authentication
router.use(isAuthenticated);

// Route to get all users (admin only)
router.get('/', isAdmin, getAllUsers);

// Route to get current user profile (from session)
router.get('/profile', getCurrentUserProfile);

// Route to get user applications
router.get('/applications', getUserApplications);

// Route to upload resume
router.post('/upload-resume', multerUpload, uploadResume);

// Route to get user profile by ID
router.get('/:id', getUserProfileById);

// Route to update user profile (with validation)
router.put('/:id', validateProfileUpdate, updateUserProfile);

module.exports = router;
