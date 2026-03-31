const complaintGrid = document.getElementById('complaint-grid');
const emptyState = document.getElementById('empty-state');
const searchInput = document.getElementById('search-input');
const departmentFilter = document.getElementById('department-filter');

const statTotal = document.getElementById('stat-total');
const statOpen = document.getElementById('stat-open');
const statOverdue = document.getElementById('stat-overdue');
const statResolved = document.getElementById('stat-resolved');
const urgentCount = document.getElementById('urgent-count');
const urgentList = document.getElementById('urgent-list');

const profileName = document.getElementById('profile-name');
const profileInitial = document.getElementById('profile-initial');
const profileRole = document.getElementById('profile-role');
const roleAdminElements = document.querySelectorAll('.role-admin');
const signOut = document.getElementById('sign-out');

const menuToggle = document.getElementById('menu-toggle');
const sidebar = document.getElementById('sidebar');

const defaultComplaints = [
  {
    id: 1,
    title: 'Projector not working in Lab 3',
    status: 'Open',
    category: 'Hardware',
    department: 'Computer Science',
    date: '2025-06-01',
    technician: 'Unassigned'
  },
  {
    id: 2,
    title: 'MATLAB license expired',
    status: 'In Progress',
    category: 'Software',
    department: 'Electronics',
    date: '2025-05-28',
    technician: 'Ravi Technician'
  },
  {
    id: 3,
    title: 'WiFi not connecting in Block B',
    status: 'Resolved',
    category: 'Hardware',
    department: 'IT',
    date: '2025-05-20',
    technician: 'Suresh Kumar'
  },
  {
    id: 4,
    title: 'Library system down',
    status: 'Open',
    category: 'Software',
    department: 'Library',
    date: '2025-06-03',
    technician: 'Unassigned'
  },
  {
    id: 5,
    title: 'Broken chair in Room 204',
    status: 'Open',
    category: 'Hardware',
    department: 'Civil',
    date: '2025-06-04',
    technician: 'Unassigned'
  },
  {
    id: 6,
    title: 'AC not working in Seminar Hall',
    status: 'In Progress',
    category: 'Hardware',
    department: 'Mechanical',
    date: '2025-05-12',
    technician: 'Pooja Tech'
  }
];

const statusClass = {
  Open: 'open',
  'In Progress': 'progress',
  Resolved: 'resolved'
};

const user = JSON.parse(sessionStorage.getItem('campuscare-user') || 'null');
if (!user) {
  window.location.href = 'index.html';
}

if (user) {
  let complaints = JSON.parse(localStorage.getItem('campuscare-complaints') || 'null') || defaultComplaints;

function saveComplaints() {
  localStorage.setItem('campuscare-complaints', JSON.stringify(complaints));
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

function daysSince(dateString) {
  const today = new Date();
  const createdAt = new Date(dateString);
  return Math.floor((today - createdAt) / (1000 * 60 * 60 * 24));
}

function getFilteredComplaints() {
  const searchTerm = searchInput.value.trim().toLowerCase();
  const department = departmentFilter.value;

  return complaints.filter((complaint) => {
    const titleMatch = complaint.title.toLowerCase().includes(searchTerm);
    const departmentMatch = department === 'all' || complaint.department === department;
    return titleMatch && departmentMatch;
  });
}

function renderDepartmentFilter() {
  const selectedValue = departmentFilter.value;
  const departments = [...new Set(complaints.map((complaint) => complaint.department))].sort();

  departmentFilter.innerHTML = '<option value="all">All Departments</option>';
  departments.forEach((department) => {
    const option = document.createElement('option');
    option.value = department;
    option.textContent = department;
    departmentFilter.appendChild(option);
  });

  if ([...departmentFilter.options].some((option) => option.value === selectedValue)) {
    departmentFilter.value = selectedValue;
  }
}

function renderUrgentBanner() {
  const urgentComplaints = complaints
    .filter((complaint) => complaint.status !== 'Resolved' && daysSince(complaint.date) > 15)
    .sort((a, b) => daysSince(b.date) - daysSince(a.date));

  urgentCount.textContent = urgentComplaints.length;
  urgentList.innerHTML = '';

  if (urgentComplaints.length === 0) {
    urgentList.innerHTML = '<li><span>No overdue unresolved complaints.</span><span>0 days</span></li>';
    return;
  }

  urgentComplaints.forEach((complaint) => {
    const item = document.createElement('li');
    item.innerHTML = `<span>${complaint.title}</span><span>${daysSince(complaint.date)} days</span>`;
    urgentList.appendChild(item);
  });
}

function renderStats(filteredComplaints) {
  statTotal.textContent = filteredComplaints.length;
  statOpen.textContent = filteredComplaints.filter((complaint) => complaint.status === 'Open').length;
  statResolved.textContent = filteredComplaints.filter((complaint) => complaint.status === 'Resolved').length;
  statOverdue.textContent = filteredComplaints.filter(
    (complaint) => complaint.status !== 'Resolved' && daysSince(complaint.date) > 15
  ).length;
}

function renderComplaints() {
  const filteredComplaints = getFilteredComplaints();
  complaintGrid.innerHTML = '';
  emptyState.classList.toggle('hidden', filteredComplaints.length > 0);

  filteredComplaints.forEach((complaint) => {
    const card = document.createElement('article');
    card.className = 'complaint-card card-surface';
    card.innerHTML = `
      <div class="card-top">
        <h4>${complaint.title}</h4>
        <a class="status ${statusClass[complaint.status]}" href="update-status.html?id=${complaint.id}">${complaint.status}</a>
      </div>
      <div class="tags">
        <span class="tag">${complaint.category}</span>
        <span class="tag secondary">${complaint.department}</span>
      </div>
      <div class="meta">
        <span><i class="fa-regular fa-calendar"></i> ${formatDate(complaint.date)}</span>
        <span><i class="fa-regular fa-user"></i> ${complaint.technician || 'Unassigned'}</span>
      </div>
    `;

    complaintGrid.appendChild(card);
  });

  renderStats(filteredComplaints);
}

function setRoleUI() {
  const isAdmin = user.role === 'Admin';
  roleAdminElements.forEach((element) => element.classList.toggle('hidden', !isAdmin));

  profileName.textContent = user.name;
  profileInitial.textContent = user.name[0].toUpperCase();
  profileRole.textContent = user.role.toUpperCase();
  profileRole.classList.toggle('student', user.role === 'Student');
}

function renderDashboard() {
  setRoleUI();
  renderDepartmentFilter();
  renderUrgentBanner();
  renderComplaints();
}

searchInput.addEventListener('input', renderComplaints);
departmentFilter.addEventListener('change', renderComplaints);

menuToggle.addEventListener('click', () => {
  sidebar.classList.toggle('open');
});

signOut.addEventListener('click', () => {
  sessionStorage.removeItem('campuscare-user');
});

  saveComplaints();
  renderDashboard();
}
