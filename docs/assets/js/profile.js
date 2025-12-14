// ============================================
// Enhanced Profile Page JavaScript
// ============================================

// Note: API_URL and getToken are defined in user-nav.js

function removeToken() {
    localStorage.removeItem('authToken');
}

function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    if (errorDiv) {
        errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
        errorDiv.style.display = 'block';
        setTimeout(() => errorDiv.style.display = 'none', 5000);
    }
}

function showSuccess(message) {
    const successDiv = document.getElementById('successMessage');
    if (successDiv) {
        successDiv.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
        successDiv.style.display = 'block';
        setTimeout(() => successDiv.style.display = 'none', 3000);
    }
}

function hideMessages() {
    const errorDiv = document.getElementById('errorMessage');
    const successDiv = document.getElementById('successMessage');
    if (errorDiv) errorDiv.style.display = 'none';
    if (successDiv) successDiv.style.display = 'none';
}

function checkAuth() {
    const token = getToken();
    if (!token) {
        window.location.href = './login.html';
        return false;
    }
    return true;
}

// Load User Profile
async function loadUserProfile() {
    const token = getToken();
    if (!token) {
        window.location.href = './login.html';
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/me`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (response.ok && data.success) {
            displayUserProfile(data.data);
            loadUserPlan(data.data._id);
        } else {
            removeToken();
            window.location.href = './login.html';
        }
    } catch (error) {
        console.error('Error:', error);
        showError('Error al cargar el perfil');
    }
}

function displayUserProfile(user) {
    // Display mode
    document.getElementById('profileName').textContent = user.nombre;
    document.getElementById('profileEmail').textContent = user.email;
    document.getElementById('profileRole').textContent = user.role || 'user';
    document.getElementById('profileAltura').textContent = user.altura ? `${user.altura} cm` : 'No especificado';
    document.getElementById('profilePeso').textContent = user.peso ? `${user.peso} kg` : 'No especificado';
    document.getElementById('profileDireccion').textContent = user.direccion || 'No especificado';

    // Edit mode
    document.getElementById('editNombre').value = user.nombre;
    document.getElementById('editEmail').value = user.email;
    document.getElementById('editAltura').value = user.altura || '';
    document.getElementById('editPeso').value = user.peso || '';
    document.getElementById('editDireccion').value = user.direccion || '';

    // Profile photo
    const photoUrl = user.profilePhoto || '../assets/img/default-avatar.png';
    document.getElementById('profilePhoto').src = photoUrl;
    document.getElementById('currentPhoto').src = photoUrl;
}

async function loadUserPlan(userId) {
    try {
        const response = await fetch(`${API_URL}/subscriptions/my-plan`, {
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });

        const data = await response.json();

        if (data.success && data.data) {
            displayUserPlan(data.data);
        } else {
            document.getElementById('planInfo').innerHTML = '<p>No tienes un plan activo</p>';
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

function displayUserPlan(plan) {
    const planNames = { classic: 'Plan Classic', premium: 'Plan Premium', online: 'Plan Online' };
    const endDate = new Date(plan.endDate);
    const daysLeft = Math.ceil((endDate - new Date()) / (1000 * 60 * 60 * 24));

    document.getElementById('planInfo').innerHTML = `
        <div class="plan-details">
            <h3>${planNames[plan.planType] || plan.planName}</h3>
            <p><strong>Precio:</strong> $${plan.price.toLocaleString()}/mes</p>
            <p><strong>Estado:</strong> <span class="status-${plan.status}">${plan.status === 'active' ? 'Activo' : 'Inactivo'}</span></p>
            <p><strong>Días restantes:</strong> ${daysLeft} días</p>
            <button class="btn-secondary" onclick="alert('Función de upgrade próximamente')">Upgrade Plan</button>
        </div>
    `;
}

function toggleEditMode(showEdit) {
    const profileView = document.getElementById('profileView');
    const editView = document.getElementById('editView');

    if (showEdit) {
        profileView.style.display = 'none';
        editView.style.display = 'block';
    } else {
        profileView.style.display = 'block';
        editView.style.display = 'none';
    }

    hideMessages();
}

async function updateProfile(e) {
    e.preventDefault();
    hideMessages();

    const nombre = document.getElementById('editNombre').value.trim();
    const email = document.getElementById('editEmail').value.trim();
    const altura = document.getElementById('editAltura').value;
    const peso = document.getElementById('editPeso').value;
    const direccion = document.getElementById('editDireccion').value.trim();

    if (!nombre || !email) {
        showError('Nombre y email son requeridos');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/update`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nombre, email, altura, peso, direccion })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            showSuccess('Perfil actualizado exitosamente');
            setTimeout(() => {
                toggleEditMode(false);
                loadUserProfile();
            }, 1500);
        } else {
            showError(data.message || 'Error al actualizar perfil');
        }
    } catch (error) {
        console.error('Error:', error);
        showError('Error de conexión');
    }
}

// Photo upload
async function uploadPhoto() {
    const fileInput = document.getElementById('photoInput');
    const file = fileInput.files[0];

    if (!file) {
        showError('Por favor selecciona una imagen');
        return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
        showError('El archivo debe ser una imagen');
        return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
        showError('La imagen no debe superar 5MB');
        return;
    }

    const formData = new FormData();
    formData.append('photo', file);

    try {
        const response = await fetch(`${API_URL}/auth/upload-photo`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${getToken()}`
            },
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            showSuccess('Foto actualizada exitosamente');
            loadUserProfile();
        } else {
            showError(data.message || 'Error al subir foto');
        }
    } catch (error) {
        console.error('Error:', error);
        showError('Error de conexión');
    }
}

async function deletePhoto() {
    if (!confirm('¿Estás seguro de eliminar tu foto de perfil?')) return;

    try {
        const response = await fetch(`${API_URL}/auth/delete-photo`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });

        const data = await response.json();

        if (data.success) {
            showSuccess('Foto eliminada');
            loadUserProfile();
        } else {
            showError(data.message || 'Error al eliminar foto');
        }
    } catch (error) {
        console.error('Error:', error);
        showError('Error de conexión');
    }
}

function logout() {
    removeToken();
    window.location.href = './login.html';
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    if (!checkAuth()) return;

    loadUserProfile();

    document.getElementById('editProfileBtn')?.addEventListener('click', () => toggleEditMode(true));
    document.getElementById('cancelEditBtn')?.addEventListener('click', () => toggleEditMode(false));
    document.getElementById('updateProfileForm')?.addEventListener('submit', updateProfile);
    document.getElementById('uploadPhotoBtn')?.addEventListener('click', uploadPhoto);
    document.getElementById('deletePhotoBtn')?.addEventListener('click', deletePhoto);
    document.getElementById('logoutBtn')?.addEventListener('click', () => {
        if (confirm('¿Cerrar sesión?')) logout();
    });
});
