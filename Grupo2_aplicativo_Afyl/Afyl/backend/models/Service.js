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

// Schema to allow admin to configure form fields per service
const formFieldSchema = new mongoose.Schema({
  id: { type: String, required: true, trim: true, lowercase: true },
  label: { type: String, required: true, trim: true },
  type: { type: String, enum: ['text', 'textarea', 'select', 'checkbox'], default: 'text' },
  options: { type: [String], default: [] },
  placeholder: { type: String, default: '' },
  required: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, { _id: false });

const serviceSchema = new mongoose.Schema({
  id: {
    type: String,
    required: [true, 'El ID es requerido'],
    unique: true,
    trim: true,
    lowercase: true
  },
  title: {
    type: String,
    required: [true, 'El título es requerido'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'La descripción es requerida'],
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    default: null
  },
  level: {
    type: Number,
    default: 0
  },
  problems: {
    type: [problemSchema],
    default: []
  },
  // editable form fields that will be rendered in the consultation form
  formFields: {
    type: [formFieldSchema],
    default: []
  },
  tags: [{
    type: String,
    trim: true
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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

serviceSchema.index({ parent: 1, order: 1 });
serviceSchema.index({ 'problems.id': 1 }, { unique: false });

module.exports = mongoose.model('Service', serviceSchema);
