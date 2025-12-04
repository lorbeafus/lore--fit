const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    subscription: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subscription',
        required: true
    },
    amount: {
        type: Number,
        required: [true, 'El monto es requerido']
    },
    paymentDate: {
        type: Date,
        default: Date.now
    },
    dueDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        enum: ['mercadopago', 'transfer', 'cash', 'other'],
        default: 'mercadopago'
    },
    mercadopagoId: {
        type: String
    },
    mercadopagoStatus: {
        type: String
    },
    description: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Índice para búsquedas rápidas
paymentSchema.index({ user: 1, paymentDate: -1 });
paymentSchema.index({ subscription: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
