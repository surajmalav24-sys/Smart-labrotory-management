const credentials = [
  { id: 'admin-1', email: 'admin@mmit.edu.in', password: 'admin123', role: 'Admin', name: 'Admin User' },
  { id: 'tech-1', email: 'tech@mmit.edu.in', password: 'tech123', role: 'Technician', name: 'Tech User' },
  { id: 'student-1', email: 'om.wadekar24@mmit.edu.in', password: 'student123', role: 'Student', name: 'Student User' }
];

const seedComplaints = [
  {
    id: 1,
    title: 'Projector not working in Lab 3',
    category: 'Hardware',
    userId: 'student-1',
    status: 'Open',
    createdAt: '2026-03-05',
    expiresAt: '2026-04-04',
    remark: '',
    expectedResolutionDate: '',
    assignedTo: 'tech-1'
  },
  {
    id: 2,
    title: 'WiFi unstable in library',
    category: 'Network',
    userId: 'student-2',
    status: 'In Progress',
    createdAt: '2026-03-10',
    expiresAt: '2026-04-09',
    remark: 'Router diagnostics running.',
    expectedResolutionDate: '2026-04-02',
    assignedTo: 'tech-1'
  },
  {
    id: 3,
    title: 'Broken chair in Room 204',
    category: 'Maintenance',
    userId: 'student-1',
    status: 'Resolved',
    createdAt: '2026-03-01',
    expiresAt: '2026-03-31',
    remark: 'Chair replaced.',
    expectedResolutionDate: '2026-03-28',
    assignedTo: 'tech-1'
  }
];

function getComplaints() {
  const stored = JSON.parse(localStorage.getItem('campuscare-complaints') || 'null');
  if (stored && Array.isArray(stored)) {
    return stored;
  }
  localStorage.setItem('campuscare-complaints', JSON.stringify(seedComplaints));
  return seedComplaints;
}

function saveComplaints(complaints) {
  localStorage.setItem('campuscare-complaints', JSON.stringify(complaints));
}

function daysBetween(startDate, endDate = new Date()) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return Math.floor((end - start) / (1000 * 60 * 60 * 24));
}

function normalizeStatus(complaint) {
  // Fix for AI page date format
  const dateStr = complaint.createdAt || complaint.date; 
  if (daysBetween(dateStr) > 30) {
    return 'Expired';
  }
  return complaint.status;
}

function StatusBadge(status) {
  const cls = status.toLowerCase().replace(/\s+/g, '-');
  return `<span class="status-badge status-${cls}">${status}</span>`;
}

function RemarkBox(complaint) {
  if (!complaint.remark && !complaint.expectedResolutionDate) {
    return '<p class="meta" style="color: #666; font-style: italic;">No technician update yet.</p>';
  }
  return `
    <div class="meta" style="background: #f0f8ff; padding: 10px; border-radius: 5px; margin-top: 10px;">
      <p><strong>Technician Remark:</strong> ${complaint.remark || '—'}</p>
      <p><strong>Expected resolution:</strong> ${complaint.expectedResolutionDate || '—'}</p>
    </div>
  `;
}

function ComplaintCard(complaint, role) {
  const status = normalizeStatus(complaint);
  const dateStr = complaint.createdAt || complaint.date;
  const age = daysBetween(dateStr);
  const warn = age > 25 && age <= 30 ? '<p class="warning" style="color: orange;">Warning: near expiry (25+ days).</p>' : '';
  const expiredNote = status === 'Expired' ? '<p class="expired-note" style="color: red;">This complaint has expired (30 days limit)</p>' : '';

  // 🖼️ NEW: Photo aur Department yahan dikhega!
  const imageHtml = complaint.image 
    ? `<div style="margin: 15px 0;"><img src="${complaint.image}" alt="Issue Photo" style="max-width: 100%; max-height: 250px; border-radius: 8px; border: 1px solid #ddd; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"></div>` 
    : '';

  const deptHtml = complaint.department 
    ? `<p><strong>Department/Lab:</strong> ${complaint.department}</p>` 
    : '';

  const techControls =
    role === 'Technician' && status !== 'Expired'
      ? `
      <form class="tech-controls" data-id="${complaint.id}" style="margin-top: 15px; border-top: 1px solid #eee; padding-top: 10px;">
        <select name="status" required>
          <option value="Open" ${complaint.status === 'Open' ? 'selected' : ''}>Open</option>
          <option value="In Progress" ${complaint.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
          <option value="Resolved" ${complaint.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
        </select>
        <input name="remark" placeholder="Remark" value="${complaint.remark || ''}" required style="margin-left: 5px;" />
        <input name="expectedResolutionDate" type="date" value="${complaint.expectedResolutionDate || ''}" required style="margin-left: 5px;" />
        <button class="btn btn-primary" type="submit" style="margin-left: 5px;">Update Status</button>
      </form>
    `
      : '';

  return `
    <article class="complaint-card" style="border: 1px solid #ddd; padding: 15px; margin-bottom: 15px; border-radius: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
      <div class="complaint-header" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 10px;">
        <h3 style="margin: 0; color: #333;">${complaint.title}</h3>
        ${StatusBadge(status)}
      </div>
      <div class="meta" style="color: #555; font-size: 0.9em;">
        <p><strong>Category:</strong> ${complaint.category}</p>
        ${deptHtml}
        <p><strong>Date posted:</strong> ${dateStr}</p>
      </div>
      ${imageHtml}
      ${RemarkBox(complaint)}
      ${warn}
      ${expiredNote}
      ${techControls}
    </article>
  `;
}

