const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre es requerido'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'El email es requerido'],
    trim: true,
    lowercase: true
  },
  telefono: {
    type: String,
    trim: true
  },
  servicio: {
    type: String,
    required: [true, 'El servicio es requerido']
  },
  consulta: {
    type: String,
    required: [true, 'La consulta es requerida'],
    trim: true
  },
  archivos: [{
    filename: String,
    originalName: String,
    path: String,
    mimetype: String,
    size: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['pendiente', 'en-revision', 'aceptada', 'rechazada', 'cerrada'],
    default: 'pendiente'
  },
  caseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Case',
    default: null
  },
  temporaryUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  calendlyEventUri: {
    type: String,
    default: null
  },
  calendlyInviteeUri: {
    type: String,
    default: null
  },
  appointmentDate: {
    type: Date,
    default: null
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  notes: {
    type: String,
    default: ''
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

module.exports = mongoose.model('Consultation', consultationSchema);
