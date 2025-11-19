const express = require('express');
const Appointment = require('../models/Appointment');
const Case = require('../models/Case');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const { sendEmail } = require('../utils/email');
const axios = require('axios');

const router = express.Router();

// @route   POST /api/appointments
// @desc    Create a new appointment request (Cliente solicita cita)
// @access  Private (Cliente)
router.post('/', protect, authorize('cliente'), async (req, res) => {
  try {
    const { caseId, scheduledDate, duration, type, notes } = req.body;

    if (!caseId || !scheduledDate) {
      return res.status(400).json({ message: 'El caso y la fecha son requeridos' });
    }

    // Verify case exists and belongs to client
    const caseData = await Case.findById(caseId).populate('advisorId');
    if (!caseData) {
      return res.status(404).json({ message: 'Caso no encontrado' });
    }

    // Verify case belongs to client
    if (caseData.clientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'No autorizado' });
    }

    // Verify case has an advisor assigned
    if (!caseData.advisorId) {
      return res.status(400).json({ message: 'El caso debe tener un asesor asignado' });
    }

    // Verify case is accepted
    if (caseData.status !== 'aceptado' && caseData.status !== 'en_proceso') {
      return res.status(400).json({ message: 'El caso debe estar aceptado para solicitar citas' });
    }

    // Create appointment with 'solicitada' status
    const appointment = await Appointment.create({
      caseId,
      clientId: req.user._id,
      advisorId: caseData.advisorId._id,
      scheduledDate: new Date(scheduledDate),
      duration: duration || 30,
      type: type || 'videollamada',
      status: 'solicitada',
      notes
    });

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('clientId', 'name email')
      .populate('advisorId', 'name email')
      .populate('caseId', 'title');

    // Enviar email al asesor
    try {
      const advisorEmail = caseData.advisorId.email;
      const subject = 'Nueva solicitud de cita - Afyl';
      const html = `<p>Hola ${caseData.advisorId.name || ''},</p>
        <p>Tienes una nueva solicitud de cita de <strong>${req.user.name}</strong>.</p>
        <p><strong>Caso:</strong> ${caseData.title}</p>
        <p><strong>Fecha propuesta:</strong> ${new Date(scheduledDate).toLocaleString('es-ES')}</p>
        <p><strong>Tipo:</strong> ${type || 'videollamada'}</p>
        ${notes ? `<p><strong>Notas:</strong> ${notes}</p>` : ''}
        <p>Por favor, accede al panel de asesor para confirmar o rechazar esta cita.</p>
        <p>Saludos,<br/>Equipo Afyl</p>`;

      await sendEmail({ to: advisorEmail, subject, html, text: `Nueva solicitud de cita de ${req.user.name}` });
    } catch (err) {
      console.error('Error enviando email de solicitud de cita:', err.message);
    }

    res.status(201).json({
      success: true,
      message: 'Solicitud de cita enviada. El asesor confirmará la disponibilidad.',
      appointment: populatedAppointment
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear solicitud de cita', error: error.message });
  }
});

// Helper function to generate Teams link (placeholder - integrate with actual API)
async function generateTeamsLink(appointment) {
  // This would integrate with Calendly webhook or Teams API
  // For now, return a placeholder
  return `https://teams.microsoft.com/l/meetup-join/...`;
}

// @route   GET /api/appointments
// @desc    Get all appointments (filtered by role)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'cliente') {
      query.clientId = req.user._id;
    } else if (req.user.role === 'asesor') {
      query.advisorId = req.user._id;
    }

    // Filter by status if provided
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Filter by date range
    if (req.query.startDate) {
      query.scheduledDate = { $gte: new Date(req.query.startDate) };
    }
    if (req.query.endDate) {
      query.scheduledDate = { ...query.scheduledDate, $lte: new Date(req.query.endDate) };
    }

    const appointments = await Appointment.find(query)
      .populate('clientId', 'name email phone')
      .populate('advisorId', 'name email')
      .populate('caseId', 'title category')
      .sort({ scheduledDate: 1 });

    res.json({
      success: true,
      count: appointments.length,
      appointments
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener citas', error: error.message });
  }
});

