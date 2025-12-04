const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Booking = require('../models/Booking');

// @route   GET /api/bookings/my-bookings
// @desc    Obtener todas las reservas del usuario
// @access  Private
router.get('/my-bookings', protect, async (req, res) => {
    try {
        const bookings = await Booking.find({
            user: req.user._id
        }).sort({ date: -1, startTime: -1 });

        res.json({
            success: true,
            data: bookings
        });

    } catch (error) {
        console.error('Error al obtener reservas:', error);
        res.status(500).json({
            success: false,
            message: 'Error al cargar reservas'
        });
    }
});

// @route   GET /api/bookings/upcoming
// @desc    Obtener próximas reservas del usuario
// @access  Private
router.get('/upcoming', protect, async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const bookings = await Booking.find({
            user: req.user._id,
            date: { $gte: today },
            status: 'confirmed'
        }).sort({ date: 1, startTime: 1 });

        res.json({
            success: true,
            data: bookings
        });

    } catch (error) {
        console.error('Error al obtener próximas reservas:', error);
        res.status(500).json({
            success: false,
            message: 'Error al cargar próximas reservas'
        });
    }
});

// @route   GET /api/bookings/available-slots
// @desc    Obtener turnos disponibles para una fecha
// @access  Private
router.get('/available-slots', protect, async (req, res) => {
    try {
        const { date } = req.query;

        if (!date) {
            return res.status(400).json({
                success: false,
                message: 'La fecha es requerida'
            });
        }

        const bookingDate = new Date(date);
        const slots = await Booking.getAvailableSlots(bookingDate);

        res.json({
            success: true,
            data: {
                date: bookingDate,
                slots: slots
            }
        });

    } catch (error) {
        console.error('Error al obtener slots disponibles:', error);
        res.status(500).json({
            success: false,
            message: 'Error al cargar turnos disponibles'
        });
    }
});

// @route   POST /api/bookings/create
// @desc    Crear una nueva reserva
// @access  Private
router.post('/create', protect, async (req, res) => {
    try {
        const { date, startTime, duration } = req.body;

        // Validar campos requeridos
        if (!date || !startTime || !duration) {
            return res.status(400).json({
                success: false,
                message: 'Fecha, hora de inicio y duración son requeridos'
            });
        }

        // Calcular hora de fin
        const [hours, minutes] = startTime.split(':');
        const endHour = parseInt(hours) + parseInt(duration);
        const endTime = `${endHour.toString().padStart(2, '0')}:${minutes}`;

        // Verificar disponibilidad
        const isAvailable = await Booking.isSlotAvailable(new Date(date), startTime);

        if (!isAvailable) {
            return res.status(400).json({
                success: false,
                message: 'Este turno ya no está disponible'
            });
        }

        // Verificar que el usuario no tenga otra reserva en el mismo horario
        const existingBooking = await Booking.findOne({
            user: req.user._id,
            date: new Date(date),
            startTime: startTime,
            status: 'confirmed'
        });

        if (existingBooking) {
            return res.status(400).json({
                success: false,
                message: 'Ya tienes una reserva para este horario'
            });
        }

        // Crear la reserva
        const booking = await Booking.create({
            user: req.user._id,
            date: new Date(date),
            startTime,
            endTime,
            duration: parseInt(duration)
        });

        res.status(201).json({
            success: true,
            data: booking,
            message: 'Reserva creada exitosamente'
        });

    } catch (error) {
        console.error('Error al crear reserva:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error al crear la reserva'
        });
    }
});

// @route   DELETE /api/bookings/:id
// @desc    Cancelar una reserva
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Reserva no encontrada'
            });
        }

        // Verificar que la reserva pertenece al usuario
        if (booking.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para cancelar esta reserva'
            });
        }

        // Verificar que la reserva no sea en el pasado
        const bookingDate = new Date(booking.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (bookingDate < today) {
            return res.status(400).json({
                success: false,
                message: 'No puedes cancelar reservas pasadas'
            });
        }

        booking.status = 'cancelled';
        await booking.save();

        res.json({
            success: true,
            message: 'Reserva cancelada exitosamente'
        });

    } catch (error) {
        console.error('Error al cancelar reserva:', error);
        res.status(500).json({
            success: false,
            message: 'Error al cancelar la reserva'
        });
    }
});

module.exports = router;
