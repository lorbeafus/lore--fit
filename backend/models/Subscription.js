const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    planType: {
        type: String,
        enum: ['classic', 'premium', 'online'],
        required: [true, 'Por favor selecciona un tipo de plan']
    },
    planName: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    endDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'cancelled', 'expired'],
        default: 'active'
    },
    paymentStatus: {
        type: String,
        enum: ['up_to_date', 'pending', 'overdue'],
        default: 'up_to_date'
    },
    autoRenew: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Método para verificar si la suscripción está activa
subscriptionSchema.methods.isActive = function () {
    return this.status === 'active' && this.endDate > new Date();
};

// Método para verificar si el pago está al día
subscriptionSchema.methods.isPaymentUpToDate = function () {
    return this.paymentStatus === 'up_to_date';
};

module.exports = mongoose.model('Subscription', subscriptionSchema);
