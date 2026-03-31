const loginForm = document.getElementById('login-form');
const passwordInput = document.getElementById('password');
const togglePasswordBtn = document.getElementById('toggle-password');
const loginError = document.getElementById('login-error');

const credentials = [
  { email: 'admin@mmit.edu.in', password: 'admin123', role: 'Admin', name: 'Admin User' },
  { email: 'tech@mmit.edu.in', password: 'tech123', role: 'Tech', name: 'Tech User' },
  { email: 'om.wadekar24@mmit.edu.in', password: 'student123', role: 'Student', name: 'Student User' }
];

loginForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const email = document.getElementById('email').value.trim().toLowerCase();
  const password = passwordInput.value;
  const user = credentials.find((cred) => cred.email === email && cred.password === password);

  if (!user) {
    loginError.textContent = 'Invalid credentials. Use one of the demo accounts.';
    return;
  }

  sessionStorage.setItem('campuscare-user', JSON.stringify(user));
  window.location.href = 'dashboard.html';
});

togglePasswordBtn.addEventListener('click', () => {
  const isPassword = passwordInput.type === 'password';
  passwordInput.type = isPassword ? 'text' : 'password';
  togglePasswordBtn.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
  togglePasswordBtn.innerHTML = isPassword
    ? '<i class="fa-regular fa-eye-slash"></i>'
    : '<i class="fa-regular fa-eye"></i>';
});
