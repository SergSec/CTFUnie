const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const Consultation = require('../models/Consultation');
const Case = require('../models/Case');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const { sendEmail } = require('../utils/email');

const router = express.Router();

// Configurar multer para subida de archivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/consultations');
    
    // Crear directorio si no existe
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'consultation-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Tipos de archivo permitidos
  const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|xls|xlsx/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido. Solo se permiten imágenes, PDFs y documentos.'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB máximo por archivo
  },
  fileFilter: fileFilter
});

// @route   POST /api/consultations
// @desc    Create new consultation with optional files, create case and temporary user
// @access  Public
router.post('/', upload.array('archivos', 5), async (req, res) => {
  try {
    const { nombre, email, telefono, servicio, consulta } = req.body;

    // Validar campos requeridos
    if (!nombre || !email || !servicio || !consulta) {
      // Eliminar archivos subidos si la validación falla
      if (req.files) {
        req.files.forEach(file => {
          fs.unlinkSync(file.path);
        });
      }
      
      return res.status(400).json({
        success: false,
        message: 'Nombre, email, servicio y consulta son requeridos'
      });
    }

    // Verificar si ya existe un usuario con ese email
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser && !existingUser.isTemporary) {
      // Si existe y no es temporal, eliminar archivos y retornar error
      if (req.files) {
        req.files.forEach(file => {
          fs.unlinkSync(file.path);
        });
      }
      
      return res.status(400).json({
        success: false,
        message: 'Ya existe una cuenta con este email. Por favor, inicia sesión.'
      });
    }

    // Generar contraseña temporal
    const temporaryPassword = crypto.randomBytes(4).toString('hex'); // 8 caracteres aleatorios
    
    // Crear usuario temporal (válido 10 días)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 10);
    
    let tempUser;
    if (existingUser && existingUser.isTemporary) {
      // Si ya existe un usuario temporal, actualizarlo
      tempUser = existingUser;
      tempUser.name = nombre;
      tempUser.phone = telefono;
      tempUser.password = temporaryPassword;
      tempUser.temporaryPassword = temporaryPassword;
      tempUser.expiresAt = expiresAt;
      tempUser.isActive = true;
      tempUser.deleteAt = null;
      await tempUser.save();
    } else {
      // Crear nuevo usuario temporal
      tempUser = await User.create({
        name: nombre,
        email: email.toLowerCase(),
        phone: telefono,
        password: temporaryPassword,
        temporaryPassword: temporaryPassword,
        role: 'cliente',
        isTemporary: true,
        expiresAt: expiresAt,
        isActive: true
      });
    }

    // Procesar archivos subidos
    const archivos = req.files ? req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      path: file.path,
      mimetype: file.mimetype,
      size: file.size
    })) : [];

    // Crear caso
    const newCase = await Case.create({
      clientId: tempUser._id,
      title: `Consulta de ${servicio}`,
      description: consulta,
      category: 'otro',
      serviceType: servicio,
      status: 'pendiente_revision',
      priority: 'media'
    });

    // Crear consulta vinculada al caso y usuario
    const consultation = await Consultation.create({
      nombre,
      email: email.toLowerCase(),
      telefono,
      servicio,
      consulta,
      archivos,
      caseId: newCase._id,
      temporaryUserId: tempUser._id,
      status: 'pendiente'
    });

    // Actualizar usuario con el ID del caso
    tempUser.caseId = newCase._id;
    await tempUser.save();

    // Enviar email con credenciales temporales (si se puede)
    try {
      const subject = 'Tus credenciales temporales - Afyl';
      const html = `<p>Hola ${tempUser.name},</p>
        <p>Hemos recibido tu consulta y hemos creado una cuenta temporal para que puedas seguir el estado de tu caso.</p>
        <p><strong>Email:</strong> ${tempUser.email}<br/><strong>Contraseña temporal:</strong> ${temporaryPassword}</p>
        <p>La cuenta expira el ${expiresAt.toLocaleString()}.</p>
        <p>Si tu caso es aceptado por un asesor, tu cuenta será permanente y podrás acceder al panel de cliente.</p>
        <p>Saludos,<br/>Equipo Afyl</p>`;

      await sendEmail({ to: tempUser.email, subject, html, text: `Tu contraseña temporal: ${temporaryPassword}` });
    } catch (err) {
      console.error('Error enviando email de credenciales temporales:', err.message);
    }

    res.status(201).json({
      success: true,
      message: 'Consulta enviada exitosamente. Recibirás un email con tus credenciales de acceso.',
      data: {
        consultation,
        credentials: {
          email: tempUser.email,
          password: temporaryPassword,
          expiresAt: expiresAt
        },
        caseId: newCase._id
      }
    });
  } catch (error) {
    // Limpiar archivos en caso de error
    if (req.files) {
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error al crear consulta',
      error: error.message
    });
  }
});

// @route   GET /api/consultations
// @desc    Get all consultations (Admin/Asesor)
// @access  Private/Admin/Asesor
router.get('/', protect, authorize('admin', 'asesor'), async (req, res) => {
  try {
    const { status, servicio } = req.query;
    
    let query = {};
    if (status) query.status = status;
    if (servicio) query.servicio = servicio;

    const consultations = await Consultation.find(query)
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: consultations.length,
      data: consultations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener consultas',
      error: error.message
    });
  }
});

