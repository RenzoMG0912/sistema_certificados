// Archivo: assets/js/student/auth.js
(function() {
  // Dark mode toggle
  (() => {
    const html = document.documentElement;
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') html.classList.add('dark');
  })();

  window.addEventListener('DOMContentLoaded', () => {
    document.body.style.opacity = '1';
    
    const toggle = document.getElementById('theme-toggle');
    const html = document.documentElement;
    
    if (toggle) {
      toggle.addEventListener('click', () => {
        const now = html.classList.contains('dark');
        html.classList.toggle('dark', !now);
        localStorage.setItem('theme', now ? 'light' : 'dark');
        const icon = toggle.querySelector('.material-symbols-outlined');
        if (icon) icon.textContent = now ? 'dark_mode' : 'light_mode';
        toggle.title = now ? 'Modo oscuro' : 'Modo claro';
      });
    }

    // Check if already logged in
    if (localStorage.getItem('student_token')) {
      window.location.href = '/student/dashboard.html';
      return;
    }

    // Handle back link
    const backLink = document.getElementById('back-link');
    if (backLink) {
      backLink.addEventListener('click', (e) => {
        e.preventDefault();
        document.body.style.opacity = '0';
        setTimeout(() => {
          window.location.href = backLink.getAttribute('href');
        }, 350);
      });
    }

    // Password toggle
    const passwordInput = document.getElementById('password');
    const togglePassword = document.getElementById('toggle-password');
    if (togglePassword && passwordInput) {
      togglePassword.addEventListener('click', () => {
        const isVisible = passwordInput.type === 'text';
        passwordInput.type = isVisible ? 'password' : 'text';
        const icon = togglePassword.querySelector('.material-symbols-outlined');
        if (icon) icon.textContent = isVisible ? 'visibility' : 'visibility_off';
        passwordInput.focus();
      });
    }

    // Login form
    const form = document.getElementById('login-form');
    const alertBox = document.getElementById('login-alert');
    const alertMsg = document.getElementById('alert-msg');
    const submitBtn = document.getElementById('submit-btn');
    const btnText = document.getElementById('btn-text');
    const btnSpinner = document.getElementById('btn-spinner');

    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        alertBox.style.display = 'none';
        submitBtn.disabled = true;
        btnText.style.display = 'none';
        btnSpinner.style.display = 'inline-block';

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        try {
          const response = await fetch('/api/student/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
          });

          const data = await response.json();

          if (response.ok && data.token) {
            localStorage.setItem('student_token', data.token);
            localStorage.setItem('student_user', JSON.stringify(data.estudiante || { email }));
            
            alertBox.className = 'alert alert-success';
            alertBox.innerHTML = `<span class="material-symbols-outlined text-[18px]">check_circle</span><span>Acceso autorizado. Redirigiendo...</span>`;
            alertBox.style.display = 'flex';

            setTimeout(() => {
              document.body.style.opacity = '0';
              setTimeout(() => {
                window.location.href = '/student/dashboard.html';
              }, 350);
            }, 1000);
          } else {
            throw new Error(data.message || 'Credenciales incorrectas');
          }
        } catch (err) {
          alertMsg.textContent = err.message;
          alertBox.className = 'alert alert-danger';
          alertBox.innerHTML = `<span class="material-symbols-outlined text-[18px]">error</span><span>${err.message}</span>`;
          alertBox.style.display = 'flex';
          
          submitBtn.disabled = false;
          btnText.style.display = 'inline';
          btnSpinner.style.display = 'none';
        }
      });
    }
  });
})();
