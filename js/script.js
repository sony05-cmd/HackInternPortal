// Basic front-end logic for HackathonInternshipPortal

window.app = {
  async handleLogin(formData) {
    try {
      // Convert FormData to JSON
      const data = {};
      for (let [key, value] of formData.entries()) {
        data[key] = value;
      }

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      const responseData = await res.json();
      const msgBox = document.getElementById('loginMessage');
      if (res.ok) {
        msgBox.textContent = 'Login successful! Redirecting…';
        msgBox.style.color = 'green';
        
        // Redirect based on user role
        const userRole = responseData.user.role;
        console.log('User role:', userRole);
        const redirectUrl = userRole === 'admin' ? 'admin_dashboard.html' : 'dashboard.html';
        console.log('Redirecting to:', redirectUrl);
        
        setTimeout(() => window.location.href = redirectUrl, 1000);
      } else {
        msgBox.textContent = responseData.message || 'Login failed.';
        msgBox.style.color = 'red';
      }
    } catch (err) {
      console.error(err);
      document.getElementById('loginMessage').textContent = 'Connection error. Please try again.';
      document.getElementById('loginMessage').style.color = 'red';
    }
  },

  async handleForgotPassword(email) {
    try {
      const msgBox = document.getElementById('forgotMessage');
      msgBox.textContent = 'Sending reset link...';
      msgBox.style.color = '#2563eb';

      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const responseData = await res.json();
      
      if (res.ok) {
        msgBox.textContent = responseData.message || 'Password reset link sent to your email!';
        msgBox.style.color = 'green';
        document.getElementById('resetEmail').value = '';
        
        // Close modal after 3 seconds
        setTimeout(() => {
          document.getElementById('forgotPasswordModal').classList.add('hidden');
          msgBox.textContent = '';
        }, 3000);
      } else {
        msgBox.textContent = responseData.message || 'Failed to send reset link.';
        msgBox.style.color = 'red';
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      const msgBox = document.getElementById('forgotMessage');
      msgBox.textContent = 'Connection error. Please try again.';
      msgBox.style.color = 'red';
    }
  },

  async handleResetPassword(token, newPassword) {
    try {
      const msgBox = document.getElementById('resetMessage');
      msgBox.textContent = 'Resetting password...';
      msgBox.style.color = '#2563eb';

      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token, newPassword })
      });

      const responseData = await res.json();
      
      if (res.ok) {
        msgBox.textContent = responseData.message || 'Password reset successful!';
        msgBox.style.color = 'green';
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          window.location.href = 'login.html';
        }, 2000);
      } else {
        msgBox.textContent = responseData.message || 'Failed to reset password.';
        msgBox.style.color = 'red';
      }
    } catch (err) {
      console.error('Reset password error:', err);
      const msgBox = document.getElementById('resetMessage');
      msgBox.textContent = 'Connection error. Please try again.';
      msgBox.style.color = 'red';
    }
  },

  async handleRegister(formData) {
    try {
      // Convert FormData to JSON
      const formDataObj = {};
      for (let [key, value] of formData.entries()) {
        formDataObj[key] = value;
      }

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formDataObj)
      });
      const responseData = await res.json();
      const msgBox = document.getElementById('registerMessage');
      if (res.ok) {
        msgBox.textContent = 'Account created! Redirecting…';
        msgBox.style.color = 'green';
        setTimeout(() => window.location.href = 'login.html', 1000);
      } else {
        msgBox.textContent = responseData.message || 'Registration failed.';
        msgBox.style.color = 'red';
      }
    } catch (err) {
      console.error(err);
    }
  },

  async searchOpportunities({ q = '', loc = '', type = '' }) {
    try {
      const params = new URLSearchParams();
      if (q) params.append('q', q);
      if (loc) params.append('loc', loc);
      if (type) params.append('type', type);
      
      const res = await fetch(`/api/opportunities?${params.toString()}`);
      const data = await res.json();
      const list = document.getElementById('opportunitiesList');
      
      if (!list) return; // Exit if not on opportunities page
      
      list.innerHTML = '';
      
      if (data.length === 0) {
        list.innerHTML = '<div class="no-results">No opportunities found. Try different filters.</div>';
        return;
      }
      
      data.forEach(o => {
        const card = document.createElement('article');
        card.className = 'opp-card';
        card.innerHTML = `
          <h3>${o.title} — ${o.company}</h3>
          <p class="meta">${o.location} · ${o.duration || 'Flexible'} · ${o.pay || 'Unpaid'}</p>
          <p class="desc">${o.description ? o.description.substring(0, 150) + '...' : 'No description'}</p>
          <div class="card-actions">
            <button class="btn small" onclick="window.app.applyToOpp(${o.id})">Apply Now</button>
          </div>
        `;
        list.appendChild(card);
      });
    } catch (err) {
      console.error('Search error:', err);
      const list = document.getElementById('opportunitiesList');
      if (list) {
        list.innerHTML = '<div class="error">Failed to load opportunities. Please try again.</div>';
      }
    }
  },

  async applyToOpp(id) {
    if (!confirm('Apply for this opportunity?')) return;
    try {
      const res = await fetch(`/api/opportunities/${id}/apply`, { 
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (res.ok) {
        alert('Application submitted!');
        // Optionally reload opportunities to update UI
      } else {
        const error = await res.json();
        alert(error.message || 'Failed to apply.');
      }
    } catch (err) {
      console.error(err);
      alert('Error submitting application.');
    }
  },

  async initDashboard() {
    try {
      // Fetch profile
      const profileRes = await fetch('/api/user/profile', { credentials: 'include' });
      const profile = await profileRes.json();
      
      let profileHTML = `
        <p><strong>${profile.name}</strong></p>
        <p>${profile.email}</p>
        <p>Role: ${profile.role}</p>
      `;
      
      if (profile.bio) {
        profileHTML += `<p class="muted">${profile.bio}</p>`;
      }
      if (profile.skills) {
        profileHTML += `<p><strong>Skills:</strong> ${profile.skills}</p>`;
      }
      if (profile.resume_url) {
        profileHTML += `<p><a href="${profile.resume_url}" target="_blank">View Resume</a></p>`;
      }
      
      document.getElementById('profileSummary').innerHTML = profileHTML;

      // Fetch applications
      const appsRes = await fetch('/api/user/applications', { credentials: 'include' });
      const apps = await appsRes.json();
      console.log('Applications received:', apps);
      const appList = document.getElementById('applicationsList');
      if (apps.length === 0) {
        appList.innerHTML = '<p class="muted">No applications yet.</p>';
      } else {
        appList.innerHTML = apps.map(a => `
          <div class="application-item">
            <div class="application-header">
              <strong>${a.title}</strong>
              <span class="status-badge status-${a.status}">${a.status}</span>
            </div>
            <p class="application-company">${a.company}</p>
            <p class="application-details">
              ${a.type ? `<span>${a.type}</span>` : ''}
              ${a.location ? `<span>📍 ${a.location}</span>` : ''}
              ${a.pay ? `<span>💰 ${a.pay}</span>` : ''}
            </p>
            <p class="application-date">Applied: ${new Date(a.applied_at).toLocaleDateString()}</p>
          </div>
        `).join('');
      }

      // Fetch recommended opportunities
      const recRes = await fetch('/api/opportunities/recommended', { credentials: 'include' });
      const recs = await recRes.json();
      const recList = document.getElementById('recommendedList');
      recList.innerHTML = '';
      recs.forEach(o => {
        const div = document.createElement('div');
        div.className = 'opp-card';
        div.innerHTML = `<h3>${o.title}</h3><p class="meta">${o.company}</p>`;
        recList.appendChild(div);
      });
    } catch (err) {
      console.error(err);
    }
  },

  logout() {
    fetch('/api/auth/logout', { 
      method: 'POST',
      credentials: 'include'
    }).then(() => {
      window.location.href = 'index.html';
    });
  },

  async openEditProfile() {
    try {
      console.log('Opening edit profile...');
      // Fetch current profile data
      const res = await fetch('/api/user/profile', { credentials: 'include' });
      
      console.log('Profile fetch response status:', res.status, res.ok);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Profile fetch error:', res.status, errorText);
        alert(`Failed to load profile (Status: ${res.status}). ${errorText}`);
        return;
      }
      
      const profile = await res.json();
      console.log('Profile loaded:', profile);
      
      // Display current resume if exists
      const currentResumeEl = document.getElementById('currentResume');
      if (profile.resume_url) {
        currentResumeEl.innerHTML = `Current: <a href="${profile.resume_url}" target="_blank">View Resume</a>`;
      } else {
        currentResumeEl.innerHTML = 'No resume uploaded yet';
      }
      
      // Setup resume upload button
      document.getElementById('uploadResumeBtn').onclick = () => {
        window.app.uploadResume();
      };
      
      // Populate form with current data
      document.getElementById('profileName').value = profile.name || '';
      document.getElementById('profileBio').value = profile.bio || '';
      document.getElementById('profileSkills').value = profile.skills || '';
      document.getElementById('profilePicture').value = profile.profile_picture || '';
      
      // Show modal
      const modal = document.getElementById('editProfileModal');
      modal.classList.remove('hidden');
      modal.setAttribute('aria-hidden', 'false');
      
      // Setup close button
      document.getElementById('closeModal').onclick = () => {
        modal.classList.add('hidden');
        modal.setAttribute('aria-hidden', 'true');
      };
      
      // Setup form submit
      document.getElementById('editProfileForm').onsubmit = async (e) => {
        e.preventDefault();
        
        const formData = {
          name: document.getElementById('profileName').value,
          bio: document.getElementById('profileBio').value,
          skills: document.getElementById('profileSkills').value,
          resume_url: document.getElementById('profileResumeUrl').value,
          profile_picture: document.getElementById('profilePicture').value
        };
        
        // Use correct endpoint: /api/user/:id (not /api/user/profile/:id)
        const updateRes = await fetch(`/api/user/${profile.id}`, {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });
        
        if (updateRes.ok) {
          alert('Profile updated successfully!');
          modal.classList.add('hidden');
          modal.setAttribute('aria-hidden', 'true');
          // Refresh dashboard to show updated profile
          window.app.initDashboard();
        } else {
          const error = await updateRes.json();
          alert(error.message || 'Failed to update profile');
        }
      };
    } catch (err) {
      console.error('Error opening edit profile:', err);
      alert('Failed to load profile data. Error: ' + err.message);
    }
  },

  async uploadResume() {
    try {
      const fileInput = document.getElementById('resumeFile');
      const file = fileInput.files[0];
      
      if (!file) {
        alert('Please select a file to upload');
        return;
      }
      
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        alert('Invalid file type. Only PDF, DOC, and DOCX files are allowed.');
        return;
      }
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB. Please choose a smaller file.');
        return;
      }
      
      const formData = new FormData();
      formData.append('resume', file);
      
      const uploadBtn = document.getElementById('uploadResumeBtn');
      uploadBtn.disabled = true;
      uploadBtn.textContent = 'Uploading...';
      
      const res = await fetch('/api/user/upload-resume', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      
      if (res.ok) {
        const result = await res.json();
        alert('Resume uploaded successfully!');
        document.getElementById('currentResume').innerHTML = `Current: <a href="${result.resumeUrl}" target="_blank">View Resume</a>`;
        fileInput.value = ''; // Clear file input
      } else {
        const error = await res.json();
        alert(error.message || 'Failed to upload resume');
      }
      
      uploadBtn.disabled = false;
      uploadBtn.textContent = 'Upload Resume';
    } catch (err) {
      console.error('Resume upload error:', err);
      alert('Error uploading resume: ' + err.message);
      document.getElementById('uploadResumeBtn').disabled = false;
      document.getElementById('uploadResumeBtn').textContent = 'Upload Resume';
    }
  },

  openCreateOpportunity() {
    const modal = document.getElementById('adminModal');
    modal.innerHTML = `
      <div class="modal-content">
        <span class="close" id="closeAdminModal">&times;</span>
        <h3>Create New Opportunity</h3>
        <form id="createOppForm">
          <label>
            Title *
            <input type="text" name="title" required>
          </label>
          <label>
            Company *
            <input type="text" name="company" required>
          </label>
          <label>
            Type *
            <select name="type" required>
              <option value="">Select type...</option>
              <option value="Internship">Internship</option>
              <option value="Hackathon">Hackathon</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
            </select>
          </label>
          <label>
            Location *
            <input type="text" name="location" required placeholder="e.g. Remote, New York">
          </label>
          <label>
            Duration
            <input type="text" name="duration" placeholder="e.g. 3 months, 2 weeks">
          </label>
          <label>
            Pay/Stipend
            <input type="text" name="pay" placeholder="e.g. $1000/month, Unpaid">
          </label>
          <label>
            Description *
            <textarea name="description" rows="4" required placeholder="Describe the opportunity..."></textarea>
          </label>
          <label>
            Requirements
            <textarea name="requirements" rows="3" placeholder="Skills or qualifications needed..."></textarea>
          </label>
          <button class="btn" type="submit">Create Opportunity</button>
        </form>
      </div>
    `;
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');

    // Close button handler
    document.getElementById('closeAdminModal').onclick = () => {
      modal.classList.add('hidden');
      modal.setAttribute('aria-hidden', 'true');
    };

    // Form submit handler
    document.getElementById('createOppForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = new FormData(e.target);
      const data = {};
      for (let [key, value] of formData.entries()) {
        data[key] = value;
      }

      try {
        const res = await fetch('/api/opportunities', { 
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });
        
        if (res.ok) {
          alert('Opportunity created successfully!');
          modal.classList.add('hidden');
          modal.setAttribute('aria-hidden', 'true');
          window.app.initAdmin();
        } else {
          const error = await res.json();
          alert(error.message || 'Failed to create opportunity');
        }
      } catch (err) {
        console.error('Create opportunity error:', err);
        alert('Error creating opportunity');
      }
    });
  },

  async initAdmin() {
    try {
      // Fetch opportunities
      const oppRes = await fetch('/api/opportunities', { credentials: 'include' });
      const opps = await oppRes.json();
      const list = document.getElementById('adminOppList');
      
      if (opps.length === 0) {
        list.innerHTML = '<p class="muted">No opportunities yet.</p>';
      } else {
        list.innerHTML = opps.map(o => `
          <div class="admin-item">
            <div class="admin-item-header">
              <strong>${o.title}</strong>
              <button class="btn small danger" onclick="window.app.deleteOpp(${o.id})">Delete</button>
            </div>
            <p class="muted">${o.company} - ${o.location}</p>
            <p class="small-text">${o.type || 'N/A'} | Created: ${new Date(o.created_at).toLocaleDateString()}</p>
          </div>
        `).join('');
      }

      // Fetch all users - Note: This should be admin-only endpoint
      const userRes = await fetch('/api/user', { credentials: 'include' });
      if (userRes.ok) {
        const users = await userRes.json();
        const userList = document.getElementById('adminUserList');
        
        if (Array.isArray(users)) {
          userList.innerHTML = users.map(u => `
            <div class="admin-item">
              <strong>${u.name}</strong>
              <p class="muted">${u.email}</p>
              <span class="role-badge role-${u.role}">${u.role}</span>
            </div>
          `).join('');
        } else {
          userList.innerHTML = '<p class="muted">Unable to load users.</p>';
        }
      }

      // Fetch activity/statistics
      await this.loadSiteActivity();
    } catch (err) {
      console.error('Admin init error:', err);
    }
  },

  async loadSiteActivity() {
    try {
      // Get application statistics
      const oppRes = await fetch('/api/opportunities', { credentials: 'include' });
      const opportunities = await oppRes.json();
      
      const activityDiv = document.getElementById('siteActivity');
      activityDiv.innerHTML = `
        <div class="stats-grid">
          <div class="stat-item">
            <h4>${opportunities.length}</h4>
            <p>Total Opportunities</p>
          </div>
          <div class="stat-item">
            <h4>-</h4>
            <p>Total Applications</p>
          </div>
          <div class="stat-item">
            <h4>-</h4>
            <p>Active Users</p>
          </div>
        </div>
      `;
    } catch (err) {
      console.error('Load activity error:', err);
    }
  },

  async deleteOpp(id) {
    if (!confirm('Delete this opportunity?')) return;
    try {
      const res = await fetch(`/api/opportunities/${id}`, { 
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        alert('Opportunity deleted successfully');
        this.initAdmin();
      } else {
        alert('Failed to delete opportunity');
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Error deleting opportunity');
    }
  },

  // Recruiter Dashboard Functions
  async initRecruiterDashboard() {
    console.log('Initializing recruiter dashboard...');
    await this.loadMyOpportunities();
    
    // Setup create opportunity form
    const createForm = document.getElementById('createOppForm');
    if (createForm) {
      createForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.createOpportunity(new FormData(createForm));
      });
    }
  },

  async loadMyOpportunities() {
    try {
      const res = await fetch('/api/opportunities', { credentials: 'include' });
      const data = await res.json();
      const list = document.getElementById('myOpportunitiesList');
      
      if (!list) return;
      
      list.innerHTML = '';
      
      if (data.length === 0) {
        list.innerHTML = '<div class="no-results">You haven\'t posted any opportunities yet.</div>';
        return;
      }
      
      data.forEach(opp => {
        const card = document.createElement('article');
        card.className = 'opp-card recruiter-opp-card';
        card.innerHTML = `
          <h3>${opp.title} — ${opp.company}</h3>
          <p class="meta">${opp.type} · ${opp.location} · ${opp.duration || 'Flexible'}</p>
          <p class="desc">${opp.description ? opp.description.substring(0, 120) + '...' : ''}</p>
          <div class="card-actions">
            <button class="btn small" onclick="window.app.viewApplications(${opp.id}, '${opp.title}')">
              View Applications
            </button>
            <button class="btn small secondary" onclick="window.app.deleteOpportunity(${opp.id})">
              Delete
            </button>
          </div>
        `;
        list.appendChild(card);
      });
    } catch (err) {
      console.error('Load opportunities error:', err);
      const list = document.getElementById('myOpportunitiesList');
      if (list) {
        list.innerHTML = '<div class="error">Failed to load opportunities.</div>';
      }
    }
  },

  async createOpportunity(formData) {
    try {
      const data = {};
      for (let [key, value] of formData.entries()) {
        data[key] = value;
      }

      const res = await fetch('/api/opportunities', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (res.ok) {
        alert('Opportunity created successfully!');
        document.getElementById('createOppModal').classList.add('hidden');
        document.getElementById('createOppForm').reset();
        await this.loadMyOpportunities();
      } else {
        const error = await res.json();
        alert(error.message || 'Failed to create opportunity');
      }
    } catch (err) {
      console.error('Create opportunity error:', err);
      alert('Error creating opportunity');
    }
  },

  async deleteOpportunity(id) {
    if (!confirm('Are you sure you want to delete this opportunity? This action cannot be undone.')) return;
    
    try {
      const res = await fetch(`/api/opportunities/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (res.ok) {
        alert('Opportunity deleted successfully');
        await this.loadMyOpportunities();
      } else {
        const error = await res.json();
        alert(error.message || 'Failed to delete opportunity');
      }
    } catch (err) {
      console.error('Delete opportunity error:', err);
      alert('Error deleting opportunity');
    }
  },

  async viewApplications(opportunityId, opportunityTitle) {
    try {
      const res = await fetch(`/api/opportunities/${opportunityId}/applications`, {
        credentials: 'include'
      });

      if (!res.ok) {
        const error = await res.json();
        alert(error.message || 'Failed to load applications');
        return;
      }

      const applications = await res.json();
      
      // Hide opportunities list, show applications section
      document.querySelector('.recruiter-section').style.display = 'none';
      const appSection = document.getElementById('applicationsSection');
      appSection.style.display = 'block';
      document.getElementById('selectedOppTitle').textContent = opportunityTitle;
      
      const appList = document.getElementById('applicationsList');
      appList.innerHTML = '';
      
      if (applications.length === 0) {
        appList.innerHTML = '<div class="no-results">No applications yet for this opportunity.</div>';
        return;
      }
      
      applications.forEach(app => {
        const appCard = document.createElement('div');
        appCard.className = 'application-card';
        appCard.innerHTML = `
          <div class="app-header">
            <h4>${app.name}</h4>
            <span class="status-badge status-${app.status}">${app.status}</span>
          </div>
          <p class="app-email">${app.email}</p>
          <p class="app-bio">${app.bio || 'No bio provided'}</p>
          <p class="app-skills"><strong>Skills:</strong> ${app.skills || 'Not specified'}</p>
          ${app.cover_letter ? `<p class="app-cover-letter"><strong>Cover Letter:</strong> ${app.cover_letter}</p>` : ''}
          <p class="app-date">Applied: ${new Date(app.applied_at).toLocaleDateString()}</p>
          ${app.resume_url ? `<a href="${app.resume_url}" target="_blank" class="btn small">View Resume</a>` : ''}
          <div class="app-actions">
            <button class="btn small success" onclick="window.app.updateApplicationStatus(${app.id}, 'accepted')">
              Accept
            </button>
            <button class="btn small danger" onclick="window.app.updateApplicationStatus(${app.id}, 'rejected')">
              Reject
            </button>
          </div>
        `;
        appList.appendChild(appCard);
      });
    } catch (err) {
      console.error('View applications error:', err);
      alert('Error loading applications');
    }
  },

  async updateApplicationStatus(applicationId, status) {
    try {
      const res = await fetch(`/api/opportunities/applications/${applicationId}/status`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      if (res.ok) {
        alert(`Application ${status} successfully!`);
        // Refresh the applications view
        const title = document.getElementById('selectedOppTitle').textContent;
        // Find opportunity ID from current view - we need to store it
        location.reload(); // Simple solution: reload the page
      } else {
        const error = await res.json();
        alert(error.message || 'Failed to update application status');
      }
    } catch (err) {
      console.error('Update application status error:', err);
      alert('Error updating application status');
    }
  },

  closeApplicationsView() {
    document.getElementById('applicationsSection').style.display = 'none';
    document.querySelector('.recruiter-section').style.display = 'block';
  }
};

// Auto-initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', () => {
  // Check which page we're on and initialize accordingly
  const path = window.location.pathname;
  
  if (path.includes('dashboard.html')) {
    console.log('Dashboard page detected, initializing...');
    if (window.app && typeof window.app.initDashboard === 'function') {
      window.app.initDashboard();
    }
  } else if (path.includes('admin_dashboard.html')) {
    console.log('Admin dashboard page detected, initializing...');
    if (window.app && typeof window.app.initAdmin === 'function') {
      window.app.initAdmin();
    }
  } else if (path.includes('recruiter_dashboard.html')) {
    console.log('Recruiter dashboard page detected, initializing...');
    if (window.app && typeof window.app.initRecruiterDashboard === 'function') {
      window.app.initRecruiterDashboard();
    }
  } else if (path.includes('opportunities.html')) {
    console.log('Opportunities page detected, initializing...');
    if (window.app && typeof window.app.searchOpportunities === 'function') {
      window.app.searchOpportunities({ q: '', loc: '' });
    }
  }
});