// @route   GET /api/appointments/pending-confirmation
// @desc    Get appointments pending confirmation (for advisors)
// @access  Private (Asesor/Admin)
router.get('/pending-confirmation', protect, authorize('asesor', 'admin'), async (req, res) => {
  try {
    const query = {
      status: 'solicitada'
    };

    if (req.user.role === 'asesor') {
      query.advisorId = req.user._id;
    }

    const appointments = await Appointment.find(query)
      .populate('clientId', 'name email phone')
      .populate('advisorId', 'name email')
      .populate('caseId', 'title category')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: appointments.length,
      appointments
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener citas pendientes', error: error.message });
  }
});

// @route   GET /api/appointments/:id
// @desc    Get appointment by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('clientId', 'name email phone')
      .populate('advisorId', 'name email')
      .populate('caseId', 'title description');

    if (!appointment) {
      return res.status(404).json({ message: 'Cita no encontrada' });
    }

    // Authorization check
    if (req.user.role === 'cliente' && appointment.clientId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'No autorizado' });
    }

    if (req.user.role === 'asesor' && appointment.advisorId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'No autorizado' });
    }

    res.json({
      success: true,
      appointment
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener cita', error: error.message });
  }
});

// @route   PUT /api/appointments/:id
// @desc    Update appointment
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Cita no encontrada' });
    }

    // Authorization check
    if (req.user.role === 'cliente' && appointment.clientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'No autorizado' });
    }

    if (req.user.role === 'asesor' && appointment.advisorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'No autorizado' });
    }

    const { scheduledDate, duration, status, notes } = req.body;

    if (scheduledDate) appointment.scheduledDate = new Date(scheduledDate);
    if (duration) appointment.duration = duration;
    if (status) appointment.status = status;
    if (notes !== undefined) appointment.notes = notes;

    await appointment.save();

    const updatedAppointment = await Appointment.findById(appointment._id)
      .populate('clientId', 'name email')
      .populate('advisorId', 'name email')
      .populate('caseId', 'title');

    res.json({
      success: true,
      appointment: updatedAppointment
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar cita', error: error.message });
  }
});

// @route   DELETE /api/appointments/:id
// @desc    Cancel appointment
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Cita no encontrada' });
    }

    // Authorization check
    if (req.user.role === 'cliente' && appointment.clientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'No autorizado' });
    }

    if (req.user.role === 'asesor' && appointment.advisorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'No autorizado' });
    }

    appointment.status = 'cancelada';
    await appointment.save();

    res.json({
      success: true,
      message: 'Cita cancelada exitosamente'
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al cancelar cita', error: error.message });
  }
});

