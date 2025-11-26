-- ========================================
-- Hackathon & Internship Portal Database
-- ========================================

-- Create database
CREATE DATABASE IF NOT EXISTS hackathon_portal;
USE hackathon_portal;

-- ========================================
-- Users Table
-- ========================================
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('student', 'recruiter', 'admin') DEFAULT 'student',
  bio TEXT,
  skills TEXT,
  resume_url VARCHAR(500),
  profile_picture VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ========================================
-- Opportunities Table
-- ========================================
CREATE TABLE IF NOT EXISTS opportunities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  company VARCHAR(255) NOT NULL,
  type ENUM('hackathon', 'internship', 'both') DEFAULT 'internship',
  description TEXT NOT NULL,
  requirements TEXT,
  location VARCHAR(255),
  duration VARCHAR(100),
  pay VARCHAR(100),
  deadline DATE,
  status ENUM('active', 'closed', 'draft') DEFAULT 'active',
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ========================================
-- Applications Table
-- ========================================
CREATE TABLE IF NOT EXISTS applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  opportunity_id INT NOT NULL,
  status ENUM('pending', 'accepted', 'rejected', 'withdrawn') DEFAULT 'pending',
  cover_letter TEXT,
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (opportunity_id) REFERENCES opportunities(id) ON DELETE CASCADE,
  UNIQUE KEY unique_application (user_id, opportunity_id)
);

-- ========================================
-- Insert Sample Data
-- ========================================

-- Sample Users
INSERT INTO users (name, email, password, role, bio) VALUES
('Admin User', 'admin@example.com', '12345678', 'recruiter', 'Platform administrator and recruiter'),
('John Student', 'student@example.com', '12345678', 'student', 'Computer Science student looking for opportunities'),
('Jane Recruiter', 'recruiter@example.com', '12345678', 'recruiter', 'Tech recruiter at leading companies');

-- Sample Opportunities
INSERT INTO opportunities (title, company, type, description, requirements, location, duration, pay, created_by, status) VALUES
('Frontend Developer Intern', 'Acme Labs', 'internship', 'Build UI components & contribute to open-source hackathon tools. Work with React, TypeScript, and modern web technologies.', 'Knowledge of React, JavaScript, HTML/CSS', 'Remote', '3 months', 'Paid - $1500/month', 1, 'active'),
('Backend Developer Intern', 'DataMesh', 'internship', 'Work on APIs and scalable ingestion pipelines for hackathon analytics. Build RESTful services with Node.js and databases.', 'Node.js, SQL, REST APIs', 'Bengaluru, India', '3-6 months', 'Stipend - ₹25,000/month', 1, 'active'),
('Annual Hackathon 2025', 'TechCorp', 'hackathon', 'Join our 48-hour hackathon to build innovative solutions. Win prizes up to $10,000 and get mentorship from industry experts.', 'Any programming language, creativity, teamwork', 'Mumbai, India', '48 hours', 'Prize pool - $25,000', 3, 'active'),
('Full Stack Development Internship', 'StartupXYZ', 'internship', 'Work on both frontend and backend of our product. Great learning opportunity in a fast-paced startup environment.', 'JavaScript, React, Node.js, MongoDB', 'Hybrid - Delhi', '6 months', 'Paid - ₹30,000/month', 3, 'active'),
('AI/ML Hackathon', 'AI Innovators', 'hackathon', 'Build AI-powered solutions for real-world problems. Focus on machine learning, computer vision, or NLP.', 'Python, ML frameworks (TensorFlow/PyTorch)', 'Online', '3 days', 'Prizes & certificates', 1, 'active');

-- Sample Applications
INSERT INTO applications (user_id, opportunity_id, status, cover_letter) VALUES
(2, 1, 'pending', 'I am very interested in this frontend position. I have experience with React and modern JavaScript.'),
(2, 3, 'accepted', 'I would love to participate in this hackathon. I have participated in 3 hackathons before.');

-- ========================================
-- Indexes for Performance
-- ========================================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_opportunities_status ON opportunities(status);
CREATE INDEX idx_opportunities_type ON opportunities(type);
CREATE INDEX idx_applications_user ON applications(user_id);
CREATE INDEX idx_applications_opportunity ON applications(opportunity_id);
CREATE INDEX idx_applications_status ON applications(status);

-- ========================================
-- Views for Common Queries
-- ========================================

-- View: User Applications with Opportunity Details
CREATE OR REPLACE VIEW user_applications_view AS
SELECT 
  a.id AS application_id,
  a.user_id,
  u.name AS user_name,
  u.email AS user_email,
  a.opportunity_id,
  o.title AS opportunity_title,
  o.company,
  o.type,
  o.location,
  a.status,
  a.applied_at
FROM applications a
JOIN users u ON a.user_id = u.id
JOIN opportunities o ON a.opportunity_id = o.id;

-- View: Active Opportunities with Creator Details
CREATE OR REPLACE VIEW active_opportunities_view AS
SELECT 
  o.id,
  o.title,
  o.company,
  o.type,
  o.description,
  o.location,
  o.duration,
  o.pay,
  o.deadline,
  u.name AS created_by_name,
  u.email AS created_by_email,
  o.created_at,
  (SELECT COUNT(*) FROM applications WHERE opportunity_id = o.id) AS application_count
FROM opportunities o
LEFT JOIN users u ON o.created_by = u.id
WHERE o.status = 'active';

-- ========================================
-- Success Message
-- ========================================
SELECT 'Database setup completed successfully!' AS message;
