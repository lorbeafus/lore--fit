// Importar dependencias
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const { Vexor } = require('vexor');

// Importar rutas
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const bookingsRoutes = require('./routes/bookings');
const subscriptionsRoutes = require('./routes/subscriptions');
const adminUsersRoutes = require('./routes/admin/users');
const adminSubscriptionsRoutes = require('./routes/admin/subscriptions');
const adminGymSettingsRoutes = require('./routes/admin/gym-settings');

// Importar configuración de multer
const upload = require('./config/multer');
const User = require('./models/User');
const { protect } = require('./middleware/authMiddleware');

// Crear aplicación Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para parsear JSON
app.use(express.json());

// Configurar CORS
app.use(cors({
    origin: process.env.BASE_URL || `http://localhost:${PORT}`,
    credentials: true
}));

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('✅ Conectado a MongoDB');
    })
    .catch((error) => {
        console.error('❌ Error al conectar a MongoDB:', error.message);
        console.error('⚠️  Verifica tu MONGODB_URI en el archivo .env');
    });

// Servir archivos estáticos desde el directorio frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Servir archivos de uploads (fotos de perfil)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ruta especial para subir foto de perfil (con multer)
app.post('/api/auth/upload-photo', protect, upload.single('photo'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No se ha subido ningún archivo'
            });
        }

        const user = await User.findById(req.user._id);

        // Eliminar foto anterior si existe
        if (user.profilePhoto) {
            const fs = require('fs');
            const oldPhotoPath = path.join(__dirname, user.profilePhoto);
            if (fs.existsSync(oldPhotoPath)) {
                fs.unlinkSync(oldPhotoPath);
            }
        }

        // Guardar ruta relativa de la nueva foto
        user.profilePhoto = `/uploads/profiles/${req.file.filename}`;
        await user.save();

        res.json({
            success: true,
            message: 'Foto subida exitosamente',
            data: {
                profilePhoto: user.profilePhoto
            }
        });
    } catch (error) {
        console.error('Error al subir foto:', error);
        res.status(500).json({
            success: false,
            message: 'Error al subir foto'
        });
    }
});

// Rutas de API
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/subscriptions', subscriptionsRoutes);
app.use('/api/admin/users', adminUsersRoutes);
app.use('/api/admin/subscriptions', adminSubscriptionsRoutes);
app.use('/api/admin/gym-settings', adminGymSettingsRoutes);

// Inicializar Vexor con configuración de MercadoPago
const vexor = Vexor.init({
    openSource: {
        platforms: {
            mercadopago: {
                access_token: process.env.MERCADOPAGO_ACCESS_TOKEN,
                sandbox: process.env.MERCADOPAGO_SANDBOX === 'true'
            }
        }
    }
});

// Definición de planes disponibles
const PLANS = {
    classic: {
        title: 'Plan Classic - Fauget Fitness',
        description: 'Acceso al gimnasio 3 veces por semana con entrenamientos personalizados',
        unit_price: 30000,
        quantity: 1
    },
    online: {
        title: 'Plan Online - Fauget Fitness',
        description: 'Rutinas personalizadas online con seguimiento nutricional',
        unit_price: 50000,
        quantity: 1
    },
    premium: {
        title: 'Plan Premium - Fauget Fitness',
        description: 'Acceso ilimitado con entrenador personal y nutricionista',
        unit_price: 50000,
        quantity: 1
    }
};

// Endpoint para crear checkout
app.post('/api/create-checkout', async (req, res) => {
    try {
        const { planType } = req.body;

        // Validar que el plan existe
        if (!PLANS[planType]) {
            return res.status(400).json({
                error: 'Plan no válido',
                message: 'El tipo de plan especificado no existe'
            });
        }

        const plan = PLANS[planType];
        const baseUrl = process.env.BASE_URL || `http://localhost:${PORT}`;

        // Crear checkout usando Vexor
        const checkoutResponse = await vexor.pay.mercadopago({
            items: [
                {
                    title: plan.title,
                    description: plan.description,
                    unit_price: plan.unit_price,
                    quantity: plan.quantity
                }
            ],
            options: {
                successRedirect: `${baseUrl}/pages/checkout-success.html`,
                pendingRedirect: `${baseUrl}/pages/checkout-pending.html`,
                failureRedirect: `${baseUrl}/pages/checkout-failure.html`
            }
        });

        // Verificar que se creó correctamente
        if (!checkoutResponse.payment_url) {
            throw new Error('No se pudo generar la URL de pago');
        }

        // Retornar la URL de pago al frontend
        res.json({
            success: true,
            payment_url: checkoutResponse.payment_url,
            identifier: checkoutResponse.identifier
        });

    } catch (error) {
        console.error('Error al crear checkout:', error);
        res.status(500).json({
            error: 'Error al procesar el pago',
            message: error.message
        });
    }
});

// Endpoint de salud para verificar que el servidor está funcionando
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Servidor funcionando correctamente',
        mercadopago_configured: !!process.env.MERCADOPAGO_ACCESS_TOKEN,
        mongodb_connected: mongoose.connection.readyState === 1
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor iniciado en http://localhost:${PORT}`);
    console.log(`📦 Modo: ${process.env.MERCADOPAGO_SANDBOX === 'true' ? 'SANDBOX (Pruebas)' : 'PRODUCTION'}`);
    console.log(`💳 MercadoPago configurado: ${!!process.env.MERCADOPAGO_ACCESS_TOKEN ? 'Sí' : 'No'}`);
    console.log(`🗄️  MongoDB configurado: ${!!process.env.MONGODB_URI ? 'Sí' : 'No'}`);

    if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
        console.warn('⚠️  ADVERTENCIA: No se encontró MERCADOPAGO_ACCESS_TOKEN en .env');
    }

    if (!process.env.MONGODB_URI) {
        console.warn('⚠️  ADVERTENCIA: No se encontró MONGODB_URI en .env');
    }

    if (!process.env.JWT_SECRET) {
        console.warn('⚠️  ADVERTENCIA: No se encontró JWT_SECRET en .env');
    }
});
