# Hackathon & Internship Portal - Deployment Guide

## 🚀 Production Deployment Checklist

### 1. Security Configuration

#### ✅ Password Security
- [x] Bcrypt password hashing implemented
- [x] Existing passwords migrated to hashed format
- [x] Password strength validation (min 8 chars, uppercase, lowercase, number)

#### ✅ Input Validation
- [x] Express-validator middleware added
- [x] Email format validation
- [x] XSS protection via input sanitization
- [x] SQL injection prevention (using parameterized queries)

#### ✅ Rate Limiting
- [x] General API rate limit: 100 requests per 15 minutes
- [x] Auth endpoints rate limit: 5 login attempts per 15 minutes

#### ✅ Security Headers
- [x] Helmet.js for security headers
- [x] CORS configured for specific origins
- [x] Session security (httpOnly, sameSite)

### 2. Environment Variables

Create a `.env` file based on `.env.example`:

```bash
cd backend
cp .env.example .env
# Edit .env with your production values
```

**Critical Variables:**
- `SESSION_SECRET`: Generate a strong random string (min 32 characters)
- `DB_PASSWORD`: Your MySQL database password
- `FRONTEND_URL`: Your production domain
- `NODE_ENV=production`

### 3. Database Setup

#### Development Database
```bash
# Import the schema
mysql -u root -p hackathon_portal < sql/database.sql

# Hash existing passwords
cd backend
node hash-existing-passwords.js
```

#### Production Database
```bash
# 1. Create production database
mysql -u root -p -e "CREATE DATABASE hackathon_portal_prod;"

# 2. Import schema
mysql -u root -p hackathon_portal_prod < sql/database.sql

# 3. Update .env with production DB credentials
DB_NAME=hackathon_portal_prod
DB_HOST=your_production_host
DB_USER=your_production_user
DB_PASSWORD=your_production_password
```

### 4. Install Dependencies

```bash
cd backend
npm install
```

### 5. Server Configuration for Production

Update `server.js` for production:

```javascript
// Set secure cookie in production
cookie: {
  secure: true,  // Requires HTTPS
  httpOnly: true,
  sameSite: 'strict',
  maxAge: 24 * 60 * 60 * 1000
}
```

### 6. Deployment Options

#### Option A: Traditional VPS (DigitalOcean, Linode, AWS EC2)

1. **Install Node.js and MySQL on server**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo apt-get install mysql-server
```

2. **Setup process manager (PM2)**
```bash
npm install -g pm2
cd /path/to/project/backend
pm2 start server.js --name hackathon-portal
pm2 save
pm2 startup
```

3. **Setup Nginx as reverse proxy**
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        root /path/to/project;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

4. **Setup SSL with Let's Encrypt**
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

#### Option B: Platform as a Service (Heroku, Railway, Render)

**Heroku Example:**

1. **Install Heroku CLI**
```bash
npm install -g heroku
heroku login
```

2. **Create Heroku app**
```bash
heroku create your-app-name
```

3. **Add MySQL addon**
```bash
heroku addons:create cleardb:ignite
heroku config:get CLEARDB_DATABASE_URL
```

4. **Update environment variables**
```bash
heroku config:set NODE_ENV=production
heroku config:set SESSION_SECRET=your_secret_here
```

5. **Deploy**
```bash
git push heroku main
```

#### Option C: Vercel (Frontend) + Railway (Backend + DB)

**Frontend on Vercel:**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from project root
vercel
```

**Backend on Railway:**
- Sign up at railway.app
- Create new project from GitHub repo
- Add MySQL database service
- Set environment variables
- Deploy

### 7. Post-Deployment Steps

1. **Test all features:**
   - User registration
   - Login/logout
   - Profile editing
   - Opportunity creation
   - Application submission
   - Admin dashboard

2. **Security audit:**
```bash
npm audit
npm audit fix
```

3. **Setup monitoring:**
   - PM2 monitoring: `pm2 monit`
   - Database backups
   - Error logging (consider services like Sentry)

4. **Performance optimization:**
   - Enable gzip compression
   - Add CDN for static assets
   - Database indexing
   - Implement caching (Redis)

### 8. Maintenance

#### Database Backups
```bash
# Backup
mysqldump -u root -p hackathon_portal_prod > backup_$(date +%Y%m%d).sql

# Restore
mysql -u root -p hackathon_portal_prod < backup_20250101.sql
```

#### Log Management
```bash
# View PM2 logs
pm2 logs hackathon-portal

# Clear logs
pm2 flush
```

#### Updates
```bash
git pull origin main
cd backend
npm install
pm2 restart hackathon-portal
```

## 📋 Pre-Launch Checklist

- [ ] All passwords hashed in database
- [ ] Environment variables set correctly
- [ ] HTTPS/SSL certificate installed
- [ ] CORS configured for production domain
- [ ] Rate limiting tested
- [ ] Database backed up
- [ ] Error pages customized
- [ ] Contact email configured
- [ ] Privacy policy and terms of service added
- [ ] Google Analytics or tracking configured (optional)
- [ ] Test user registration flow
- [ ] Test all user roles (student, recruiter, admin)
- [ ] Performance testing completed
- [ ] Mobile responsiveness verified

## 🔒 Security Best Practices

1. **Never commit `.env` file** - Already in `.gitignore`
2. **Use strong passwords** - Enforce in validation
3. **Keep dependencies updated** - Run `npm audit` regularly
4. **Monitor logs** - Watch for suspicious activity
5. **Regular backups** - Automate database backups
6. **HTTPS only** - Redirect HTTP to HTTPS
7. **Input validation** - Already implemented
8. **SQL injection prevention** - Using parameterized queries

## 📞 Support

For issues or questions:
- Check logs: `pm2 logs`
- Database status: `mysql -u root -p -e "SHOW PROCESSLIST;"`
- Server status: `pm2 status`

## 🎯 Future Enhancements

- [ ] Email verification for new users
- [ ] Password reset functionality
- [ ] File upload for resumes
- [ ] Real-time notifications
- [ ] Advanced search and filters
- [ ] Analytics dashboard
- [ ] API documentation (Swagger)
- [ ] Automated testing
