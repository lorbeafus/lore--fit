// ============================================
// Admin Panel JavaScript
// ============================================

// Check admin access
function checkAdminAccess() {
    const token = getToken();
    if (!token) {
        window.location.href = './login.html';
        return false;
    }
    return true;
}

// Load current user and check role
async function loadCurrentUser() {
    try {
        const response = await fetch(`${API_URL}/auth/me`, {
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });

        const data = await response.json();

        if (data.success) {
            const user = data.data;

            // Check if user is admin or developer
            if (user.role !== 'admin' && user.role !== 'developer') {
                alert('No tienes permisos para acceder a esta página');
                window.location.href = './dashboard.html';
                return null;
            }

            // Show settings tab only for developers
            if (user.role === 'developer') {
                document.getElementById('settingsTab').style.display = 'block';
            }

            return user;
        }
    } catch (error) {
        console.error('Error:', error);
        window.location.href = './login.html';
    }
}

// Tab switching
function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.dataset.tab;

            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            document.getElementById(`${tabId}-tab`).classList.add('active');

            // Load data for the tab
            if (tabId === 'users') loadUsers();
            if (tabId === 'subscriptions') loadSubscriptions();
            if (tabId === 'settings') loadGymSettings();
        });
    });
}

// Load all users
async function loadUsers() {
    const usersList = document.getElementById('usersList');
    usersList.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i></div>';

    try {
        const response = await fetch(`${API_URL}/admin/users`, {
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });

        const data = await response.json();

        if (data.success) {
            renderUsers(data.data);
        } else {
            usersList.innerHTML = '<p class="error-message">Error al cargar usuarios</p>';
        }
    } catch (error) {
        console.error('Error:', error);
        usersList.innerHTML = '<p class="error-message">Error de conexión</p>';
    }
}

function renderUsers(users) {
    const usersList = document.getElementById('usersList');

    if (users.length === 0) {
        usersList.innerHTML = '<p>No hay usuarios registrados</p>';
        return;
    }

    // Store users globally for the assign plan modal
    window.allUsers = users;

    const usersHTML = `
        <table class="admin-table">
            <thead>
                <tr>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Rol</th>
                    <th>Fecha Registro</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                ${users.map(user => `
                    <tr>
                        <td>${user.nombre}</td>
                        <td>${user.email}</td>
                        <td><span class="role-badge role-${user.role}">${user.role}</span></td>
                        <td>${new Date(user.createdAt).toLocaleDateString('es-ES')}</td>
                        <td>
                            <button class="btn-icon" onclick="editUser('${user._id}', '${user.nombre}', '${user.email}', '${user.role}')" title="Editar">
                                <i class="fas fa-edit"></i>
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    usersList.innerHTML = usersHTML;
}

function editUser(id, nombre, email, role) {
    document.getElementById('editUserId').value = id;
    document.getElementById('editUserName').value = nombre;
    document.getElementById('editUserEmail').value = email;
    document.getElementById('editUserRole').value = role;
    document.getElementById('editUserModal').style.display = 'flex';
}

async function saveUserRole() {
    const userId = document.getElementById('editUserId').value;
    const newRole = document.getElementById('editUserRole').value;

    try {
        const response = await fetch(`${API_URL}/admin/users/${userId}/role`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ role: newRole })
        });

        const data = await response.json();

        if (data.success) {
            alert('Rol actualizado exitosamente');
            closeModal('editUserModal');
            loadUsers();
        } else {
            alert(data.message || 'Error al actualizar rol');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error de conexión');
    }
}

async function resetUserPassword() {
    const userId = document.getElementById('editUserId').value;
    const newPassword = prompt('Ingresa la nueva contraseña (mínimo 6 caracteres):');

    if (!newPassword || newPassword.length < 6) {
        alert('La contraseña debe tener al menos 6 caracteres');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/admin/users/${userId}/reset-password`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ newPassword })
        });

        const data = await response.json();

        if (data.success) {
            alert('Contraseña reseteada exitosamente');
        } else {
            alert(data.message || 'Error al resetear contraseña');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error de conexión');
    }
}

async function deleteUser() {
    if (!confirm('¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.')) {
        return;
    }

    const userId = document.getElementById('editUserId').value;

    try {
        const response = await fetch(`${API_URL}/admin/users/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });

        const data = await response.json();

        if (data.success) {
            alert('Usuario eliminado exitosamente');
            closeModal('editUserModal');
            loadUsers();
        } else {
            alert(data.message || 'Error al eliminar usuario');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error de conexión');
    }
}

