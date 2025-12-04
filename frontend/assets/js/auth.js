// ============================================
// Authentication JavaScript
// ============================================

const API_URL = 'http://localhost:3000/api';

// Utility Functions
// ============================================

function showError(message, elementId = 'errorMessage') {
    const errorDiv = document.getElementById(elementId);
    if (errorDiv) {
        errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
        errorDiv.style.display = 'block';

        // Auto-hide after 5 seconds
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 5000);
    }
}

function showSuccess(message, elementId = 'successMessage') {
    const successDiv = document.getElementById(elementId);
    if (successDiv) {
        successDiv.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
        successDiv.style.display = 'block';
    }
}

function hideMessages() {
    const errorDiv = document.getElementById('errorMessage');
    const successDiv = document.getElementById('successMessage');

    if (errorDiv) errorDiv.style.display = 'none';
    if (successDiv) successDiv.style.display = 'none';
}

function setLoading(button, isLoading) {
    const btnText = button.querySelector('.btn-text');
    const btnLoader = button.querySelector('.btn-loader');

    if (isLoading) {
        btnText.style.display = 'none';
        btnLoader.style.display = 'inline-block';
        button.disabled = true;
    } else {
        btnText.style.display = 'inline-block';
        btnLoader.style.display = 'none';
        button.disabled = false;
    }
}

function saveToken(token) {
    localStorage.setItem('authToken', token);
}

function getToken() {
    return localStorage.getItem('authToken');
}

function removeToken() {
    localStorage.removeItem('authToken');
}

// Password Toggle Functionality
// ============================================

function initPasswordToggles() {
    const toggleButtons = document.querySelectorAll('.toggle-password');

    toggleButtons.forEach(button => {
        button.addEventListener('click', function () {
            const wrapper = this.closest('.password-input-wrapper');
            const input = wrapper.querySelector('input');
            const icon = this.querySelector('i');

            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });
}

// Login Form Handler
// ============================================

function initLoginForm() {
    const loginForm = document.getElementById('loginForm');

    if (!loginForm) return;

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideMessages();

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const loginBtn = document.getElementById('loginBtn');

        // Validación básica
        if (!email || !password) {
            showError('Por favor completa todos los campos');
            return;
        }

        try {
            setLoading(loginBtn, true);

            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                saveToken(data.data.token);
                showSuccess('¡Inicio de sesión exitoso! Redirigiendo...');

                setTimeout(() => {
                    window.location.href = './dashboard.html';
                }, 1500);
            } else {
                showError(data.message || 'Error al iniciar sesión');
                setLoading(loginBtn, false);
            }
        } catch (error) {
            console.error('Error:', error);
            showError('Error de conexión. Por favor intenta de nuevo.');
            setLoading(loginBtn, false);
        }
    });
}

// Register Form Handler
// ============================================

function initRegisterForm() {
    const registerForm = document.getElementById('registerForm');

    if (!registerForm) return;

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideMessages();

        const nombre = document.getElementById('nombre').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const registerBtn = document.getElementById('registerBtn');

        // Validaciones
        if (!nombre || !email || !password || !confirmPassword) {
            showError('Por favor completa todos los campos');
            return;
        }

        if (password.length < 6) {
            showError('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        if (password !== confirmPassword) {
            showError('Las contraseñas no coinciden');
            return;
        }

        try {
            setLoading(registerBtn, true);

            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ nombre, email, password })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                saveToken(data.data.token);
                showSuccess('¡Registro exitoso! Redirigiendo...');

                setTimeout(() => {
                    window.location.href = './dashboard.html';
                }, 1500);
            } else {
                showError(data.message || 'Error al registrar usuario');
                setLoading(registerBtn, false);
            }
        } catch (error) {
            console.error('Error:', error);
            showError('Error de conexión. Por favor intenta de nuevo.');
            setLoading(registerBtn, false);
        }
    });
}

// Initialize on page load
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initPasswordToggles();
    initLoginForm();
    initRegisterForm();
});
