const express = require('express');
const { 
  registerUser, 
  loginUser, 
  logoutUser, 
  forgotPassword, 
  resetPassword 
} = require('../controllers/authController');
const { validateRegistration, validateLogin } = require('../middleware/validation');
const router = express.Router();

// Register user
router.post('/register', validateRegistration, registerUser);

// Login user
router.post('/login', validateLogin, loginUser);

// Logout user
router.post('/logout', logoutUser);

// Forgot password
router.post('/forgot-password', forgotPassword);

// Reset password
router.post('/reset-password', resetPassword);

module.exports = router;
