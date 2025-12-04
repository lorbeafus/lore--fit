const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, 'Por favor ingresa tu nombre']
    },
    email: {
        type: String,
        required: [true, 'Por favor ingresa tu email'],
        unique: true,
        lowercase: true,
        match: [/^\w+([-.]?\w+)*@\w+([-.]?\w+)*(\.\w{2,3})+$/, 'Por favor ingresa un email válido']
    },
    password: {
        type: String,
        required: [true, 'Por favor ingresa una contraseña'],
        minlength: 6,
        select: false
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'developer'],
        default: 'user'
    },
    altura: {
        type: Number,
        min: 0,
        max: 300
    },
    peso: {
        type: Number,
        min: 0,
        max: 500
    },
    direccion: {
        type: String
    },
    profilePhoto: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Encriptar password antes de guardar
userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Método para comparar passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
