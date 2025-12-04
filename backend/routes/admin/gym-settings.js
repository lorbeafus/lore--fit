const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/authMiddleware');
const { requireDeveloper } = require('../../middleware/roleMiddleware');
const GymSettings = require('../../models/GymSettings');

router.use(protect, requireDeveloper);

// @route   GET /api/admin/gym-settings
// @desc    Obtener configuración del gimnasio
// @access  Developer
router.get('/', async (req, res) => {
    try {
        const settings = await GymSettings.getSettings();

        res.json({
            success: true,
            data: settings
        });
    } catch (error) {
        console.error('Error al obtener configuración:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener configuración'
        });
    }
});

// @route   PUT /api/admin/gym-settings/hours
// @desc    Actualizar horarios del gimnasio
// @access  Developer
router.put('/hours', async (req, res) => {
    try {
        const { day, open, close, closed } = req.body;

        const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        if (!validDays.includes(day)) {
            return res.status(400).json({
                success: false,
                message: 'Día inválido'
            });
        }

        const settings = await GymSettings.getSettings();

        if (open) settings.hours[day].open = open;
        if (close) settings.hours[day].close = close;
        if (typeof closed === 'boolean') settings.hours[day].closed = closed;

        settings.updatedAt = Date.now();
        await settings.save();

        res.json({
            success: true,
            message: 'Horarios actualizados',
            data: settings
        });
    } catch (error) {
        console.error('Error al actualizar horarios:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar horarios'
        });
    }
});

// @route   POST /api/admin/gym-settings/holidays
// @desc    Agregar día festivo
// @access  Developer
router.post('/holidays', async (req, res) => {
    try {
        const { date, name, description } = req.body;

        if (!date || !name) {
            return res.status(400).json({
                success: false,
                message: 'Fecha y nombre son requeridos'
            });
        }

        const settings = await GymSettings.getSettings();

        settings.holidays.push({
            date: new Date(date),
            name,
            description
        });

        settings.updatedAt = Date.now();
        await settings.save();

        res.json({
            success: true,
            message: 'Día festivo agregado',
            data: settings
        });
    } catch (error) {
        console.error('Error al agregar día festivo:', error);
        res.status(500).json({
            success: false,
            message: 'Error al agregar día festivo'
        });
    }
});

// @route   DELETE /api/admin/gym-settings/holidays/:id
// @desc    Eliminar día festivo
// @access  Developer
router.delete('/holidays/:id', async (req, res) => {
    try {
        const settings = await GymSettings.getSettings();

        settings.holidays = settings.holidays.filter(
            holiday => holiday._id.toString() !== req.params.id
        );

        settings.updatedAt = Date.now();
        await settings.save();

        res.json({
            success: true,
            message: 'Día festivo eliminado',
            data: settings
        });
    } catch (error) {
        console.error('Error al eliminar día festivo:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar día festivo'
        });
    }
});

// @route   PUT /api/admin/gym-settings/slots
// @desc    Actualizar configuración de turnos
// @access  Developer
router.put('/slots', async (req, res) => {
    try {
        const { slotDuration, maxCapacityPerSlot, availableSlots } = req.body;

        const settings = await GymSettings.getSettings();

        if (slotDuration) settings.slotDuration = slotDuration;
        if (maxCapacityPerSlot) settings.maxCapacityPerSlot = maxCapacityPerSlot;
        if (availableSlots) settings.availableSlots = availableSlots;

        settings.updatedAt = Date.now();
        await settings.save();

        res.json({
            success: true,
            message: 'Configuración de turnos actualizada',
            data: settings
        });
    } catch (error) {
        console.error('Error al actualizar configuración:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar configuración'
        });
    }
});

module.exports = router;
