const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
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
  amount: {
    type: Number,
    required: [true, 'El monto es requerido'],
    min: [0, 'El monto debe ser positivo']
  },
  currency: {
    type: String,
    default: 'EUR',
    enum: ['EUR', 'USD', 'GBP', 'AFYL']
  },
  status: {
    type: String,
    enum: ['pendiente', 'procesando', 'completado', 'fallido', 'reembolsado'],
    default: 'pendiente'
  },
  paymentMethod: {
    type: String,
    enum: ['tarjeta', 'transferencia', 'paypal', 'otro'],
    default: 'tarjeta'
  },
  transactionId: {
    type: String,
    unique: true,
    sparse: true
  },
  gatewayResponse: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  invoiceNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  paidAt: {
    type: Date,
    default: null
  },
  description: {
    type: String,
    trim: true
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
paymentSchema.index({ clientId: 1, status: 1 });
paymentSchema.index({ caseId: 1 });
// transactionId already has unique index defined in schema

module.exports = mongoose.model('Payment', paymentSchema);

