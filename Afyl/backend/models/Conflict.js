const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema({
  id: {
    type: String,
    required: [true, 'El ID del problema es requerido'],
    trim: true,
    lowercase: true
  },
  label: {
    type: String,
    required: [true, 'El nombre del problema es requerido'],
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  _id: false
});

const conflictSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'El título es requerido'],
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: [true, 'El servicio es requerido']
  },
  problems: {
    type: [problemSchema],
    default: []
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
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

conflictSchema.index({ service: 1, order: 1 });

module.exports = mongoose.model('Conflict', conflictSchema);
