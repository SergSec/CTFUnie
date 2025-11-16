const express = require('express');
const Appointment = require('../models/Appointment');
const Case = require('../models/Case');
const User = require('../models/User');
const router = express.Router();

// Middleware para verificar la firma de Calendly (opcional pero recomendado)
const verifyCalendlySignature = (req, res, next) => {
  // Calendly envía un header 'Calendly-Webhook-Signature'
  // En producción, deberías verificar esta firma usando tu webhook signing key
  // Por ahora, lo dejamos como opcional para desarrollo
  next();
};

// @route   POST /api/calendly/webhook
// @desc    Webhook para recibir eventos de Calendly
// @access  Public (pero verificado por firma)
router.post('/webhook', verifyCalendlySignature, async (req, res) => {
  try {
    const event = req.body;
    
    // Calendly envía diferentes tipos de eventos
    // Los más importantes son: invitation.created, invitation.canceled
    if (event.event === 'invitation.created') {
      await handleAppointmentCreated(event);
    } else if (event.event === 'invitation.canceled') {
      await handleAppointmentCanceled(event);
    } else if (event.event === 'invitation.updated') {
      await handleAppointmentUpdated(event);
    }

    // Responder rápidamente a Calendly (máximo 5 segundos)
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Error procesando webhook de Calendly:', error);
    // Aún así respondemos 200 para que Calendly no reintente
    res.status(200).json({ received: true, error: error.message });
  }
});

// Manejar creación de cita en Calendly
async function handleAppointmentCreated(event) {
  const payload = event.payload;
  const invitee = payload.invitee;
  const eventType = payload.event_type;
  const eventData = payload.event;

  // Extraer información del evento
  const calendlyEventId = eventData.uuid;
  const scheduledDate = new Date(eventData.start_time);
  const endTime = new Date(eventData.end_time);
  const duration = Math.round((endTime - scheduledDate) / 1000 / 60); // minutos
  
  // Información del invitado
  const inviteeEmail = invitee.email;
  const inviteeName = invitee.name || inviteeEmail.split('@')[0];
  
  // Información adicional de los campos personalizados
  const customAnswers = invitee.questions_and_answers || [];
  const serviceType = customAnswers.find(q => q.question === 'a1' || q.question_key === 'a1')?.answer || null;
  const consulta = customAnswers.find(q => q.question === 'consulta' || q.question_key === 'consulta')?.answer || null;

  // Buscar usuario por email
  let client = await User.findOne({ email: inviteeEmail });
  
  // Si no existe el usuario, crear uno temporal o usar un usuario por defecto
  if (!client) {
    // Opción 1: Crear usuario temporal (cliente)
    client = await User.create({
      name: inviteeName,
      email: inviteeEmail,
      password: require('crypto').randomBytes(16).toString('hex'), // Password temporal
      role: 'cliente',
      phone: invitee.phone_number || null,
    });
  }

  // Buscar o asignar un asesor (puedes personalizar esta lógica)
  let advisor = await User.findOne({ role: 'asesor' });
  if (!advisor) {
    // Si no hay asesores, usar el primer admin o crear uno por defecto
    advisor = await User.findOne({ role: 'admin' });
  }

  // Buscar o crear un caso relacionado
  let caseData = await Case.findOne({ 
    clientId: client._id,
    status: { $in: ['nuevo', 'en_analisis', 'en_proceso'] }
  }).sort({ createdAt: -1 });

  if (!caseData) {
    // Crear un nuevo caso basado en el servicio
    const categoryMap = {
      'laboral': 'laboral',
      'mercantil': 'empresarial',
      'familia': 'legal',
      'proteccion-datos': 'legal',
      'seguros': 'legal',
      'extranjeria': 'legal',
    };

    caseData = await Case.create({
      title: `Consulta ${serviceType || 'General'} - ${inviteeName}`,
      description: consulta || `Consulta agendada desde Calendly`,
      category: categoryMap[serviceType] || 'otro',
      clientId: client._id,
      advisorId: advisor ? advisor._id : null,
      status: 'nuevo',
    });
  }

  // Crear o actualizar la cita
  const appointment = await Appointment.findOneAndUpdate(
    { calendlyEventId },
    {
      caseId: caseData._id,
      clientId: client._id,
      advisorId: advisor ? advisor._id : null,
      scheduledDate,
      duration,
      type: 'videollamada',
      status: 'confirmada',
      calendlyEventId,
      notes: consulta || `Cita agendada desde Calendly. Servicio: ${serviceType || 'General'}`,
    },
    { upsert: true, new: true }
  );

  console.log(`✅ Cita creada desde Calendly: ${appointment._id} para ${inviteeEmail}`);
  
  return appointment;
}

// Manejar cancelación de cita en Calendly
async function handleAppointmentCanceled(event) {
  const payload = event.payload;
  const eventData = payload.event;
  const calendlyEventId = eventData.uuid;

  const appointment = await Appointment.findOne({ calendlyEventId });
  if (appointment) {
    appointment.status = 'cancelada';
    await appointment.save();
    console.log(`❌ Cita cancelada desde Calendly: ${appointment._id}`);
  }
}

// Manejar actualización de cita en Calendly
async function handleAppointmentUpdated(event) {
  const payload = event.payload;
  const eventData = payload.event;
  const calendlyEventId = eventData.uuid;

  const appointment = await Appointment.findOne({ calendlyEventId });
  if (appointment) {
    const scheduledDate = new Date(eventData.start_time);
    const endTime = new Date(eventData.end_time);
    const duration = Math.round((endTime - scheduledDate) / 1000 / 60);

    appointment.scheduledDate = scheduledDate;
    appointment.duration = duration;
    await appointment.save();
    console.log(`🔄 Cita actualizada desde Calendly: ${appointment._id}`);
  }
}

module.exports = router;

