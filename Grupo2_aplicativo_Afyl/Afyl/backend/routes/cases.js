const express = require('express');
const Case = require('../models/Case');
const Document = require('../models/Document');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/cases
// @desc    Create a new case (admin only)
// @access  Private (Admin)
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const {
      clientId,
      advisorId,
      title,
      description,
      category,
      priority,
      estimatedCost
    } = req.body;

    if (!clientId || !title || !description || !category) {
      return res.status(400).json({ message: 'Cliente, título, descripción y categoría son requeridos' });
    }

    const client = await User.findById(clientId);
    if (!client || client.role !== 'cliente') {
      return res.status(400).json({ message: 'El cliente seleccionado no es válido' });
    }

    let advisor = null;
    if (advisorId) {
      advisor = await User.findById(advisorId);
      if (!advisor || advisor.role !== 'asesor') {
        return res.status(400).json({ message: 'El asesor seleccionado no es válido' });
      }
    }

    const newCase = await Case.create({
      clientId,
      advisorId: advisor ? advisor._id : null,
      title,
      description,
      category,
      priority: priority || 'media',
      estimatedCost: estimatedCost || 0
    });

    const populatedCase = await Case.findById(newCase._id)
      .populate('clientId', 'name email')
      .populate('advisorId', 'name email');

    res.status(201).json({
      success: true,
      case: populatedCase
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear caso', error: error.message });
  }
});

// @route   GET /api/cases/pending-review
// @desc    Get cases pending review (for advisors/admins)
// @access  Private (Admin/Asesor)
router.get('/pending-review', protect, authorize('admin', 'asesor'), async (req, res) => {
  try {
    const cases = await Case.find({ status: 'pendiente_revision' })
      .populate('clientId', 'name email phone')
      .populate('consultationId')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: cases.length,
      data: cases
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener casos pendientes', error: error.message });
  }
});

// @route   GET /api/cases
// @desc    Get all cases (filtered by role)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let query = {};

    // Clients see only their cases
    if (req.user.role === 'cliente') {
      query.clientId = req.user._id;
    }

  // Advisors only see cases assigned to them
    if (req.user.role === 'asesor') {
    query.advisorId = req.user._id;
    }

    // Admins see all cases
    // No additional filter needed

    // Filter by status if provided
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Filter by category if provided
    if (req.query.category) {
      query.category = req.query.category;
    }

    const cases = await Case.find(query)
      .populate('clientId', 'name email phone')
      .populate('advisorId', 'name email specialization')
      .populate('documents')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: cases.length,
      cases
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener casos', error: error.message });
  }
});

// @route   GET /api/cases/:id
// @desc    Get case by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const caseData = await Case.findById(req.params.id)
      .populate('clientId', 'name email phone')
      .populate('advisorId', 'name email specialization')
      .populate('documents');

    if (!caseData) {
      return res.status(404).json({ message: 'Caso no encontrado' });
    }

    // Authorization check
    if (req.user.role === 'cliente' && caseData.clientId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'No autorizado' });
    }

    if (req.user.role === 'asesor' && caseData.advisorId && caseData.advisorId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'No autorizado' });
    }

    res.json({
      success: true,
      case: caseData
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener caso', error: error.message });
  }
});

// @route   PUT /api/cases/:id
// @desc    Update case (admin only)
// @access  Private (Admin)
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const caseData = await Case.findById(req.params.id);

    if (!caseData) {
      return res.status(404).json({ message: 'Caso no encontrado' });
    }

    const {
      title,
      description,
      category,
      priority,
      status,
      advisorId,
      estimatedCost,
      finalCost,
      notes,
      paymentStatus
    } = req.body;

    if (title) caseData.title = title;
    if (description) caseData.description = description;
    if (category) caseData.category = category;
    if (priority) caseData.priority = priority;
    if (status) {
      caseData.status = status;
      if (status === 'cerrado') {
        caseData.closedAt = new Date();
      }
    }
    if (advisorId !== undefined) {
      if (advisorId) {
        const advisor = await User.findById(advisorId);
        if (!advisor || advisor.role !== 'asesor') {
          return res.status(400).json({ message: 'El asesor seleccionado no es válido' });
        }
        caseData.advisorId = advisor._id;
      } else {
        caseData.advisorId = null;
      }
    }
    if (estimatedCost !== undefined) caseData.estimatedCost = estimatedCost;
    if (finalCost !== undefined) caseData.finalCost = finalCost;
    if (paymentStatus) caseData.paymentStatus = paymentStatus;
    if (notes) {
      caseData.notes.push({
        content: notes,
        authorId: req.user._id
      });
    }

    await caseData.save();

    const updatedCase = await Case.findById(caseData._id)
      .populate('clientId', 'name email')
      .populate('advisorId', 'name email');

    res.json({
      success: true,
      case: updatedCase
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar caso', error: error.message });
  }
});

