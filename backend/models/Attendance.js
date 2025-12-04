const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    checkIn: {
        type: Date,
        required: true,
        default: Date.now
    },
    checkOut: {
        type: Date
    },
    duration: {
        type: Number, // Duración en minutos
        default: 0
    },
    date: {
        type: Date,
        required: true,
        default: function () {
            return new Date(this.checkIn).setHours(0, 0, 0, 0);
        }
    },
    notes: {
        type: String
    }
});

// Calcular duración automáticamente al hacer checkout
attendanceSchema.pre('save', function (next) {
    if (this.checkOut && this.checkIn) {
        const durationMs = this.checkOut - this.checkIn;
        this.duration = Math.floor(durationMs / (1000 * 60)); // Convertir a minutos
    }
    next();
});

// Índices para búsquedas eficientes
attendanceSchema.index({ user: 1, date: -1 });
attendanceSchema.index({ user: 1, checkIn: -1 });

// Método estático para obtener horas de la última semana
attendanceSchema.statics.getWeeklyHours = async function (userId) {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const attendances = await this.find({
        user: userId,
        checkIn: { $gte: oneWeekAgo },
        checkOut: { $exists: true }
    });

    const totalMinutes = attendances.reduce((sum, att) => sum + att.duration, 0);
    return {
        hours: Math.floor(totalMinutes / 60),
        minutes: totalMinutes % 60,
        totalMinutes: totalMinutes,
        sessions: attendances.length
    };
};

module.exports = mongoose.model('Attendance', attendanceSchema);
