# Hackathon & Internship Portal

A full-stack web application connecting students with hackathons and internship opportunities.

## 🎯 Features

### For Students
- **User Registration & Authentication** - Secure sign-up with password hashing
- **Profile Management** - Edit bio, skills, upload resume
- **Browse Opportunities** - Search and filter hackathons and internships
- **Apply to Opportunities** - One-click application submission
- **Track Applications** - View all your applications and their status

### For Recruiters
- **Post Opportunities** - Create and manage job listings
- **View Applications** - See who applied to your opportunities
- **Manage Listings** - Edit or delete your posted opportunities

### For Admins
- **User Management** - View and manage all users
- **Content Moderation** - Approve or remove opportunities
- **Site Analytics** - Monitor platform activity

## 🔒 Security Features

- ✅ **Password Hashing** - Bcrypt with 10 salt rounds
- ✅ **Rate Limiting** - Prevent brute force attacks
- ✅ **Input Validation** - XSS and SQL injection prevention
- ✅ **Session Security** - HTTP-only cookies with same-site policy
- ✅ **Security Headers** - Helmet.js middleware
- ✅ **CORS Protection** - Configured for specific origins

## 🛠️ Technology Stack

### Frontend
- HTML5, CSS3 (Custom Properties)
- Vanilla JavaScript (ES6+)
- Responsive Design

### Backend
- Node.js & Express 5.1.0
- MySQL 8.0 with connection pooling
- Session-based authentication

### Security & Validation
- bcrypt - Password hashing
- express-validator - Input validation
- express-rate-limit - API rate limiting
- helmet - Security headers

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

### Local Development Setup

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd MP
```

2. **Install backend dependencies**
```bash
cd backend
npm install
```

3. **Setup MySQL database**
```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE hackathon_portal;
USE hackathon_portal;

# Import schema
source ../sql/database.sql;

# Exit MySQL
exit
```

4. **Configure environment variables**
```bash
# Copy example env file
cp .env.example .env

# Edit .env with your credentials
# Required: DB_PASSWORD, SESSION_SECRET
```

5. **Hash existing passwords (if migrating data)**
```bash
node hash-existing-passwords.js
```

6. **Start the server**
```bash
node server.js
# Or use nodemon for development:
# npm install -g nodemon
# nodemon server.js
```

7. **Access the application**
- Open browser: http://localhost:3000
- Frontend: http://localhost:3000/index.html
- API Status: http://localhost:3000/api
- Health Check: http://localhost:3000/api/health

## 🔑 Test Accounts

After setting up the database, you can login with:

**Admin Account:**
- Email: admin@example.com
- Password: 12345678
- Access: Full admin dashboard

**Student Account:**
- Email: student@example.com
- Password: 12345678
- Access: Student dashboard

**Recruiter Account:**
- Email: recruiter@example.com
- Password: 12345678
- Access: Recruiter features

## 📁 Project Structure

```
MP/
├── index.html              # Landing page
├── login.html              # Login page
├── register.html           # Registration page
├── dashboard.html          # Student/Recruiter dashboard
├── admin_dashboard.html    # Admin dashboard
├── opportunities.html      # Browse opportunities
├── help.html              # Help/FAQ page
├── css/
│   └── style.css          # Global styles
├── js/
│   └── script.js          # Frontend logic
├── backend/
│   ├── server.js          # Express server
│   ├── .env.example       # Environment template
│   ├── controllers/       # Business logic
│   │   ├── authController.js
│   │   ├── oppController.js
│   │   └── userController.js
│   ├── models/            # Database models
│   │   ├── db.js
│   │   ├── userModel.js
│   │   ├── opportunityModel.js
│   │   └── applicationModel.js
│   ├── routes/            # API routes
│   │   ├── authRoutes.js
│   │   ├── oppRoutes.js
│   │   └── userRoutes.js
│   ├── middleware/        # Custom middleware
│   │   ├── auth.js
│   │   ├── validation.js
│   │   └── errorHandler.js
│   └── config/            # Configuration files
└── sql/
    └── database.sql       # Database schema
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/session` - Check session status

### Opportunities
- `GET /api/opportunities` - Get all opportunities (public)
- `GET /api/opportunities/recommended` - Get recommended (authenticated)
- `POST /api/opportunities` - Create opportunity (recruiter/admin)
- `DELETE /api/opportunities/:id` - Delete opportunity (recruiter/admin)
- `POST /api/opportunities/:id/apply` - Apply to opportunity (authenticated)

### Users
- `GET /api/user/profile` - Get current user profile
- `GET /api/user/applications` - Get user applications
- `PUT /api/user/:id` - Update user profile
- `GET /api/user/:id` - Get user by ID
- `GET /api/user` - Get all users (admin only)

### Health & Status
- `GET /api` - API status
- `GET /api/health` - Health check (for monitoring)

## 🚀 Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed production deployment guide.

### Quick Production Checklist
- [ ] Set `NODE_ENV=production` in .env
- [ ] Generate strong `SESSION_SECRET`
- [ ] Configure production database
- [ ] Enable HTTPS/SSL
- [ ] Update CORS origin to production domain
- [ ] Set up database backups
- [ ] Configure monitoring/logging
- [ ] Test all user flows

## 🧪 Testing

### Manual Testing
1. **Registration Flow**
   - Try registering with weak password (should fail)
   - Register with valid credentials (should succeed)

2. **Login Flow**
   - Try 6 login attempts (should rate limit)
   - Login with correct credentials

3. **Application Flow**
   - Browse opportunities
   - Apply to an opportunity
   - Check application in dashboard

4. **Admin Features**
   - Login as admin
   - View all users
   - Manage opportunities

### Database Testing
```bash
# Test database connection
node backend/test-db.js

# Check users
node backend/check-users.js
```

## 🐛 Troubleshooting

### Server won't start
```bash
# Check if port 3000 is in use
netstat -ano | findstr :3000

# Kill the process (Windows)
taskkill /PID <PID> /F
```

### Database connection error
```bash
# Verify MySQL is running
mysql -u root -p -e "SELECT 1"

# Check .env database credentials
# Ensure database exists
```

### Session not persisting
- Check browser console for CORS errors
- Verify `credentials: true` in fetch requests
- Check session cookie settings in server.js

## 📝 Environment Variables

Required variables in `.env`:

```env
# Server
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=hackathon_portal

# Session
SESSION_SECRET=generate-a-strong-random-string-here

# Frontend (production)
FRONTEND_URL=https://yourdomain.com
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

sony - Initial work

##  Acknowledgments

- Express.js community
- MySQL documentation
- Security best practices from OWASP

## 📞 Support

For issues or questions:
- Create an issue on GitHub
- Check the [Help page](help.html)
- Review [DEPLOYMENT.md](DEPLOYMENT.md) for production issues

---

Made with ❤️ for connecting talent with opportunities