function RoleBasedDashboard(user, complaints) {
  if (user.role === 'Student') {
    // Ab AI page se aayi hui complaint bhi student ko dikhegi
    return complaints.filter((item) => item.userId === user.id || !item.userId);
  }
  if (user.role === 'Technician') {
    // Technician ko saari nayi complaints dikhengi
    return complaints.filter((item) => item.assignedTo === user.id || item.technician === 'Unassigned');
  }
  return complaints;
}

function initLoginPage() {
  const form = document.getElementById('login-form');
  if (!form) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const email = document.getElementById('email').value.trim().toLowerCase();
    const password = document.getElementById('password').value;
    const error = document.getElementById('login-error');

    const user = credentials.find((item) => item.email === email && item.password === password);
    if (!user) {
      error.textContent = 'Invalid credentials';
      return;
    }

    sessionStorage.setItem('campuscare-user', JSON.stringify(user));
    window.location.href = 'dashboard.html';
  });
}

function initDashboardPage() {
  const listEl = document.getElementById('complaint-list');
  if (!listEl) return;

  const user = JSON.parse(sessionStorage.getItem('campuscare-user') || 'null');
  if (!user) {
    window.location.href = 'index.html';
    return;
  }

  const roleHeading = document.getElementById('role-heading');
  const listHeading = document.getElementById('list-heading');
  const newComplaintBtn = document.getElementById('new-complaint-btn');
  const newComplaintPanel = document.getElementById('new-complaint-panel');
  const signOutBtn = document.getElementById('sign-out-btn');
  const newComplaintForm = document.getElementById('new-complaint-form');

  roleHeading.textContent = `${user.role} Dashboard • ${user.name}`;
  listHeading.textContent = user.role === 'Student' ? 'My Complaints' : user.role === 'Technician' ? 'Assigned Complaints' : 'All Complaints';

  if (user.role !== 'Student') {
    if (newComplaintBtn) newComplaintBtn.classList.add('hidden');
    if (newComplaintPanel) newComplaintPanel.classList.add('hidden');
  }

  const render = () => {
    const complaints = getComplaints().map((item) => ({ ...item, status: normalizeStatus(item) }));
    saveComplaints(complaints);
    const filtered = RoleBasedDashboard(user, complaints);
    listEl.innerHTML = filtered.length
      ? filtered.map((complaint) => ComplaintCard(complaint, user.role)).join('')
      : '<article class="complaint-card" style="text-align:center; padding: 20px;"><p class="meta">No complaints to show.</p></article>';

    listEl.querySelectorAll('.tech-controls').forEach((form) => {
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        const id = Number(form.dataset.id);
        const status = form.status.value;
        const remark = form.remark.value.trim();
        const expectedResolutionDate = form.expectedResolutionDate.value;

        if (!remark || !expectedResolutionDate) return;

        const updated = getComplaints().map((item) =>
          item.id === id ? { ...item, status, remark, expectedResolutionDate } : item
        );
        saveComplaints(updated);
        render();
      });
    });
  };

  // Ye line humein naye AI wale page par le jayegi
  if (newComplaintBtn) {
    newComplaintBtn.addEventListener('click', () => {
      window.location.href = 'new-complaint.html'; 
    });
  }

  // Purana form fallback (agar panel dikh raha ho tab)
  if (newComplaintForm) {
    newComplaintForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const title = document.getElementById('complaint-title').value.trim();
      const category = document.getElementById('complaint-category').value.trim();

      const complaints = getComplaints();
      const createdAt = new Date().toISOString().slice(0, 10);
      const expiresAtDate = new Date();
      expiresAtDate.setDate(expiresAtDate.getDate() + 30);

      complaints.unshift({
        id: Date.now(),
        title,
        category,
        userId: user.id,
        status: 'Open',
        createdAt,
        expiresAt: expiresAtDate.toISOString().slice(0, 10),
        remark: '',
        expectedResolutionDate: '',
        assignedTo: 'tech-1'
      });

      saveComplaints(complaints);
      newComplaintForm.reset();
      newComplaintPanel.classList.add('hidden');
      render();
    });
  }

  if (signOutBtn) {
    signOutBtn.addEventListener('click', () => {
      sessionStorage.removeItem('campuscare-user');
      window.location.href = 'index.html';
    });
  }

  render();
}

initLoginPage();
initDashboardPage();