// Load subscriptions
async function loadSubscriptions() {
    const subsList = document.getElementById('subscriptionsList');
    subsList.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i></div>';

    try {
        const response = await fetch(`${API_URL}/admin/subscriptions`, {
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });

        const data = await response.json();

        if (data.success) {
            renderSubscriptions(data.data);
        } else {
            subsList.innerHTML = '<p class="error-message">Error al cargar planes</p>';
        }
    } catch (error) {
        console.error('Error:', error);
        subsList.innerHTML = '<p class="error-message">Error de conexión</p>';
    }
}

function renderSubscriptions(subscriptions) {
    const subsList = document.getElementById('subscriptionsList');

    if (subscriptions.length === 0) {
        subsList.innerHTML = '<p>No hay planes asignados</p>';
        return;
    }

    const subsHTML = `
        <table class="admin-table">
            <thead>
                <tr>
                    <th>Usuario</th>
                    <th>Plan</th>
                    <th>Precio</th>
                    <th>Estado</th>
                    <th>Pago</th>
                    <th>Vencimiento</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                ${subscriptions.map(sub => `
                    <tr>
                        <td>${sub.user ? sub.user.nombre : 'N/A'}</td>
                        <td>${sub.planName}</td>
                        <td>$${sub.price.toLocaleString()}</td>
                        <td><span class="status-badge status-${sub.status}">${sub.status}</span></td>
                        <td><span class="payment-badge payment-${sub.paymentStatus}">${sub.paymentStatus}</span></td>
                        <td>${new Date(sub.endDate).toLocaleDateString('es-ES')}</td>
                        <td>
                            <button class="btn-icon" onclick="changePaymentStatus('${sub._id}', '${sub.paymentStatus}')" title="Cambiar estado de pago">
                                <i class="fas fa-dollar-sign"></i>
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    subsList.innerHTML = subsHTML;
}

async function changePaymentStatus(subId, currentStatus) {
    const statuses = ['up_to_date', 'pending', 'overdue'];
    const statusNames = { up_to_date: 'Al día', pending: 'Pendiente', overdue: 'Vencido' };

    const newStatus = prompt(`Estado actual: ${statusNames[currentStatus]}\n\nNuevo estado:\n1. Al día (up_to_date)\n2. Pendiente (pending)\n3. Vencido (overdue)\n\nIngresa el estado:`);

    if (!statuses.includes(newStatus)) {
        alert('Estado inválido');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/admin/subscriptions/${subId}/payment-status`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ paymentStatus: newStatus })
        });

        const data = await response.json();

        if (data.success) {
            alert('Estado de pago actualizado');
            loadSubscriptions();
        } else {
            alert(data.message || 'Error al actualizar estado');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error de conexión');
    }
}

// Assign plan modal
document.getElementById('assignPlanBtn')?.addEventListener('click', () => {
    // Populate user dropdown
    const userSelect = document.getElementById('assignUserId');
    if (userSelect && window.allUsers) {
        userSelect.innerHTML = '<option value="">Selecciona un usuario</option>' +
            window.allUsers.map(user =>
                `<option value="${user._id}">${user.nombre} (${user.email})</option>`
            ).join('');
    }
    document.getElementById('assignPlanModal').style.display = 'flex';
});

async function assignPlan() {
    const userId = document.getElementById('assignUserId').value;
    const planType = document.getElementById('assignPlanType').value;
    const price = document.getElementById('assignPlanPrice').value;
    const duration = document.getElementById('assignPlanDuration').value;

    // Validation
    if (!userId) {
        alert('Por favor selecciona un usuario');
        return;
    }

    if (!price || !duration) {
        alert('Por favor completa todos los campos');
        return;
    }

    const planNames = { classic: 'Plan Classic', premium: 'Plan Premium', online: 'Plan Online' };

    try {
        const response = await fetch(`${API_URL}/admin/subscriptions/assign`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId,
                planType,
                planName: planNames[planType],
                price: parseFloat(price),
                duration: parseInt(duration)
            })
        });

        const data = await response.json();

        if (data.success) {
            alert('Plan asignado exitosamente');
            closeModal('assignPlanModal');
            loadSubscriptions();
        } else {
            alert(data.message || 'Error al asignar plan');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error de conexión');
    }
}

// Gym settings (developer only)
async function loadGymSettings() {
    // Implementation for gym settings
    document.getElementById('gymHours').innerHTML = '<p>Configuración de horarios disponible próximamente</p>';
    document.getElementById('holidaysList').innerHTML = '<p>Gestión de festivos disponible próximamente</p>';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    if (!checkAdminAccess()) return;

    const currentUser = await loadCurrentUser();
    if (!currentUser) return;

    initTabs();
    loadUsers();

    // Event listener for assign plan button
    const assignBtn = document.getElementById('assignPlanSubmitBtn');
    if (assignBtn) {
        assignBtn.addEventListener('click', assignPlan);
    }
});