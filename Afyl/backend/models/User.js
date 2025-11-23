const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre es requerido'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'El email es requerido'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'La contraseña es requerida'],
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
    select: false
  },
  role: {
    type: String,
    enum: ['cliente', 'asesor', 'admin'],
    default: 'cliente'
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    street: String,
    city: String,
    postalCode: String,
    country: String
  },
  profilePicture: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isTemporary: {
    type: Boolean,
    default: false
  },
  temporaryPassword: {
    type: String,
    default: null
  },
  expiresAt: {
    type: Date,
    default: null
  },
  deleteAt: {
    type: Date,
    default: null
  },
  caseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Case',
    default: null
  },
  specialization: {
    type: String,
    trim: true
  },
  // Optional working hours for advisors: array of { day: 0-6, startHour: Number (0-23), endHour: Number (1-24) }
  workingHours: {
    type: [
      {
        day: { type: Number, min: 0, max: 6 },
        startHour: { type: Number, min: 0, max: 23 },
        endHour: { type: Number, min: 1, max: 24 }
      }
    ],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  // Asegurar que candidatePassword es un string
  if (!candidatePassword || typeof candidatePassword !== 'string') {
    return false;
  }
  
  // Asegurar que this.password existe y está hasheada
  if (!this.password) {
    return false;
  }
  
  // Si la contraseña no está hasheada (no empieza con $2a$, $2b$ o $2y$), no se puede comparar con bcrypt
  if (!this.password.startsWith('$2a$') && !this.password.startsWith('$2b$') && !this.password.startsWith('$2y$')) {
    // Si no está hasheada, comparar directamente (solo para casos especiales)
    return this.password === candidatePassword;
  }
  
  // Comparar usando bcrypt
  try {
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    return isMatch;
  } catch (error) {
    console.error('Error comparing password:', error);
    return false;
  }
};

module.exports = mongoose.model('User', userSchema);

