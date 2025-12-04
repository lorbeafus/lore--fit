const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/authMiddleware');
const { requireAdmin } = require('../../middleware/roleMiddleware');
const User = require('../../models/User');
const bcrypt = require('bcryptjs');

// Aplicar protect y requireAdmin a todas las rutas
router.use(protect, requireAdmin);

// @route   GET /api/admin/users
// @desc    Obtener todos los usuarios
// @access  Admin/Developer
router.get('/', async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });

        res.json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener usuarios'
        });
    }
});

// @route   GET /api/admin/users/:id
// @desc    Obtener un usuario específico
// @access  Admin/Developer
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Error al obtener usuario:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener usuario'
        });
    }
});

// @route   PUT /api/admin/users/:id/role
// @desc    Cambiar rol de un usuario
// @access  Admin/Developer
router.put('/:id/role', async (req, res) => {
    try {
        const { role } = req.body;

        if (!['user', 'admin', 'developer'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Rol inválido. Debe ser: user, admin o developer'
            });
        }

        // Solo developers pueden crear otros developers
        if (role === 'developer' && req.user.role !== 'developer') {
            return res.status(403).json({
                success: false,
                message: 'Solo los developers pueden asignar el rol de developer'
            });
        }

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        user.role = role;
        await user.save();

        res.json({
            success: true,
            message: `Rol actualizado a ${role}`,
            data: {
                _id: user._id,
                nombre: user.nombre,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Error al cambiar rol:', error);
        res.status(500).json({
            success: false,
            message: 'Error al cambiar rol'
        });
    }
});

// @route   PUT /api/admin/users/:id/reset-password
// @desc    Resetear contraseña de un usuario
// @access  Admin/Developer
router.put('/:id/reset-password', async (req, res) => {
    try {
        const { newPassword } = req.body;

        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'La nueva contraseña debe tener al menos 6 caracteres'
            });
        }

        const user = await User.findById(req.params.id).select('+password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        user.password = newPassword;
        await user.save();

        res.json({
            success: true,
            message: 'Contraseña reseteada exitosamente'
        });
    } catch (error) {
        console.error('Error al resetear contraseña:', error);
        res.status(500).json({
            success: false,
            message: 'Error al resetear contraseña'
        });
    }
});

// @route   DELETE /api/admin/users/:id
// @desc    Eliminar un usuario
// @access  Admin/Developer
router.delete('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        // No permitir eliminar developers (solo otro developer puede)
        if (user.role === 'developer' && req.user.role !== 'developer') {
            return res.status(403).json({
                success: false,
                message: 'Solo los developers pueden eliminar otros developers'
            });
        }

        await user.deleteOne();

        res.json({
            success: true,
            message: 'Usuario eliminado exitosamente'
        });
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar usuario'
        });
    }
});

module.exports = router;
