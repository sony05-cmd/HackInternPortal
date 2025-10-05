// Basic front-end logic for HackathonInternshipPortal

window.app = {
  async handleLogin(formData) {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      const msgBox = document.getElementById('loginMessage');
      if (res.ok) {
        msgBox.textContent = 'Login successful! Redirecting…';
        msgBox.style.color = 'green';
        setTimeout(() => window.location.href = 'dashboard.html', 1000);
      } else {
        msgBox.textContent = data.message || 'Login failed.';
        msgBox.style.color = 'red';
      }
    } catch (err) {
      console.error(err);
    }
  },

  async handleRegister(formData) {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      const msgBox = document.getElementById('registerMessage');
      if (res.ok) {
        msgBox.textContent = 'Account created! Redirecting…';
        msgBox.style.color = 'green';
        setTimeout(() => window.location.href = 'login.html', 1000);
      } else {
        msgBox.textContent = data.message || 'Registration failed.';
        msgBox.style.color = 'red';
      }
    } catch (err) {
      console.error(err);
    }
  },

  async searchOpportunities({ q, loc }) {
    try {
      const res = await fetch(`/api/opportunities?q=${encodeURIComponent(q)}&loc=${encodeURIComponent(loc)}`);
      const data = await res.json();
      const list = document.getElementById('opportunitiesList');
      list.innerHTML = '';
      if (data.length === 0) {
        document.getElementById('noOpps').classList.remove('hidden');
        return;
      }
      data.forEach(o => {
        const card = document.createElement('article');
        card.className = 'opp-card';
        card.innerHTML = `
          <h3>${o.title} — ${o.company}</h3>
          <p class="meta">${o.location} · ${o.duration} · ${o.pay || 'Unpaid'}</p>
          <p class="desc">${o.description}</p>
          <div class="card-actions">
            <a class="btn small" href="opportunity.html?id=${o.id}">Details</a>
            <button class="btn small outline" onclick="window.app.applyToOpp(${o.id})">Apply</button>
          </div>
        `;
        list.appendChild(card);
      });
    } catch (err) {
      console.error(err);
    }
  },

  async applyToOpp(id) {
    if (!confirm('Apply for this opportunity?')) return;
    try {
      const res = await fetch(`/api/opportunities/${id}/apply`, { method: 'POST' });
      if (res.ok) {
        alert('Application submitted!');
      } else {
        alert('Failed to apply.');
      }
    } catch (err) {
      console.error(err);
    }
  },

  async initDashboard() {
    try {
      // Fetch profile
      const profileRes = await fetch('/api/user/profile');
      const profile = await profileRes.json();
      document.getElementById('profileSummary').innerHTML = `
        <p><strong>${profile.name}</strong></p>
        <p>${profile.email}</p>
        <p>Role: ${profile.role}</p>
      `;

      // Fetch applications
      const appsRes = await fetch('/api/user/applications');
      const apps = await appsRes.json();
      const appList = document.getElementById('applicationsList');
      if (apps.length === 0) {
        appList.innerHTML = '<p class="muted">No applications yet.</p>';
      } else {
        appList.innerHTML = '<ul>' + apps.map(a => `<li>${a.title} @ ${a.company}</li>`).join('') + '</ul>';
      }

      // Fetch recommended opportunities
      const recRes = await fetch('/api/opportunities/recommended');
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
    fetch('/api/auth/logout', { method: 'POST' }).then(() => {
      window.location.href = 'index.html';
    });
  },

  openEditProfile() {
    alert('Edit profile feature coming soon!');
  },

  openCreateOpportunity() {
    const modal = document.getElementById('adminModal');
    modal.innerHTML = `
      <div>
        <h3>Create Opportunity</h3>
        <form id="createOppForm">
          <label>Title <input name="title" required></label>
          <label>Company <input name="company" required></label>
          <label>Location <input name="location" required></label>
          <label>Description <textarea name="description" required></textarea></label>
          <button class="btn" type="submit">Create</button>
        </form>
      </div>
    `;
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');

    document.getElementById('createOppForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const res = await fetch('/api/opportunities', { method: 'POST', body: formData });
      if (res.ok) {
        alert('Opportunity created!');
        modal.classList.add('hidden');
      } else {
        alert('Failed to create opportunity');
      }
    });
  },

  async initAdmin() {
    try {
      const oppRes = await fetch('/api/opportunities');
      const opps = await oppRes.json();
      const list = document.getElementById('adminOppList');
      list.innerHTML = opps.map(o => `<div>${o.title} <button onclick="window.app.deleteOpp(${o.id})">Delete</button></div>`).join('');

      const userRes = await fetch('/api/users');
      const users = await userRes.json();
      document.getElementById('adminUserList').innerHTML =
        '<ul>' + users.map(u => `<li>${u.name} (${u.email})</li>`).join('') + '</ul>';
    } catch (err) {
      console.error(err);
    }
  },

  async deleteOpp(id) {
    if (!confirm('Delete this opportunity?')) return;
    await fetch(`/api/opportunities/${id}`, { method: 'DELETE' });
    alert('Opportunity deleted');
    this.initAdmin();
  }
};