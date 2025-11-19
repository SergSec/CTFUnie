const express = require('express');
const Case = require('../models/Case');
const Document = require('../models/Document');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const { sendEmail } = require('../utils/email');

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
    const Consultation = require('../models/Consultation');
    
    const cases = await Case.find({ status: 'pendiente_revision' })
      .populate('clientId', 'name email phone')
      .sort({ createdAt: -1 });

    // Para cada caso, buscar la consulta relacionada
    const casesWithConsultations = await Promise.all(
      cases.map(async (caseItem) => {
        const consultation = await Consultation.findOne({ caseId: caseItem._id });
        return {
          ...caseItem.toObject(),
          consultation: consultation
        };
      })
    );

    res.json({
      success: true,
      count: casesWithConsultations.length,
      data: casesWithConsultations
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
// @desc    Update case (admin or asesor)
// @access  Private (Admin/Asesor)
router.put('/:id', protect, authorize('admin', 'asesor'), async (req, res) => {
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
      if (req.user.role === 'asesor' && advisorId && advisorId !== req.user._id.toString()) {
        // Asesores no pueden reasignar el caso a otro asesor desde este endpoint
        return res.status(403).json({ message: 'No autorizado para reasignar el caso' });
      }

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

// @route   DELETE /api/cases/:id/complete
// @desc    Delete case completely including consultations, documents, appointments and user (asesor/admin)
// @access  Private (Admin/Asesor)
router.delete('/:id/complete', protect, authorize('admin', 'asesor'), async (req, res) => {
  try {
    const caseData = await Case.findById(req.params.id).populate('clientId');

    if (!caseData) {
      return res.status(404).json({ message: 'Caso no encontrado' });
    }

    // Verificar que el asesor sea el asignado al caso
    if (req.user.role === 'asesor' && caseData.advisorId && caseData.advisorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'No autorizado. Este caso está asignado a otro asesor.' });
    }

    const clientId = caseData.clientId._id;
    const caseId = caseData._id;

    // 1. Eliminar consultas relacionadas
    const Consultation = require('../models/Consultation');
    const consultations = await Consultation.find({ caseId });
    
    // Eliminar archivos de las consultas
    const fs = require('fs');
    const path = require('path');
    for (const consultation of consultations) {
      if (consultation.archivos && consultation.archivos.length > 0) {
        for (const archivo of consultation.archivos) {
          const filePath = path.join(__dirname, '..', archivo);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }
      }
    }
    await Consultation.deleteMany({ caseId });

    // 2. Eliminar documentos relacionados
    const documents = await Document.find({ caseId });
    for (const doc of documents) {
      if (doc.filePath) {
        const filePath = path.join(__dirname, '..', doc.filePath);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    }
    await Document.deleteMany({ caseId });

    // 3. Eliminar citas relacionadas
    const Appointment = require('../models/Appointment');
    await Appointment.deleteMany({ caseId });

    // 4. Verificar si el cliente tiene otros casos
    const otherCases = await Case.find({ 
      clientId, 
      _id: { $ne: caseId } 
    });

    // 5. Eliminar el caso
    await caseData.deleteOne();

    // 6. Si el cliente no tiene más casos, eliminar el usuario
    if (otherCases.length === 0) {
      await User.findByIdAndDelete(clientId);
      
      res.json({
        success: true,
        message: 'Caso, consultas, documentos, citas y usuario eliminados completamente',
        deletedUser: true
      });
    } else {
      res.json({
        success: true,
        message: 'Caso, consultas, documentos y citas eliminados. El usuario tiene otros casos activos.',
        deletedUser: false
      });
    }

  } catch (error) {
    console.error('Error al eliminar caso completamente:', error);
    res.status(500).json({ 
      message: 'Error al eliminar caso completamente', 
      error: error.message 
    });
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

      // Enviar email al cliente notificando aceptación
      try {
        const clientEmail = caseData.clientId.email;
        const subject = 'Tu caso ha sido aceptado - Afyl';
        const html = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1a237e;">¡Tu caso ha sido aceptado!</h2>
          <p>Hola ${caseData.clientId.name || ''},</p>
          <p>Nos complace informarte que tu caso <strong>${caseData.title}</strong> ha sido aceptado por nuestro equipo.</p>
          
          <div style="background-color: #e8f5e9; border-left: 4px solid #4caf50; padding: 15px; margin: 20px 0;">
            <h3 style="color: #2e7d32; margin-top: 0;">Detalles del Caso</h3>
            <p><strong>Asesor asignado:</strong> ${req.user.name || 'Asesor'}</p>
            <p><strong>Precio estimado:</strong> €${price}</p>
          </div>
          
          <p>Ya puedes acceder al panel de cliente para:</p>
          <ul>
            <li>Ver más detalles del caso</li>
            <li>Proponer fechas para citas</li>
            <li>Comunicarte con tu asesor</li>
          </ul>
          
          <p style="margin-top: 30px;">Saludos,<br/>Equipo Afyl</p>
        </div>`;

        await sendEmail({ 
          to: clientEmail, 
          subject, 
          html, 
          text: `Tu caso ha sido aceptado. Asesor: ${req.user.name}. Precio estimado: €${price}` 
        });
      } catch (err) {
        console.error('Error enviando email de aceptación de caso:', err.message);
      }

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

      // Enviar email al cliente notificando rechazo
      try {
        const clientEmail = caseData.clientId.email;
        const subject = 'Tu caso ha sido rechazado - Afyl';
        const html = `<p>Hola ${caseData.clientId.name || ''},</p>
          <p>Lamentamos informarte que tu caso <strong>${caseData.title}</strong> ha sido rechazado.</p>
          <p>Motivo: ${caseData.rejectionReason || 'No especificado'}.</p>
          <p>Tu cuenta temporal será eliminada en 48 horas si no se realiza ninguna acción.</p>
          <p>Saludos,<br/>Equipo Afyl</p>`;

        await sendEmail({ to: clientEmail, subject, html, text: `Tu caso ha sido rechazado. Motivo: ${caseData.rejectionReason || 'No especificado'}` });
      } catch (err) {
        console.error('Error enviando email de rechazo de caso:', err.message);
      }

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

