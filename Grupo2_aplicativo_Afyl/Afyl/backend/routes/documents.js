const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Document = require('../models/Document');
const Case = require('../models/Case');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  }
});

const fileFilter = (req, file, cb) => {
  // Allow only specific file types
  const allowedTypes = /jpeg|jpg|png|pdf|doc|docx|xls|xlsx|txt/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido. Solo se permiten: jpeg, jpg, png, pdf, doc, docx, xls, xlsx, txt'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760 // 10MB default
  },
  fileFilter: fileFilter
});

// @route   POST /api/documents
// @desc    Upload a document
// @access  Private
router.post('/', protect, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No se ha subido ningún archivo' });
    }

    const { caseId, description, isConfidential } = req.body;

    if (!caseId) {
      // Delete uploaded file if caseId is missing
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: 'El ID del caso es requerido' });
    }

    // Verify case exists and user has access
    const caseData = await Case.findById(caseId);
    if (!caseData) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ message: 'Caso no encontrado' });
    }

    // Authorization check
    if (req.user.role === 'cliente' && caseData.clientId.toString() !== req.user._id.toString()) {
      fs.unlinkSync(req.file.path);
      return res.status(403).json({ message: 'No autorizado' });
    }

    if (req.user.role === 'asesor' && caseData.advisorId && caseData.advisorId.toString() !== req.user._id.toString()) {
      fs.unlinkSync(req.file.path);
      return res.status(403).json({ message: 'No autorizado' });
    }

    // Create document record
    const document = await Document.create({
      caseId,
      uploadedBy: req.user._id,
      fileName: req.file.filename,
      originalName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      filePath: req.file.path,
      description,
      isConfidential: isConfidential !== undefined ? isConfidential : true
    });

    // Add document to case
    caseData.documents.push(document._id);
    await caseData.save();

    res.status(201).json({
      success: true,
      document
    });
  } catch (error) {
    // Delete uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: 'Error al subir documento', error: error.message });
  }
});

// @route   GET /api/documents/case/:caseId
// @desc    Get all documents for a case
// @access  Private
router.get('/case/:caseId', protect, async (req, res) => {
  try {
    const caseData = await Case.findById(req.params.caseId);

    if (!caseData) {
      return res.status(404).json({ message: 'Caso no encontrado' });
    }

    // Authorization check
    if (req.user.role === 'cliente' && caseData.clientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'No autorizado' });
    }

    if (req.user.role === 'asesor' && caseData.advisorId && caseData.advisorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'No autorizado' });
    }

    const documents = await Document.find({ caseId: req.params.caseId })
      .populate('uploadedBy', 'name email')
      .sort({ uploadedAt: -1 });

    res.json({
      success: true,
      count: documents.length,
      documents
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener documentos', error: error.message });
  }
});

// @route   GET /api/documents/:id
// @desc    Get document by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id).populate('caseId');

    if (!document) {
      return res.status(404).json({ message: 'Documento no encontrado' });
    }

    const caseData = document.caseId;

    // Authorization check
    if (req.user.role === 'cliente' && caseData.clientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'No autorizado' });
    }

    if (req.user.role === 'asesor' && caseData.advisorId && caseData.advisorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'No autorizado' });
    }

    res.json({
      success: true,
      document
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener documento', error: error.message });
  }
});

// @route   GET /api/documents/:id/download
// @desc    Download document file
// @access  Private
router.get('/:id/download', protect, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id).populate('caseId');

    if (!document) {
      return res.status(404).json({ message: 'Documento no encontrado' });
    }

    const caseData = document.caseId;

    // Authorization check
    if (req.user.role === 'cliente' && caseData.clientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'No autorizado' });
    }

    if (req.user.role === 'asesor' && caseData.advisorId && caseData.advisorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'No autorizado' });
    }

    if (!fs.existsSync(document.filePath)) {
      return res.status(404).json({ message: 'Archivo no encontrado en el servidor' });
    }

    res.download(document.filePath, document.originalName);
  } catch (error) {
    res.status(500).json({ message: 'Error al descargar documento', error: error.message });
  }
});

// @route   DELETE /api/documents/:id
// @desc    Delete document
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id).populate('caseId');

    if (!document) {
      return res.status(404).json({ message: 'Documento no encontrado' });
    }

    const caseData = document.caseId;

    // Only client or advisor can delete
    if (req.user.role === 'cliente' && caseData.clientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'No autorizado' });
    }

    if (req.user.role === 'asesor' && caseData.advisorId && caseData.advisorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'No autorizado' });
    }

    // Delete file from filesystem
    if (fs.existsSync(document.filePath)) {
      fs.unlinkSync(document.filePath);
    }

    // Remove from case
    await Case.findByIdAndUpdate(caseData._id, {
      $pull: { documents: document._id }
    });

    // Delete document record
    await document.deleteOne();

    res.json({
      success: true,
      message: 'Documento eliminado exitosamente'
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar documento', error: error.message });
  }
});

module.exports = router;

