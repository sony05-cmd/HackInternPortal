// controllers/userController.js

const UserModel = require('../models/userModel');
const ApplicationModel = require('../models/applicationModel');

// Get current user profile (from session)
exports.getCurrentUserProfile = async (req, res) => {
  try {
    const userId = req.session.userId;
    
    console.log('Get profile - userId:', userId, 'sessionID:', req.sessionID);
    
    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const user = await UserModel.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log('Returning user profile:', user.name, user.email);
    res.json(user);
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
};

// Get user profile by ID
exports.getUserProfileById = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ message: 'Server error fetching user' });
  }
};

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await UserModel.getAll();
    res.json(users);
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Server error fetching users' });
  }
};

// Update user profile
exports.updateUserProfile = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { name, bio, skills, resume_url, profile_picture } = req.body;
    
    // Check if user is updating their own profile or is admin
    if (req.session.userId !== userId && req.session.userRole !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized to update this profile' });
    }

    const updates = {};
    if (name) updates.name = name;
    if (bio !== undefined) updates.bio = bio;
    if (skills !== undefined) updates.skills = skills;
    if (resume_url !== undefined) updates.resume_url = resume_url;
    if (profile_picture !== undefined) updates.profile_picture = profile_picture;

    const updated = await UserModel.update(userId, updates);
    
    if (!updated) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = await UserModel.findById(userId);
    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
};

// Get user's applications
exports.getUserApplications = async (req, res) => {
  try {
    const userId = req.session.userId;
    
    console.log('Get applications - userId:', userId);
    
    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const applications = await ApplicationModel.getByUser(userId);
    console.log('Applications found:', applications.length);
    res.json(applications);
  } catch (error) {
    console.error('Get user applications error:', error);
    res.status(500).json({ message: 'Server error fetching applications' });
  }
};

// Upload resume
exports.uploadResume = async (req, res) => {
  try {
    const userId = req.session.userId;
    
    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // Generate URL for the uploaded file
    const resumeUrl = `/uploads/resumes/${req.file.filename}`;
    
    // Update user's resume_url in database
    await UserModel.update(userId, { resume_url: resumeUrl });
    
    res.json({
      message: 'Resume uploaded successfully',
      resumeUrl: resumeUrl,
      filename: req.file.filename
    });
  } catch (error) {
    console.error('Upload resume error:', error);
    res.status(500).json({ message: 'Server error uploading resume' });
  }
};
