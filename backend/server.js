// Import required modules
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const session = require('express-session');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { initializeEmail } = require('./services/emailService');

// Load environment variables
dotenv.config();

// Initialize email service
initializeEmail().catch(err => console.error('Email initialization failed:', err));

// Initialize express app
const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false // Disable for now, enable in production with proper config
}));

// Rate limiting - prevent brute force attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per windowMs
  message: 'Too many login attempts, please try again later.'
});

app.use('/api/', limiter);
app.use('/api/auth/login', authLimiter);

// Middleware
app.use(express.json({ limit: '10mb' })); // Limit payload size
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : 'http://localhost:3000',
  credentials: true // Allow cookies
}));
app.use(express.urlencoded({extended:true}));

// Session middleware - MUST be before routes
app.use(session({
  secret: process.env.SESSION_SECRET || 'hackathon-portal-secret-key-2025',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    httpOnly: false, // Change to false to allow JavaScript access for debugging
    sameSite: 'lax', // Add sameSite policy
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Debug middleware - log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Session ID: ${req.sessionID}, User ID: ${req.session.userId}`);
  next();
});

// API status route (for testing) - MUST be before other routes
app.get('/api', (req, res) => {
  res.json({ status: 'OK', message: '✅ Hackathon & Internship Portal Backend is running!' });
});

// Health check endpoint for monitoring
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

//Import routes
const authRoutes = require('./routes/authRoutes');
const oppRoutes = require('./routes/oppRoutes');
const userRoutes = require('./routes/userRoutes');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

//Use API routes
app.use('/api/auth', authRoutes);
app.use('/api/opportunities', oppRoutes);
app.use('/api/user', userRoutes); // Changed from /api/users to /api/user

// Serve static files (HTML, CSS, JS) from parent directory
const path = require('path');
const publicPath = path.resolve(__dirname, '..');
console.log('📂 Serving static files from:', publicPath);

// Test if path exists
const fs = require('fs');
if (fs.existsSync(publicPath)) {
  console.log('✅ Static directory exists');
  console.log('📄 Files:', fs.readdirSync(publicPath).filter(f => f.endsWith('.html')));
} else {
  console.log('❌ Static directory does NOT exist');
}

// Serve static files
app.use(express.static(publicPath));

// Serve uploaded files
const uploadsPath = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsPath));

// Error handling middleware - MUST be after all routes
app.use(notFoundHandler);
app.use(errorHandler);

// Server port
const PORT = process.env.PORT || 3000;

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📂 Serving files from: ${path.join(__dirname, '..')}`);
  console.log(`🔗 Open: http://localhost:${PORT}/index.html`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔒 Security features: Helmet, Rate Limiting, Password Hashing`);
});

// Graceful shutdown handling
const gracefulShutdown = (signal) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);
  
  server.close(() => {
    console.log('✅ HTTP server closed');
    
    // Close database connections
    const pool = require('./models/db');
    pool.end((err) => {
      if (err) {
        console.error('❌ Error closing database pool:', err);
        process.exit(1);
      }
      console.log('✅ Database connections closed');
      console.log('👋 Server shut down gracefully');
      process.exit(0);
    });
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error('⚠️ Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
