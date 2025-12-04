const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// Función para generar JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '30d'
    });
};

// @route   POST /api/auth/register
// @desc    Registrar nuevo usuario
// @access  Public
router.post('/register', async (req, res) => {
    try {
        const { nombre, email, password } = req.body;

        if (!nombre || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Por favor completa todos los campos'
            });
        }

        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({
                success: false,
                message: 'El email ya está registrado'
            });
        }

        const user = await User.create({
            nombre,
            email,
            password
        });

        if (user) {
            res.status(201).json({
                success: true,
                data: {
                    _id: user._id,
                    nombre: user.nombre,
                    email: user.email,
                    role: user.role,
                    token: generateToken(user._id)
                }
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Datos de usuario inválidos'
            });
        }
    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({
            success: false,
            message: 'Error al registrar usuario',
            error: error.message
        });
    }
});

// @route   POST /api/auth/login
// @desc    Iniciar sesión
// @access  Public
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Por favor ingresa email y contraseña'
            });
        }

        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }

        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }

        res.json({
            success: true,
            data: {
                _id: user._id,
                nombre: user.nombre,
                email: user.email,
                role: user.role,
                token: generateToken(user._id)
            }
        });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({
            success: false,
            message: 'Error al iniciar sesión',
            error: error.message
        });
    }
});

// @route   GET /api/auth/me
// @desc    Obtener usuario actual
// @access  Private
router.get('/me', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        res.json({
            success: true,
            data: {
                _id: user._id,
                nombre: user.nombre,
                email: user.email,
                role: user.role,
                altura: user.altura,
                peso: user.peso,
                direccion: user.direccion,
                profilePhoto: user.profilePhoto,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        console.error('Error al obtener usuario:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener información del usuario'
        });
    }
});

// @route   PUT /api/auth/update
// @desc    Actualizar perfil de usuario
// @access  Private
router.put('/update', protect, async (req, res) => {
    try {
        const { nombre, email, altura, peso, direccion } = req.body;

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        if (nombre) user.nombre = nombre;
        if (altura) user.altura = altura;
        if (peso) user.peso = peso;
        if (direccion) user.direccion = direccion;

        if (email && email !== user.email) {
            const emailExists = await User.findOne({ email });
            if (emailExists) {
                return res.status(400).json({
                    success: false,
                    message: 'El email ya está en uso'
                });
            }
            user.email = email;
        }

        await user.save();

        res.json({
            success: true,
            message: 'Perfil actualizado exitosamente',
            data: {
                _id: user._id,
                nombre: user.nombre,
                email: user.email,
                altura: user.altura,
                peso: user.peso,
                direccion: user.direccion,
                profilePhoto: user.profilePhoto,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Error al actualizar perfil:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar perfil'
        });
    }
});

// @route   DELETE /api/auth/delete-photo
// @desc    Eliminar foto de perfil
// @access  Private
router.delete('/delete-photo', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        if (user.profilePhoto) {
            const fs = require('fs');
            const path = require('path');
            const photoPath = path.join(__dirname, '..', user.profilePhoto);

            if (fs.existsSync(photoPath)) {
                fs.unlinkSync(photoPath);
            }
        }

        user.profilePhoto = null;
        await user.save();

        res.json({
            success: true,
            message: 'Foto de perfil eliminada'
        });
    } catch (error) {
        console.error('Error al eliminar foto:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar foto'
        });
    }
});

module.exports = router;
