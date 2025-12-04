const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Subscription = require('../models/Subscription');

// @route   GET /api/subscriptions/my-plan
// @desc    Obtener el plan actual del usuario
// @access  Private
router.get('/my-plan', protect, async (req, res) => {
    try {
        const subscription = await Subscription.findOne({
            user: req.user._id,
            status: 'active'
        }).sort({ createdAt: -1 });

        if (!subscription) {
            return res.json({
                success: true,
                data: null,
                message: 'No tienes un plan activo'
            });
        }

        res.json({
            success: true,
            data: subscription
        });

    } catch (error) {
        console.error('Error al obtener plan:', error);
        res.status(500).json({
            success: false,
            message: 'Error al cargar el plan'
        });
    }
});

// @route   POST /api/subscriptions/subscribe
// @desc    Contratar un nuevo plan
// @access  Private
router.post('/subscribe', protect, async (req, res) => {
    try {
        const { planType, planName, price, duration } = req.body;

        // Validar campos
        if (!planType || !planName || !price) {
            return res.status(400).json({
                success: false,
                message: 'Tipo de plan, nombre y precio son requeridos'
            });
        }

        // Calcular fecha de fin (por defecto 30 días)
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + (duration || 30));

        // Crear suscripción
        const subscription = await Subscription.create({
            user: req.user._id,
            planType,
            planName,
            price,
            startDate,
            endDate
        });

        res.status(201).json({
            success: true,
            data: subscription,
            message: 'Plan contratado exitosamente'
        });

    } catch (error) {
        console.error('Error al contratar plan:', error);
        res.status(500).json({
            success: false,
            message: 'Error al contratar el plan',
            error: error.message
        });
    }
});

// @route   PUT /api/subscriptions/cancel
// @desc    Cancelar el plan actual
// @access  Private
router.put('/cancel', protect, async (req, res) => {
    try {
        const subscription = await Subscription.findOne({
            user: req.user._id,
            status: 'active'
        });

        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: 'No tienes un plan activo para cancelar'
            });
        }

        subscription.status = 'cancelled';
        subscription.autoRenew = false;
        await subscription.save();

        res.json({
            success: true,
            message: 'Plan cancelado exitosamente'
        });

    } catch (error) {
        console.error('Error al cancelar plan:', error);
        res.status(500).json({
            success: false,
            message: 'Error al cancelar el plan'
        });
    }
});

module.exports = router;
