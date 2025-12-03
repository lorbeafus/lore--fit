// Importar dependencias
const express = require('express');
const path = require('path');
require('dotenv').config();
const { Vexor } = require('vexor');

// Crear aplicación Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para parsear JSON
app.use(express.json());

// Servir archivos estáticos desde el directorio frontend
app.use(express.static(path.join(__dirname, '../frontend')));

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
        mercadopago_configured: !!process.env.MERCADOPAGO_ACCESS_TOKEN
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor iniciado en http://localhost:${PORT}`);
    console.log(`📦 Modo: ${process.env.MERCADOPAGO_SANDBOX === 'true' ? 'SANDBOX (Pruebas)' : 'PRODUCTION'}`);
    console.log(`💳 MercadoPago configurado: ${!!process.env.MERCADOPAGO_ACCESS_TOKEN ? 'Sí' : 'No'}`);

    if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
        console.warn('⚠️  ADVERTENCIA: No se encontró MERCADOPAGO_ACCESS_TOKEN en .env');
    }
});
