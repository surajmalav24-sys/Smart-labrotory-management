const user = JSON.parse(sessionStorage.getItem('campuscare-user') || 'null');
if (!user) {
  window.location.href = 'index.html';
}

if (user) {
  const complaintForm = document.getElementById('complaint-form');
  const complaints = JSON.parse(localStorage.getItem('campuscare-complaints') || '[]');

complaintForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const title = document.getElementById('complaint-title').value.trim();
  const category = document.getElementById('complaint-category').value;
  const department = document.getElementById('complaint-department').value.trim();
  const technician = document.getElementById('complaint-technician').value.trim() || 'Unassigned';

  complaints.unshift({
    id: Date.now(),
    title,
    status: 'Open',
    category,
    department,
    date: new Date().toISOString().slice(0, 10),
    technician
  });

    localStorage.setItem('campuscare-complaints', JSON.stringify(complaints));
    window.location.href = 'dashboard.html';
  });
}
