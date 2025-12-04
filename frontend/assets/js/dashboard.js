// ============================================
// Dashboard JavaScript
// ============================================

// Note: API_URL and getToken are defined in user-nav.js

// Check authentication
function checkAuth() {
    const token = getToken();
    if (!token) {
        window.location.href = './login.html';
        return false;
    }
    return true;
}

// Load dashboard data
async function loadDashboard() {
    if (!checkAuth()) return;

    const token = getToken();

    try {
        const response = await fetch(`${API_URL}/dashboard`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (response.ok && data.success) {
            renderDashboard(data.data);
        } else {
            showError('Error al cargar el dashboard');
        }
    } catch (error) {
        console.error('Error:', error);
        showError('Error de conexión');
    }
}

// Render dashboard components
function renderDashboard(data) {
    // Welcome message
    document.getElementById('welcomeMessage').textContent = `Bienvenido a tu dashboard`;

    // Render plan
    renderPlan(data.subscription);

    // Render payment status
    renderPaymentStatus(data.paymentStatus, data.hasPendingPayments);

    // Render weekly hours
    renderWeeklyHours(data.weeklyHours);

    // Render upcoming bookings
    renderUpcomingBookings(data.upcomingBookings);

    // Initialize calendar
    initCalendar();
}

// Render plan card
function renderPlan(subscription) {
    const planContent = document.getElementById('planContent');

    if (!subscription) {
        planContent.innerHTML = `
            <div class="no-plan">
                <i class="fas fa-exclamation-circle"></i>
                <p>No tienes un plan activo</p>
                <a href="./planes.html" class="btn-primary">Ver Planes</a>
            </div>
        `;
        return;
    }

    const planNames = {
        classic: 'Plan Classic',
        premium: 'Plan Premium',
        online: 'Plan Online'
    };

    const endDate = new Date(subscription.endDate);
    const daysLeft = Math.ceil((endDate - new Date()) / (1000 * 60 * 60 * 24));

    planContent.innerHTML = `
        <div class="plan-info">
            <h3>${planNames[subscription.planType] || subscription.planName}</h3>
            <div class="plan-details">
                <div class="plan-detail">
                    <i class="fas fa-dollar-sign"></i>
                    <span>$${subscription.price.toLocaleString()}/mes</span>
                </div>
                <div class="plan-detail">
                    <i class="fas fa-calendar"></i>
                    <span>${daysLeft} días restantes</span>
                </div>
                <div class="plan-detail">
                    <i class="fas fa-check-circle"></i>
                    <span class="status-${subscription.status}">${subscription.status === 'active' ? 'Activo' : 'Inactivo'}</span>
                </div>
            </div>
        </div>
    `;
}

// Render payment status
function renderPaymentStatus(paymentStatus, hasPending) {
    const paymentContent = document.getElementById('paymentContent');

    const statusConfig = {
        up_to_date: {
            icon: 'fa-check-circle',
            text: 'Al día',
            class: 'status-success',
            color: '#4caf50'
        },
        pending: {
            icon: 'fa-clock',
            text: 'Pago pendiente',
            class: 'status-warning',
            color: '#ff9800'
        },
        overdue: {
            icon: 'fa-exclamation-triangle',
            text: 'Pago vencido',
            class: 'status-danger',
            color: '#f44336'
        },
        no_subscription: {
            icon: 'fa-info-circle',
            text: 'Sin plan activo',
            class: 'status-info',
            color: '#2196f3'
        }
    };

    const config = statusConfig[paymentStatus] || statusConfig.no_subscription;

    paymentContent.innerHTML = `
        <div class="payment-status ${config.class}">
            <i class="fas ${config.icon}" style="color: ${config.color}"></i>
            <h3>${config.text}</h3>
            ${hasPending ? '<p class="warning-text">Tienes pagos pendientes</p>' : ''}
        </div>
    `;
}

// Render weekly hours
function renderWeeklyHours(weeklyHours) {
    const hoursContent = document.getElementById('hoursContent');

    if (!weeklyHours || weeklyHours.totalMinutes === 0) {
        hoursContent.innerHTML = `
            <div class="no-data">
                <i class="fas fa-chart-bar"></i>
                <p>No hay registros esta semana</p>
            </div>
        `;
        return;
    }

    hoursContent.innerHTML = `
        <div class="hours-stats">
            <div class="hours-display">
                <div class="hours-number">${weeklyHours.hours}</div>
                <div class="hours-label">horas</div>
            </div>
            <div class="hours-details">
                <p><i class="fas fa-clock"></i> ${weeklyHours.totalMinutes} minutos totales</p>
                <p><i class="fas fa-calendar-check"></i> ${weeklyHours.sessions} sesiones</p>
            </div>
        </div>
    `;
}

// Render upcoming bookings
function renderUpcomingBookings(bookings) {
    const bookingsContent = document.getElementById('bookingsContent');

    if (!bookings || bookings.length === 0) {
        bookingsContent.innerHTML = `
            <div class="no-data">
                <i class="fas fa-calendar-times"></i>
                <p>No tienes reservas próximas</p>
            </div>
        `;
        return;
    }

    const bookingsList = bookings.map(booking => {
        const date = new Date(booking.date);
        const dateStr = date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });

        return `
            <div class="booking-item">
                <div class="booking-date">
                    <i class="fas fa-calendar"></i>
                    <span>${dateStr}</span>
                </div>
                <div class="booking-time">
                    <i class="fas fa-clock"></i>
                    <span>${booking.startTime} - ${booking.endTime}</span>
                </div>
                <button class="btn-cancel-booking" data-id="${booking._id}">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    }).join('');

    bookingsContent.innerHTML = `<div class="bookings-list">${bookingsList}</div>`;

    // Add cancel event listeners
    document.querySelectorAll('.btn-cancel-booking').forEach(btn => {
        btn.addEventListener('click', () => cancelBooking(btn.dataset.id));
    });
}

// Calendar functionality
let currentDate = new Date();

function initCalendar() {
    renderCalendar();

    document.getElementById('prevMonth').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    document.getElementById('nextMonth').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });

    document.getElementById('closeModal').addEventListener('click', () => {
        document.getElementById('timeSlotsModal').style.display = 'none';
    });
}

function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    document.getElementById('currentMonth').textContent =
        new Date(year, month).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let calendarHTML = '<div class="calendar-days">';
    ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].forEach(day => {
        calendarHTML += `<div class="calendar-day-header">${day}</div>`;
    });
    calendarHTML += '</div><div class="calendar-dates">';

    // Empty cells
    for (let i = 0; i < firstDay; i++) {
        calendarHTML += '<div class="calendar-date empty"></div>';
    }

    // Days
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const isPast = date < today;
        const isToday = date.getTime() === today.getTime();

        calendarHTML += `
            <div class="calendar-date ${isPast ? 'past' : ''} ${isToday ? 'today' : ''}" 
                 data-date="${date.toISOString()}"
                 ${!isPast ? 'onclick="showTimeSlots(this.dataset.date)"' : ''}>
                ${day}
            </div>
        `;
    }

    calendarHTML += '</div>';
    document.getElementById('calendar').innerHTML = calendarHTML;
}

// Show available time slots
async function showTimeSlots(dateStr) {
    const date = new Date(dateStr);
    const token = getToken();

    try {
        const response = await fetch(`${API_URL}/bookings/available-slots?date=${dateStr}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (data.success) {
            renderTimeSlots(data.data.slots, dateStr);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

function renderTimeSlots(slots, dateStr) {
    const date = new Date(dateStr);
    document.getElementById('selectedDateTitle').textContent =
        date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });

    const slotsHTML = slots.map(slot => `
        <button class="time-slot ${!slot.available ? 'unavailable' : ''}" 
                ${slot.available ? `onclick="bookSlot('${dateStr}', '${slot.startTime}')"` : 'disabled'}>
            <i class="fas fa-clock"></i>
            <span>${slot.startTime}</span>
            <small>${slot.available ? `${slot.spotsLeft} lugares` : 'Completo'}</small>
        </button>
    `).join('');

    document.getElementById('timeSlotsList').innerHTML = slotsHTML;
    document.getElementById('timeSlotsModal').style.display = 'flex';
}

// Book a slot
async function bookSlot(date, startTime) {
    const token = getToken();

    try {
        const response = await fetch(`${API_URL}/bookings/create`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                date,
                startTime,
                duration: 2
            })
        });

        const data = await response.json();

        if (data.success) {
            alert('¡Reserva creada exitosamente!');
            document.getElementById('timeSlotsModal').style.display = 'none';
            loadDashboard();
        } else {
            alert(data.message || 'Error al crear la reserva');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error de conexión');
    }
}

// Cancel booking
async function cancelBooking(bookingId) {
    if (!confirm('¿Estás seguro de cancelar esta reserva?')) return;

    const token = getToken();

    try {
        const response = await fetch(`${API_URL}/bookings/${bookingId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (data.success) {
            alert('Reserva cancelada');
            loadDashboard();
        } else {
            alert(data.message || 'Error al cancelar');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

function showError(message) {
    console.error(message);
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    loadDashboard();
});
