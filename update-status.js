const user = JSON.parse(sessionStorage.getItem('campuscare-user') || 'null');
if (!user) {
  window.location.href = 'index.html';
}

if (user) {
  const params = new URLSearchParams(window.location.search);
  const complaintId = Number(params.get('id'));
  const complaintTitle = document.getElementById('status-title');
  const statusForm = document.getElementById('status-form');
  const statusSelect = document.getElementById('complaint-status');

  const complaints = JSON.parse(localStorage.getItem('campuscare-complaints') || '[]');
  const complaint = complaints.find((item) => item.id === complaintId);

  if (!complaint) {
    complaintTitle.textContent = 'Complaint not found.';
    statusForm.classList.add('hidden');
  } else {
    complaintTitle.textContent = complaint.title;
    statusSelect.value = complaint.status;
  }

  statusForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!complaint) {
      return;
    }

    complaint.status = statusSelect.value;
    localStorage.setItem('campuscare-complaints', JSON.stringify(complaints));
    window.location.href = 'dashboard.html';
  });
}
