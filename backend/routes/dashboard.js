const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Subscription = require('../models/Subscription');
const Payment = require('../models/Payment');
const Attendance = require('../models/Attendance');
const Booking = require('../models/Booking');

// @route   GET /api/dashboard
// @desc    Obtener todos los datos del dashboard del usuario
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const userId = req.user._id;

        // 1. Obtener suscripción activa
        const subscription = await Subscription.findOne({
            user: userId,
            status: 'active'
        }).sort({ createdAt: -1 });

        // 2. Obtener horas de gimnasio de la última semana
        const weeklyHours = await Attendance.getWeeklyHours(userId);

        // 3. Obtener próximas reservas
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const upcomingBookings = await Booking.find({
            user: userId,
            date: { $gte: today },
            status: 'confirmed'
        }).sort({ date: 1, startTime: 1 }).limit(5);

        // 4. Obtener último pago
        const lastPayment = await Payment.findOne({
            user: userId
        }).sort({ paymentDate: -1 });

        // 5. Verificar si hay pagos pendientes
        const pendingPayments = await Payment.countDocuments({
            user: userId,
            status: 'pending',
            dueDate: { $lt: new Date() }
        });

        res.json({
            success: true,
            data: {
                subscription: subscription || null,
                weeklyHours: weeklyHours,
                upcomingBookings: upcomingBookings,
                lastPayment: lastPayment,
                hasPendingPayments: pendingPayments > 0,
                paymentStatus: subscription ? subscription.paymentStatus : 'no_subscription'
            }
        });

    } catch (error) {
        console.error('Error al obtener datos del dashboard:', error);
        res.status(500).json({
            success: false,
            message: 'Error al cargar el dashboard',
            error: error.message
        });
    }
});

// @route   GET /api/dashboard/stats
// @desc    Obtener estadísticas adicionales
// @access  Private
router.get('/stats', protect, async (req, res) => {
    try {
        const userId = req.user._id;

        // Total de asistencias este mes
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const monthlyAttendances = await Attendance.countDocuments({
            user: userId,
            checkIn: { $gte: startOfMonth }
        });

        // Total de reservas activas
        const activeBookings = await Booking.countDocuments({
            user: userId,
            status: 'confirmed',
            date: { $gte: new Date() }
        });

        res.json({
            success: true,
            data: {
                monthlyAttendances,
                activeBookings
            }
        });

    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        res.status(500).json({
            success: false,
            message: 'Error al cargar estadísticas'
        });
    }
});

module.exports = router;
