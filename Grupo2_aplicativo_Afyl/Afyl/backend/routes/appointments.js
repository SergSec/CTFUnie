const express = require('express');
const Appointment = require('../models/Appointment');
const Case = require('../models/Case');
const { protect, authorize } = require('../middleware/auth');
const axios = require('axios');

const router = express.Router();

// @route   POST /api/appointments
// @desc    Create a new appointment
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { caseId, scheduledDate, duration, type, notes } = req.body;

    if (!caseId || !scheduledDate) {
      return res.status(400).json({ message: 'El caso y la fecha son requeridos' });
    }

    // Verify case exists
    const caseData = await Case.findById(caseId);
    if (!caseData) {
      return res.status(404).json({ message: 'Caso no encontrado' });
    }

    // Get advisor (if not assigned, assign one based on category)
    let advisorId = caseData.advisorId;

    if (!advisorId && req.user.role === 'asesor') {
      advisorId = req.user._id;
    }

    if (!advisorId) {
      return res.status(400).json({ message: 'El caso debe tener un asesor asignado' });
    }

    // Authorization check
    if (req.user.role === 'cliente' && caseData.clientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'No autorizado' });
    }

    if (req.user.role === 'asesor' && !advisorId && caseData.advisorId && caseData.advisorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'No autorizado para este caso' });
    }

    // Create appointment
    const appointment = await Appointment.create({
      caseId,
      clientId: caseData.clientId,
      advisorId,
      scheduledDate: new Date(scheduledDate),
      duration: duration || 30,
      type: type || 'videollamada',
      notes
    });

    // If videollamada, generate Teams link (integration with Calendly/Teams)
    if (appointment.type === 'videollamada') {
      try {
        // This would integrate with Calendly API to create event and get Teams link
        // For now, we'll create a placeholder
        const teamsLink = await generateTeamsLink(appointment);
        appointment.teamsLink = teamsLink;
        await appointment.save();
      } catch (error) {
        console.error('Error generating Teams link:', error);
      }
    }

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('clientId', 'name email')
      .populate('advisorId', 'name email')
      .populate('caseId', 'title');

    res.status(201).json({
      success: true,
      appointment: populatedAppointment
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear cita', error: error.message });
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

module.exports = router;