// @route   DELETE /api/cases/:id
// @desc    Delete case (only admin)
// @access  Private (Admin)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const caseData = await Case.findById(req.params.id);

    if (!caseData) {
      return res.status(404).json({ message: 'Caso no encontrado' });
    }

    await caseData.deleteOne();

    res.json({
      success: true,
      message: 'Caso eliminado exitosamente'
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar caso', error: error.message });
  }
});

// @route   PUT /api/cases/:id/review
// @desc    Accept or reject a case (asesor/admin)
// @access  Private (Admin/Asesor)
router.put('/:id/review', protect, authorize('admin', 'asesor'), async (req, res) => {
  try {
    const { action, price, rejectionReason } = req.body;
    
    if (!action || !['accept', 'reject'].includes(action)) {
      return res.status(400).json({ 
        message: 'Acción inválida. Debe ser "accept" o "reject"' 
      });
    }

    const caseData = await Case.findById(req.params.id)
      .populate('clientId');

    if (!caseData) {
      return res.status(404).json({ message: 'Caso no encontrado' });
    }

    if (caseData.status !== 'pendiente_revision') {
      return res.status(400).json({ 
        message: 'Este caso ya ha sido revisado' 
      });
    }

    if (action === 'accept') {
      if (!price || price <= 0) {
        return res.status(400).json({ 
          message: 'El precio es requerido para aceptar el caso' 
        });
      }

      // Aceptar caso
      caseData.status = 'aceptado';
      caseData.advisorId = req.user._id;
      caseData.estimatedCost = price;
      caseData.reviewedAt = new Date();
      
      // Hacer permanente el usuario temporal
      const tempUser = await User.findById(caseData.clientId._id);
      if (tempUser && tempUser.isTemporary) {
        tempUser.isTemporary = false;
        tempUser.expiresAt = null;
        tempUser.deleteAt = null;
        await tempUser.save();
      }

      // Actualizar consulta
      const Consultation = require('../models/Consultation');
      await Consultation.updateOne(
        { caseId: caseData._id },
        { status: 'aceptada', assignedTo: req.user._id }
      );

      await caseData.save();

      res.json({
        success: true,
        message: 'Caso aceptado exitosamente',
        data: caseData
      });

    } else {
      // Rechazar caso
      caseData.status = 'rechazado';
      caseData.rejectionReason = rejectionReason || 'No especificado';
      caseData.reviewedAt = new Date();

      // Marcar usuario para eliminación en 48 horas
      const tempUser = await User.findById(caseData.clientId._id);
      if (tempUser && tempUser.isTemporary) {
        const deleteDate = new Date();
        deleteDate.setHours(deleteDate.getHours() + 48);
        tempUser.deleteAt = deleteDate;
        tempUser.isActive = false;
        await tempUser.save();
      }

      // Actualizar consulta
      const Consultation = require('../models/Consultation');
      await Consultation.updateOne(
        { caseId: caseData._id },
        { status: 'rechazada' }
      );

      await caseData.save();

      res.json({
        success: true,
        message: 'Caso rechazado. El usuario será eliminado en 48 horas.',
        data: caseData
      });
    }
  } catch (error) {
    res.status(500).json({ 
      message: 'Error al revisar caso', 
      error: error.message 
    });
  }
});

module.exports = router;

