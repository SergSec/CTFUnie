const mongoose = require('mongoose');

const caseSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El cliente es requerido']
  },
  advisorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  title: {
    type: String,
    required: [true, 'El título del caso es requerido'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'La descripción es requerida']
  },
  category: {
    type: String,
    enum: ['legal', 'financiero', 'fiscal', 'laboral', 'empresarial', 'otro'],
    required: [true, 'La categoría es requerida']
  },
  status: {
    type: String,
    enum: ['nuevo', 'en_analisis', 'pendiente_cita', 'en_proceso', 'cerrado'],
    default: 'nuevo'
  },
  priority: {
    type: String,
    enum: ['baja', 'media', 'alta', 'urgente'],
    default: 'media'
  },
  documents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document'
  }],
  estimatedCost: {
    type: Number,
    default: 0
  },
  finalCost: {
    type: Number,
    default: 0
  },
  paymentStatus: {
    type: String,
    enum: ['pendiente', 'parcial', 'pagado'],
    default: 'pendiente'
  },
  notes: [{
    content: String,
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  closedAt: {
    type: Date,
    default: null
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

// Index for better query performance
caseSchema.index({ clientId: 1, status: 1 });
caseSchema.index({ advisorId: 1, status: 1 });

module.exports = mongoose.model('Case', caseSchema);

