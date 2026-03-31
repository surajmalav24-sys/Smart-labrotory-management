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
  if (daysBetween(complaint.createdAt) > 30) {
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
    return '<p class="meta">No technician update yet.</p>';
  }
  return `
    <div class="meta">
      <p><strong>Remark:</strong> ${complaint.remark || '—'}</p>
      <p><strong>Expected resolution:</strong> ${complaint.expectedResolutionDate || '—'}</p>
    </div>
  `;
}

function ComplaintCard(complaint, role) {
  const status = normalizeStatus(complaint);
  const age = daysBetween(complaint.createdAt);
  const warn = age > 25 && age <= 30 ? '<p class="warning">Warning: near expiry (25+ days).</p>' : '';
  const expiredNote = status === 'Expired' ? '<p class="expired-note">This complaint has expired (30 days limit)</p>' : '';

  const techControls =
    role === 'Technician' && status !== 'Expired'
      ? `
      <form class="tech-controls" data-id="${complaint.id}">
        <select name="status" required>
          <option value="Open" ${complaint.status === 'Open' ? 'selected' : ''}>Open</option>
          <option value="In Progress" ${complaint.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
          <option value="Resolved" ${complaint.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
        </select>
        <input name="remark" placeholder="Remark" value="${complaint.remark || ''}" required />
        <input name="expectedResolutionDate" type="date" value="${complaint.expectedResolutionDate || ''}" required />
        <button class="btn btn-primary" type="submit">Update</button>
      </form>
    `
      : '';

  return `
    <article class="complaint-card">
      <div class="complaint-header">
        <h3>${complaint.title}</h3>
        ${StatusBadge(status)}
      </div>
      <div class="meta">
        <p><strong>Category:</strong> ${complaint.category}</p>
        <p><strong>Date posted:</strong> ${complaint.createdAt}</p>
      </div>
      ${RemarkBox(complaint)}
      ${warn}
      ${expiredNote}
      ${techControls}
    </article>
  `;
}

function RoleBasedDashboard(user, complaints) {
  if (user.role === 'Student') {
    return complaints.filter((item) => item.userId === user.id);
  }
  if (user.role === 'Technician') {
    return complaints.filter((item) => item.assignedTo === user.id);
  }
  return complaints;
}

function initLoginPage() {
  const form = document.getElementById('login-form');
  if (!form) {
    return;
  }

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
  if (!listEl) {
    return;
  }

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
    newComplaintBtn.classList.add('hidden');
    newComplaintPanel.classList.add('hidden');
  }

  const render = () => {
    const complaints = getComplaints().map((item) => ({ ...item, status: normalizeStatus(item) }));
    saveComplaints(complaints);
    const filtered = RoleBasedDashboard(user, complaints);
    listEl.innerHTML = filtered.length
      ? filtered.map((complaint) => ComplaintCard(complaint, user.role)).join('')
      : '<article class="complaint-card"><p class="meta">No complaints to show.</p></article>';

    listEl.querySelectorAll('.tech-controls').forEach((form) => {
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        const id = Number(form.dataset.id);
        const status = form.status.value;
        const remark = form.remark.value.trim();
        const expectedResolutionDate = form.expectedResolutionDate.value;

        if (!remark || !expectedResolutionDate) {
          return;
        }

        const updated = getComplaints().map((item) =>
          item.id === id
            ? { ...item, status, remark, expectedResolutionDate }
            : item
        );
        saveComplaints(updated);
        render();
      });
    });
  };

  newComplaintBtn.addEventListener('click', () => {
    newComplaintPanel.classList.toggle('hidden');
  });

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

  signOutBtn.addEventListener('click', () => {
    sessionStorage.removeItem('campuscare-user');
    window.location.href = 'index.html';
  });

  render();
}

initLoginPage();
initDashboardPage();
