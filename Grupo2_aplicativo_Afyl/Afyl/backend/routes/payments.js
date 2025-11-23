const express = require('express');
const Payment = require('../models/Payment');
const Case = require('../models/Case');
const { protect, authorize } = require('../middleware/auth');
const { getOrCreateWallet, addTransaction } = require('../utils/wallet');

const router = express.Router();

// @route   POST /api/payments
// @desc    Create a new payment
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { caseId, amount, currency, paymentMethod, description } = req.body;

    if (!caseId || !amount) {
      return res.status(400).json({ message: 'El caso y el monto son requeridos' });
    }

    // Verify case exists
    const caseData = await Case.findById(caseId);
    if (!caseData) {
      return res.status(404).json({ message: 'Caso no encontrado' });
    }

    // Authorization check
    if (req.user.role === 'cliente' && caseData.clientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'No autorizado' });
    }

    // Generate invoice number
    const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const isVirtualCurrency =
      (currency && currency.toUpperCase() === 'AFYL') ||
      (paymentMethod && paymentMethod.toLowerCase() === 'afylcoin');

    if (isVirtualCurrency) {
      const wallet = await getOrCreateWallet(caseData.clientId);
      if (wallet.balance < amount) {
        return res.status(400).json({ message: 'Saldo insuficiente en la moneda virtual AFYL' });
      }
    }

    const payment = await Payment.create({
      caseId,
      clientId: caseData.clientId,
      amount,
      currency: isVirtualCurrency ? 'AFYL' : currency || 'EUR',
      paymentMethod: isVirtualCurrency ? 'afylcoin' : paymentMethod || 'tarjeta',
      description,
      invoiceNumber,
      status: isVirtualCurrency ? 'completado' : 'pendiente',
      paidAt: isVirtualCurrency ? new Date() : null,
    });

    if (isVirtualCurrency) {
      const wallet = await getOrCreateWallet(caseData.clientId);
      wallet.balance -= amount;
      await addTransaction(wallet, {
        type: 'spend',
        amount,
        description: description || `Pago virtual ${invoiceNumber}`,
        paymentId: payment._id,
      });
    }

    // Update case payment status
    const totalPaid = await Payment.aggregate([
      { $match: { caseId: caseData._id, status: 'completado' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const paidAmount = totalPaid[0]?.total || 0;
    if (paidAmount >= caseData.finalCost) {
      caseData.paymentStatus = 'pagado';
    } else if (paidAmount > 0) {
      caseData.paymentStatus = 'parcial';
    }

    await caseData.save();

    const populatedPayment = await Payment.findById(payment._id)
      .populate('clientId', 'name email')
      .populate('caseId', 'title');

    res.status(201).json({
      success: true,
      payment: populatedPayment
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear pago', error: error.message });
  }
});

// @route   POST /api/payments/:id/process
// @desc    Process payment (simulate payment gateway)
// @access  Private
router.post('/:id/process', protect, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ message: 'Pago no encontrado' });
    }

    // Authorization check
    if (req.user.role === 'cliente' && payment.clientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'No autorizado' });
    }

    if (payment.status !== 'pendiente') {
      return res.status(400).json({ message: 'El pago ya ha sido procesado' });
    }

    // Simulate payment processing
    // In production, this would integrate with actual payment gateway
    payment.status = 'procesando';
    await payment.save();

    // Simulate API call to payment gateway
    // const gatewayResponse = await processPaymentGateway(payment);
    
    // For demo purposes, we'll simulate success
    setTimeout(async () => {
      payment.status = 'completado';
      payment.transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      payment.paidAt = new Date();
      payment.gatewayResponse = {
        success: true,
        message: 'Pago procesado exitosamente'
      };
      await payment.save();

      // Update case payment status
      const caseData = await Case.findById(payment.caseId);
      const totalPaid = await Payment.aggregate([
        { $match: { caseId: caseData._id, status: 'completado' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);

      const paidAmount = totalPaid[0]?.total || 0;
      if (paidAmount >= caseData.finalCost) {
        caseData.paymentStatus = 'pagado';
      } else if (paidAmount > 0) {
        caseData.paymentStatus = 'parcial';
      }
      await caseData.save();
    }, 2000);

    res.json({
      success: true,
      message: 'Pago en proceso',
      payment
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al procesar pago', error: error.message });
  }
});

// @route   GET /api/payments
// @desc    Get all payments (filtered by role)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'cliente') {
      query.clientId = req.user._id;
    }

    // Filter by status if provided
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Filter by case if provided
    if (req.query.caseId) {
      query.caseId = req.query.caseId;
    }

    const payments = await Payment.find(query)
      .populate('clientId', 'name email')
      .populate('caseId', 'title')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: payments.length,
      payments
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener pagos', error: error.message });
  }
});

// @route   GET /api/payments/:id
// @desc    Get payment by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('clientId', 'name email')
      .populate('caseId', 'title description');

    if (!payment) {
      return res.status(404).json({ message: 'Pago no encontrado' });
    }

    // Authorization check
    if (req.user.role === 'cliente' && payment.clientId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'No autorizado' });
    }

    res.json({
      success: true,
      payment
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener pago', error: error.message });
  }
});

// @route   PUT /api/payments/:id
// @desc    Update payment (admin/advisor only)
// @access  Private (Admin/Advisor)
router.put('/:id', protect, authorize('admin', 'asesor'), async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ message: 'Pago no encontrado' });
    }

    const { status, description } = req.body;

    if (status) payment.status = status;
    if (description) payment.description = description;

    await payment.save();

    const updatedPayment = await Payment.findById(payment._id)
      .populate('clientId', 'name email')
      .populate('caseId', 'title');

    res.json({
      success: true,
      payment: updatedPayment
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar pago', error: error.message });
  }
});

module.exports = router;

