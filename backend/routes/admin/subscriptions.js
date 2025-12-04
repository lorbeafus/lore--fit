const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/authMiddleware');
const { requireAdmin } = require('../../middleware/roleMiddleware');
const Subscription = require('../../models/Subscription');
const User = require('../../models/User');

router.use(protect, requireAdmin);

// @route   POST /api/admin/subscriptions/assign
// @desc    Asignar plan a un usuario
// @access  Admin/Developer
router.post('/assign', async (req, res) => {
    try {
        const { userId, planType, planName, price, duration } = req.body;

        console.log('Assign plan request:', { userId, planType, planName, price, duration });

        if (!userId || !planType || !planName || !price) {
            return res.status(400).json({
                success: false,
                message: 'Todos los campos son requeridos'
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + (duration || 30));

        // Cancel any existing active subscriptions for this user
        await Subscription.updateMany(
            { user: userId, status: 'active' },
            { status: 'inactive' }
        );

        const subscription = await Subscription.create({
            user: userId,
            planType,
            planName,
            price,
            startDate,
            endDate,
            status: 'active',
            paymentStatus: 'up_to_date',
            autoRenew: false
        });

        console.log('Subscription created:', subscription);

        res.status(201).json({
            success: true,
            message: 'Plan asignado exitosamente',
            data: subscription
        });
    } catch (error) {
        console.error('Error al asignar plan:', error);
        res.status(500).json({
            success: false,
            message: 'Error al asignar plan: ' + error.message
        });
    }
});

// @route   PUT /api/admin/subscriptions/:id
// @desc    Modificar plan de un usuario
// @access  Admin/Developer
router.put('/:id', async (req, res) => {
    try {
        const { planType, planName, price, endDate, status } = req.body;

        const subscription = await Subscription.findById(req.params.id);

        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: 'Suscripción no encontrada'
            });
        }

        if (planType) subscription.planType = planType;
        if (planName) subscription.planName = planName;
        if (price) subscription.price = price;
        if (endDate) subscription.endDate = new Date(endDate);
        if (status) subscription.status = status;

        await subscription.save();

        res.json({
            success: true,
            message: 'Plan actualizado exitosamente',
            data: subscription
        });
    } catch (error) {
        console.error('Error al actualizar plan:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar plan'
        });
    }
});

// @route   PUT /api/admin/subscriptions/:id/payment-status
// @desc    Cambiar estado de pago
// @access  Admin/Developer
router.put('/:id/payment-status', async (req, res) => {
    try {
        const { paymentStatus } = req.body;

        if (!['up_to_date', 'pending', 'overdue'].includes(paymentStatus)) {
            return res.status(400).json({
                success: false,
                message: 'Estado de pago inválido'
            });
        }

        const subscription = await Subscription.findById(req.params.id);

        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: 'Suscripción no encontrada'
            });
        }

        subscription.paymentStatus = paymentStatus;
        await subscription.save();

        res.json({
            success: true,
            message: 'Estado de pago actualizado',
            data: subscription
        });
    } catch (error) {
        console.error('Error al actualizar estado de pago:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar estado de pago'
        });
    }
});

// @route   GET /api/admin/subscriptions
// @desc    Obtener todas las suscripciones
// @access  Admin/Developer
router.get('/', async (req, res) => {
    try {
        const subscriptions = await Subscription.find()
            .populate('user', 'nombre email')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: subscriptions.length,
            data: subscriptions
        });
    } catch (error) {
        console.error('Error al obtener suscripciones:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener suscripciones'
        });
    }
});

module.exports = router;
