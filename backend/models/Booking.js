const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        required: [true, 'La fecha es requerida']
    },
    startTime: {
        type: String, // Formato: "HH:MM" (ej: "09:00")
        required: [true, 'La hora de inicio es requerida']
    },
    endTime: {
        type: String, // Formato: "HH:MM" (ej: "11:00")
        required: [true, 'La hora de fin es requerida']
    },
    duration: {
        type: Number, // Duración en horas
        required: true
    },
    status: {
        type: String,
        enum: ['confirmed', 'cancelled', 'completed', 'no_show'],
        default: 'confirmed'
    },
    notes: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Índices para búsquedas eficientes
bookingSchema.index({ user: 1, date: 1 });
bookingSchema.index({ date: 1, startTime: 1 });

// Validar que la fecha no sea en el pasado
bookingSchema.pre('save', function (next) {
    if (this.isNew) {
        const bookingDate = new Date(this.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (bookingDate < today) {
            next(new Error('No puedes reservar turnos en el pasado'));
        }
    }
    next();
});

// Método estático para verificar disponibilidad
bookingSchema.statics.isSlotAvailable = async function (date, startTime, maxCapacity = 20) {
    const bookingsCount = await this.countDocuments({
        date: date,
        startTime: startTime,
        status: 'confirmed'
    });

    return bookingsCount < maxCapacity;
};

// Método estático para obtener slots disponibles de un día
bookingSchema.statics.getAvailableSlots = async function (date, maxCapacity = 20) {
    // Horarios del gimnasio: 6:00 AM - 10:00 PM
    const slots = [];
    const hours = ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'];

    for (const startTime of hours) {
        const bookingsCount = await this.countDocuments({
            date: date,
            startTime: startTime,
            status: 'confirmed'
        });

        slots.push({
            startTime: startTime,
            available: bookingsCount < maxCapacity,
            spotsLeft: maxCapacity - bookingsCount
        });
    }

    return slots;
};

module.exports = mongoose.model('Booking', bookingSchema);
