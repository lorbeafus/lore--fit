// ============================================
// User Display in Navigation
// ============================================

const API_URL = 'http://localhost:3000/api';

// Get token from localStorage
function getToken() {
    return localStorage.getItem('authToken');
}

// Load and display user info in navigation
async function loadUserInNav() {
    const userDisplay = document.getElementById('userDisplay');

    if (!userDisplay) return;

    const token = getToken();

    if (!token) {
        // Usuario no logueado - mostrar enlaces de login/registro
        userDisplay.innerHTML = `
            <div class="nav-auth-links">
                <a href="/pages/login.html" class="nav-auth-link">
                    <i class="fas fa-sign-in-alt"></i>
                    <span>Iniciar Sesión</span>
                </a>
            </div>
        `;
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/me`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (response.ok && data.success) {
            // Usuario logueado - mostrar icono y nombre
            const user = data.data;
            const adminLink = (user.role === 'admin' || user.role === 'developer')
                ? `<a href="/pages/admin.html" class="nav-user-link">
                    <i class="fas fa-cog"></i>
                    <span>Admin</span>
                </a>`
                : '';

            userDisplay.innerHTML = `
                <div class="nav-user-info">
                    ${adminLink}
                    <a href="/pages/dashboard.html" class="nav-user-link">
                        <i class="fas fa-tachometer-alt"></i>
                        <span>Dashboard</span>
                    </a>
                    <a href="/pages/profile.html" class="nav-user-link">
                        <i class="fas fa-user-circle"></i>
                        <span class="nav-user-name">${user.nombre}</span>
                    </a>
                </div>
            `;
        } else {
            // Token inválido - limpiar y mostrar login
            localStorage.removeItem('authToken');
            userDisplay.innerHTML = `
                <div class="nav-auth-links">
                    <a href="/pages/login.html" class="nav-auth-link">
                        <i class="fas fa-sign-in-alt"></i>
                        <span>Iniciar Sesión</span>
                    </a>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error al cargar usuario:', error);
        // En caso de error, mostrar login
        userDisplay.innerHTML = `
            <div class="nav-auth-links">
                <a href="/pages/login.html" class="nav-auth-link">
                    <i class="fas fa-sign-in-alt"></i>
                    <span>Iniciar Sesión</span>
                </a>
            </div>
        `;
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadUserInNav();
});
