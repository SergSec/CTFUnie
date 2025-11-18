const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Consultation = require('../models/Consultation');
const { protect, authorize } = require('../middleware/auth');

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
// @desc    Create new consultation with optional files
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

    // Procesar archivos subidos
    const archivos = req.files ? req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      path: file.path,
      mimetype: file.mimetype,
      size: file.size
    })) : [];

    // Crear consulta
    const consultation = await Consultation.create({
      nombre,
      email,
      telefono,
      servicio,
      consulta,
      archivos
    });

    res.status(201).json({
      success: true,
      message: 'Consulta enviada exitosamente',
      data: consultation
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
