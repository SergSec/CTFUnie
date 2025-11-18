const express = require('express');
const Service = require('../models/Service');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/services
// @desc    Get all active services
// @access  Public
router.get('/', async (req, res) => {
  try {
    const services = await Service.find({ isActive: true }).sort({ order: 1, createdAt: 1 });
    res.json({
      success: true,
      count: services.length,
      data: services
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener servicios',
      error: error.message
    });
  }
});

// @route   GET /api/services/all
// @desc    Get all services (including inactive) - Admin only
// @access  Private/Admin
router.get('/all', protect, authorize('admin'), async (req, res) => {
  try {
    const services = await Service.find().sort({ order: 1, createdAt: 1 }).populate('createdBy', 'name email');
    res.json({
      success: true,
      count: services.length,
      data: services
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener servicios',
      error: error.message
    });
  }
});

// @route   GET /api/services/:id
// @desc    Get single service
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const service = await Service.findOne({ id: req.params.id });
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Servicio no encontrado'
      });
    }

    res.json({
      success: true,
      data: service
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener servicio',
      error: error.message
    });
  }
});

// @route   POST /api/services
// @desc    Create new service
// @access  Private/Admin
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { id, title, description, icon, order, isActive } = req.body;

    // Check if service with same id already exists
    const existingService = await Service.findOne({ id });
    if (existingService) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un servicio con ese ID'
      });
    }

    const service = await Service.create({
      id,
      title,
      description,
      icon,
      order: order || 0,
      isActive: isActive !== undefined ? isActive : true,
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Servicio creado exitosamente',
      data: service
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al crear servicio',
      error: error.message
    });
  }
});

// @route   PUT /api/services/:id
// @desc    Update service
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const { title, description, icon, order, isActive } = req.body;

    const service = await Service.findOne({ id: req.params.id });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Servicio no encontrado'
      });
    }

    // Update fields
    if (title !== undefined) service.title = title;
    if (description !== undefined) service.description = description;
    if (icon !== undefined) service.icon = icon;
    if (order !== undefined) service.order = order;
    if (isActive !== undefined) service.isActive = isActive;

    await service.save();

    res.json({
      success: true,
      message: 'Servicio actualizado exitosamente',
      data: service
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar servicio',
      error: error.message
    });
  }
});

// @route   DELETE /api/services/:id
// @desc    Delete service (soft delete - just marks as inactive)
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const service = await Service.findOne({ id: req.params.id });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Servicio no encontrado'
      });
    }

    // Soft delete - just mark as inactive
    service.isActive = false;
    await service.save();

    res.json({
      success: true,
      message: 'Servicio desactivado exitosamente',
      data: service
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar servicio',
      error: error.message
    });
  }
});

// @route   DELETE /api/services/:id/permanent
// @desc    Permanently delete service
// @access  Private/Admin
router.delete('/:id/permanent', protect, authorize('admin'), async (req, res) => {
  try {
    const service = await Service.findOneAndDelete({ id: req.params.id });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Servicio no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Servicio eliminado permanentemente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar servicio',
      error: error.message
    });
  }
});

module.exports = router;