// @route   GET /api/consultations/download/:filename
// @desc    Download file by filename
// @access  Private/Admin/Asesor
router.get('/download/:filename', protect, authorize('admin', 'asesor'), async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '../uploads/consultations', filename);

    // Verificar que el archivo existe
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Archivo no encontrado'
      });
    }

    // Buscar la consulta que tiene este archivo para obtener el nombre original
    const consultation = await Consultation.findOne({
      'archivos.filename': filename
    });

    let originalName = filename;
    if (consultation) {
      const file = consultation.archivos.find(f => f.filename === filename);
      if (file) {
        originalName = file.originalName;
      }
    }

    res.download(filePath, originalName);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al descargar archivo',
      error: error.message
    });
  }
});

// @route   GET /api/consultations/:id
// @desc    Get single consultation
// @access  Private/Admin/Asesor
router.get('/:id', protect, authorize('admin', 'asesor'), async (req, res) => {
  try {
    const consultation = await Consultation.findById(req.params.id)
      .populate('assignedTo', 'name email role');

    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consulta no encontrada'
      });
    }

    res.json({
      success: true,
      data: consultation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener consulta',
      error: error.message
    });
  }
});

// @route   POST /api/consultations/client
// @desc    Create a follow-up consultation from an authenticated client (to request/confirm appointment)
// @access  Private (cliente)
router.post('/client', protect, authorize('cliente'), upload.array('archivos', 5), async (req, res) => {
  try {
    const { consulta, caseId, appointmentDate, servicio, telefono, notes } = req.body;

    // Cliente debe ser usuario permanente (no temporal)
    if (req.user.isTemporary) {
      return res.status(403).json({ success: false, message: 'Cuenta temporal. No puede agendar citas hasta que su caso sea aceptado.' });
    }

    // Validaciones básicas
    if (!consulta || (!caseId && !req.user.caseId)) {
      return res.status(400).json({ success: false, message: 'Se requiere la descripción de la consulta y el caso asociado.' });
    }

    const targetCaseId = caseId || req.user.caseId;
    const existingCase = await Case.findById(targetCaseId);
    if (!existingCase) {
      return res.status(404).json({ success: false, message: 'Caso no encontrado' });
    }

    // Crear entrada de consulta vinculada al caso y al usuario autenticado
    const archivos = req.files ? req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      path: file.path,
      mimetype: file.mimetype,
      size: file.size
    })) : [];

    const newConsultation = await Consultation.create({
      nombre: req.user.name,
      email: req.user.email,
      telefono: telefono || req.user.phone,
      servicio: servicio || existingCase.serviceType || 'otro',
      consulta,
      archivos,
      caseId: existingCase._id,
      temporaryUserId: null,
      status: 'pendiente',
      assignedTo: existingCase.advisorId || null,
      appointmentDate: appointmentDate || null,
      notes: notes || ''
    });

    // Si se provee fecha de cita, marcar caso como pendiente de cita
    if (appointmentDate) {
      existingCase.status = 'pendiente_cita';
      await existingCase.save();
    }

    res.status(201).json({ success: true, message: 'Solicitud enviada.', data: newConsultation });
  } catch (error) {
    // Limpiar archivos en caso de error
    if (req.files) {
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }
    res.status(500).json({ success: false, message: 'Error al crear la consulta', error: error.message });
  }
});

// @route   PUT /api/consultations/:id
// @desc    Update consultation
// @access  Private/Admin/Asesor
router.put('/:id', protect, authorize('admin', 'asesor'), async (req, res) => {
  try {
    const { status, assignedTo, notes, appointmentDate } = req.body;

    const consultation = await Consultation.findById(req.params.id);

    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consulta no encontrada'
      });
    }

    // Update fields
    if (status) consultation.status = status;
    if (assignedTo) consultation.assignedTo = assignedTo;
    if (notes !== undefined) consultation.notes = notes;
    if (appointmentDate) consultation.appointmentDate = appointmentDate;

    await consultation.save();

    res.json({
      success: true,
      message: 'Consulta actualizada exitosamente',
      data: consultation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar consulta',
      error: error.message
    });
  }
});

// @route   GET /api/consultations/:id/files/:fileId
// @desc    Download consultation file
// @access  Private/Admin/Asesor
router.get('/:id/files/:fileId', protect, authorize('admin', 'asesor'), async (req, res) => {
  try {
    const consultation = await Consultation.findById(req.params.id);

    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consulta no encontrada'
      });
    }

    const file = consultation.archivos.id(req.params.fileId);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'Archivo no encontrado'
      });
    }

    // Verificar que el archivo existe en el sistema
    if (!fs.existsSync(file.path)) {
      return res.status(404).json({
        success: false,
        message: 'Archivo no encontrado en el servidor'
      });
    }

    res.download(file.path, file.originalName);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al descargar archivo',
      error: error.message
    });
  }
});

// @route   DELETE /api/consultations/:id
// @desc    Delete consultation
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const consultation = await Consultation.findById(req.params.id);

    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consulta no encontrada'
      });
    }

    // Eliminar archivos asociados
    if (consultation.archivos && consultation.archivos.length > 0) {
      consultation.archivos.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }

    await consultation.deleteOne();

    res.json({
      success: true,
      message: 'Consulta eliminada exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar consulta',
      error: error.message
    });
  }
});

module.exports = router;
