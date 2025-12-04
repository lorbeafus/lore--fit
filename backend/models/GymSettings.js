const mongoose = require('mongoose');

const gymSettingsSchema = new mongoose.Schema({
    // Horarios del gimnasio por día de la semana
    hours: {
        monday: { open: { type: String, default: '06:00' }, close: { type: String, default: '22:00' }, closed: { type: Boolean, default: false } },
        tuesday: { open: { type: String, default: '06:00' }, close: { type: String, default: '22:00' }, closed: { type: Boolean, default: false } },
        wednesday: { open: { type: String, default: '06:00' }, close: { type: String, default: '22:00' }, closed: { type: Boolean, default: false } },
        thursday: { open: { type: String, default: '06:00' }, close: { type: String, default: '22:00' }, closed: { type: Boolean, default: false } },
        friday: { open: { type: String, default: '06:00' }, close: { type: String, default: '22:00' }, closed: { type: Boolean, default: false } },
        saturday: { open: { type: String, default: '08:00' }, close: { type: String, default: '20:00' }, closed: { type: Boolean, default: false } },
        sunday: { open: { type: String, default: '08:00' }, close: { type: String, default: '14:00' }, closed: { type: Boolean, default: false } }
    },

    // Días festivos (gimnasio cerrado)
    holidays: [{
        date: {
            type: Date,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        description: String
    }],

    // Configuración de turnos
    slotDuration: {
        type: Number,
        default: 2, // Duración en horas
        min: 1,
        max: 4
    },

    maxCapacityPerSlot: {
        type: Number,
        default: 20,
        min: 1,
        max: 100
    },

    // Horarios de turnos disponibles
    availableSlots: {
        type: [String],
        default: ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00']
    },

    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Método para verificar si el gym está abierto en una fecha/hora específica
gymSettingsSchema.methods.isOpen = function (date) {
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = dayNames[date.getDay()];
    const dayConfig = this.hours[dayName];

    if (dayConfig.closed) return false;

    // Verificar si es día festivo
    const dateStr = date.toISOString().split('T')[0];
    const isHoliday = this.holidays.some(holiday => {
        const holidayStr = new Date(holiday.date).toISOString().split('T')[0];
        return holidayStr === dateStr;
    });

    return !isHoliday;
};

// Singleton pattern - solo debe haber una configuración
gymSettingsSchema.statics.getSettings = async function () {
    let settings = await this.findOne();
    if (!settings) {
        settings = await this.create({});
    }
    return settings;
};

module.exports = mongoose.model('GymSettings', gymSettingsSchema);
