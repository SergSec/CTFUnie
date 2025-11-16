const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  caseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Case',
    required: [true, 'El caso es requerido']
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El cliente es requerido']
  },
  advisorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El asesor es requerido']
  },
  scheduledDate: {
    type: Date,
    required: [true, 'La fecha de la cita es requerida']
  },
  duration: {
    type: Number,
    default: 30, // minutes
    required: true
  },
  type: {
    type: String,
    enum: ['presencial', 'videollamada', 'telefonica'],
    default: 'videollamada'
  },
  status: {
    type: String,
    enum: ['pendiente', 'confirmada', 'en_curso', 'completada', 'cancelada'],
    default: 'pendiente'
  },
  teamsLink: {
    type: String,
    default: null
  },
  calendlyEventId: {
    type: String,
    default: null
  },
  notes: {
    type: String,
    trim: true
  },
  reminderSent: {
    type: Boolean,
    default: false
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
appointmentSchema.index({ advisorId: 1, scheduledDate: 1 });
appointmentSchema.index({ clientId: 1, scheduledDate: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);