// @route   PUT /api/appointments/:id/confirm
// @desc    Confirm appointment (Asesor)
// @access  Private (Asesor/Admin)
router.put('/:id/confirm', protect, authorize('asesor', 'admin'), async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('clientId')
      .populate('advisorId')
      .populate('caseId');

    if (!appointment) {
      return res.status(404).json({ message: 'Cita no encontrada' });
    }

    // Verify asesor is the assigned advisor
    if (req.user.role === 'asesor' && appointment.advisorId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'No autorizado' });
    }

    // Verify appointment is in 'solicitada' status
    if (appointment.status !== 'solicitada') {
      return res.status(400).json({ message: 'Solo se pueden confirmar citas solicitadas' });
    }

    appointment.status = 'confirmada';
    appointment.confirmedAt = new Date();

    // If videollamada, generate Teams link
    if (appointment.type === 'videollamada' && !appointment.teamsLink) {
      try {
        const teamsLink = await generateTeamsLink(appointment);
        appointment.teamsLink = teamsLink;
      } catch (error) {
        console.error('Error generating Teams link:', error);
      }
    }

    await appointment.save();

    // Enviar email al cliente
    try {
      const clientEmail = appointment.clientId.email;
      const subject = 'Tu cita ha sido confirmada - Afyl';
      const html = `<p>Hola ${appointment.clientId.name || ''},</p>
        <p>Tu cita ha sido <strong>confirmada</strong> por ${appointment.advisorId.name}.</p>
        <p><strong>Caso:</strong> ${appointment.caseId.title}</p>
        <p><strong>Fecha:</strong> ${new Date(appointment.scheduledDate).toLocaleString('es-ES')}</p>
        <p><strong>Duración:</strong> ${appointment.duration} minutos</p>
        <p><strong>Tipo:</strong> ${appointment.type}</p>
        ${appointment.teamsLink ? `<p><strong>Link de reunión:</strong> <a href="${appointment.teamsLink}">Unirse a la reunión</a></p>` : ''}
        <p>Por favor, accede al panel de cliente para ver más detalles.</p>
        <p>Saludos,<br/>Equipo Afyl</p>`;

      await sendEmail({ to: clientEmail, subject, html, text: 'Tu cita ha sido confirmada' });
    } catch (err) {
      console.error('Error enviando email de confirmación de cita:', err.message);
    }

    const updatedAppointment = await Appointment.findById(appointment._id)
      .populate('clientId', 'name email')
      .populate('advisorId', 'name email')
      .populate('caseId', 'title');

    res.json({
      success: true,
      message: 'Cita confirmada exitosamente',
      appointment: updatedAppointment
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al confirmar cita', error: error.message });
  }
});

// @route   PUT /api/appointments/:id/reject
// @desc    Reject appointment (Asesor)
// @access  Private (Asesor/Admin)
router.put('/:id/reject', protect, authorize('asesor', 'admin'), async (req, res) => {
  try {
    const { rejectionReason } = req.body;

    if (!rejectionReason) {
      return res.status(400).json({ message: 'El motivo de rechazo es requerido' });
    }

    const appointment = await Appointment.findById(req.params.id)
      .populate('clientId')
      .populate('advisorId')
      .populate('caseId');

    if (!appointment) {
      return res.status(404).json({ message: 'Cita no encontrada' });
    }

    // Verify asesor is the assigned advisor
    if (req.user.role === 'asesor' && appointment.advisorId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'No autorizado' });
    }

    // Verify appointment is in 'solicitada' status
    if (appointment.status !== 'solicitada') {
      return res.status(400).json({ message: 'Solo se pueden rechazar citas solicitadas' });
    }

    appointment.status = 'rechazada';
    appointment.rejectionReason = rejectionReason;
    appointment.rejectedAt = new Date();

    await appointment.save();

    // Enviar email al cliente
    try {
      const clientEmail = appointment.clientId.email;
      const subject = 'Tu solicitud de cita ha sido rechazada - Afyl';
      const html = `<p>Hola ${appointment.clientId.name || ''},</p>
        <p>Lamentamos informarte que tu solicitud de cita ha sido <strong>rechazada</strong>.</p>
        <p><strong>Caso:</strong> ${appointment.caseId.title}</p>
        <p><strong>Fecha solicitada:</strong> ${new Date(appointment.scheduledDate).toLocaleString('es-ES')}</p>
        <p><strong>Motivo:</strong> ${rejectionReason}</p>
        <p>Por favor, propón otra fecha y hora en el panel de cliente.</p>
        <p>Saludos,<br/>Equipo Afyl</p>`;

      await sendEmail({ to: clientEmail, subject, html, text: 'Tu solicitud de cita ha sido rechazada' });
    } catch (err) {
      console.error('Error enviando email de rechazo de cita:', err.message);
    }

    const updatedAppointment = await Appointment.findById(appointment._id)
      .populate('clientId', 'name email')
      .populate('advisorId', 'name email')
      .populate('caseId', 'title');

    res.json({
      success: true,
      message: 'Cita rechazada',
      appointment: updatedAppointment
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al rechazar cita', error: error.message });
  }
});

module.exports = router;

