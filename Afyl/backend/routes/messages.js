const express = require('express');
const Message = require('../models/Message');
const Case = require('../models/Case');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/messages
// @desc    Create a new message
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { caseId, receiverId, content, attachments } = req.body;

    if (!caseId || !receiverId || !content) {
      return res.status(400).json({ message: 'Caso, receptor y contenido son requeridos' });
    }

    // Verify case exists
    const caseData = await Case.findById(caseId)
      .populate('clientId')
      .populate('advisorId');

    if (!caseData) {
      return res.status(404).json({ message: 'Caso no encontrado' });
    }

    // Authorization check - verify user is part of the case
    const isClient = caseData.clientId._id.toString() === req.user._id.toString();
    const isAdvisor = caseData.advisorId && caseData.advisorId._id.toString() === req.user._id.toString();

    if (!isClient && !isAdvisor && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'No autorizado para enviar mensajes en este caso' });
    }

    // Verify receiver is part of the case
    const receiverIsClient = caseData.clientId._id.toString() === receiverId;
    const receiverIsAdvisor = caseData.advisorId && caseData.advisorId._id.toString() === receiverId;

    if (!receiverIsClient && !receiverIsAdvisor && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'El receptor no está asociado a este caso' });
    }

    // Create message
    const message = await Message.create({
      caseId,
      senderId: req.user._id,
      receiverId,
      content,
      attachments: attachments || []
    });

    const populatedMessage = await Message.findById(message._id)
      .populate('senderId', 'name email role')
      .populate('receiverId', 'name email role')
      .populate('caseId', 'title');

    res.status(201).json({
      success: true,
      message: populatedMessage
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear mensaje', error: error.message });
  }
});

// @route   GET /api/messages/case/:caseId
// @desc    Get all messages for a case
// @access  Private
router.get('/case/:caseId', protect, async (req, res) => {
  try {
    const caseData = await Case.findById(req.params.caseId)
      .populate('clientId')
      .populate('advisorId');

    if (!caseData) {
      return res.status(404).json({ message: 'Caso no encontrado' });
    }

    // Authorization check
    const isClient = caseData.clientId._id.toString() === req.user._id.toString();
    const isAdvisor = caseData.advisorId && caseData.advisorId._id.toString() === req.user._id.toString();

    if (!isClient && !isAdvisor && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'No autorizado' });
    }

    const messages = await Message.find({ caseId: req.params.caseId })
      .populate('senderId', 'name email role profilePicture')
      .populate('receiverId', 'name email role')
      .populate('attachments')
      .sort({ createdAt: 1 });

    res.json({
      success: true,
      count: messages.length,
      messages
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener mensajes', error: error.message });
  }
});

// @route   GET /api/messages
// @desc    Get all messages for current user
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const query = {
      $or: [
        { senderId: req.user._id },
        { receiverId: req.user._id }
      ]
    };

    const messages = await Message.find(query)
      .populate('senderId', 'name email role')
      .populate('receiverId', 'name email role')
      .populate('caseId', 'title')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: messages.length,
      messages
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener mensajes', error: error.message });
  }
});

// @route   PUT /api/messages/:id/read
// @desc    Mark message as read
// @access  Private
router.put('/:id/read', protect, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ message: 'Mensaje no encontrado' });
    }

    // Only receiver can mark as read
    if (message.receiverId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'No autorizado' });
    }

    message.isRead = true;
    message.readAt = new Date();
    await message.save();

    res.json({
      success: true,
      message
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al marcar mensaje como leído', error: error.message });
  }
});

// @route   DELETE /api/messages/:id
// @desc    Delete message
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ message: 'Mensaje no encontrado' });
    }

    // Only sender can delete their message
    if (message.senderId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'No autorizado' });
    }

    await message.deleteOne();

    res.json({
      success: true,
      message: 'Mensaje eliminado exitosamente'
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar mensaje', error: error.message });
  }
});

module.exports = router;

