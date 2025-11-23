const express = require('express');
const Service = require('../models/Service');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

const buildServiceTree = (services) => {
  const nodes = new Map();

  services.forEach((serviceDoc) => {
    const service = serviceDoc.toObject({ virtuals: true });
    service.children = [];
    nodes.set(service._id.toString(), service);
  });

  const roots = [];

  nodes.forEach((service) => {
    if (service.parent) {
      const parentNode = nodes.get(service.parent.toString());
      if (parentNode) {
        parentNode.children.push(service);
      } else {
        roots.push(service);
      }
    } else {
      roots.push(service);
    }
  });

  const sortNodes = (items) =>
    items
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .map((item) => ({
        ...item,
        children: sortNodes(item.children || []),
      }));

  return sortNodes(roots);
};

const normalizeProblems = (problems = []) => {
  if (!Array.isArray(problems)) {
    return [];
  }

  const seenIds = new Set();
  return problems
    .filter((problem) => problem && (problem.label || problem.id))
    .map((problem, index) => {
      const normalizedId = (problem.id || problem.label || `problem-${index}`)
        .toString()
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-');

      const uniqueId = seenIds.has(normalizedId)
        ? `${normalizedId}-${index}`
        : normalizedId;
      seenIds.add(uniqueId);

      return {
        id: uniqueId,
        label: problem.label?.trim() || problem.id?.trim() || `Problema ${index + 1}`,
        description: problem.description?.trim() || '',
        order:
          typeof problem.order === 'number'
            ? problem.order
            : parseInt(problem.order, 10) || index,
        isActive: problem.isActive !== undefined ? problem.isActive : true,
      };
    });
};

// Normalize admin-configured form fields
const normalizeFormFields = (fields = []) => {
  if (!Array.isArray(fields)) return [];
  const seen = new Set();
  return fields
    .filter(f => f && (f.id || f.label))
    .map((f, idx) => {
      const id = (f.id || f.label || `field-${idx}`).toString().trim().toLowerCase().replace(/\s+/g, '-');
      const uniqueId = seen.has(id) ? `${id}-${idx}` : id;
      seen.add(uniqueId);
      return {
        id: uniqueId,
        label: (f.label || f.id || `Campo ${idx + 1}`).toString().trim(),
        type: ['text', 'textarea', 'select', 'checkbox'].includes(f.type) ? f.type : 'text',
        options: Array.isArray(f.options) ? f.options.map(o => o.toString()) : [],
        placeholder: f.placeholder ? f.placeholder.toString() : '',
        required: !!f.required,
        order: typeof f.order === 'number' ? f.order : parseInt(f.order, 10) || idx,
        isActive: f.isActive !== undefined ? !!f.isActive : true,
      };
    });
};

// @route   GET /api/services
// @desc    Get all active services
// @access  Public
router.get('/', async (req, res) => {
  try {
    const services = await Service.find({ isActive: true }).sort({ order: 1, createdAt: 1 });
    const format = req.query.format || 'flat';
    const data = format === 'tree' ? buildServiceTree(services) : services;

    res.json({
      success: true,
      count: services.length,
      data
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
    const services = await Service.find()
      .sort({ order: 1, createdAt: 1 })
      .populate('createdBy', 'name email');

    const format = req.query.format || 'flat';
    const data = format === 'tree' ? buildServiceTree(services) : services;

    res.json({
      success: true,
      count: services.length,
      data
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
    const {
      id,
      title,
      description,
      order,
      isActive,
      parentId,
      problems,
      tags,
      formFields,
    } = req.body;

    // Check if service with same id already exists
    const existingService = await Service.findOne({ id });
    if (existingService) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un servicio con ese ID'
      });
    }

    let parent = null;
    let level = 0;
    if (parentId) {
      parent = await Service.findOne({
        $or: [{ _id: parentId }, { id: parentId }],
      });

      if (!parent) {
        return res.status(400).json({
          success: false,
          message: 'El servicio padre especificado no existe',
        });
      }

      level = (parent.level || 0) + 1;
    }

    const service = await Service.create({
      id,
      title,
      description,
      order: order || 0,
      isActive: isActive !== undefined ? isActive : true,
      parent: parent ? parent._id : null,
      level,
      problems: normalizeProblems(problems),
      tags: Array.isArray(tags)
        ? tags.map((tag) => tag.toString().trim()).filter(Boolean)
        : [],
      formFields: normalizeFormFields(formFields),
      createdBy: req.user._id,
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
    const {
      title,
      description,
      order,
      isActive,
      parentId,
      problems,
      tags,
      id: newId,
      formFields,
    } = req.body;

    const service = await Service.findOne({ id: req.params.id });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Servicio no encontrado'
      });
    }

    // Update fields
    if (newId && newId !== service.id) {
      const idExists = await Service.findOne({ id: newId });
      if (idExists) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe un servicio con el nuevo ID proporcionado',
        });
      }
      service.id = newId;
    }

    if (title !== undefined) service.title = title;
    if (description !== undefined) service.description = description;
    if (order !== undefined) service.order = order;
    if (isActive !== undefined) service.isActive = isActive;
    if (Array.isArray(tags)) {
      service.tags = tags.map((tag) => tag.toString().trim()).filter(Boolean);
    }

    if (parentId !== undefined) {
      if (!parentId) {
        service.parent = null;
        service.level = 0;
      } else {
        const parent = await Service.findOne({
          $or: [{ _id: parentId }, { id: parentId }],
        });

        if (!parent) {
          return res.status(400).json({
            success: false,
            message: 'El servicio padre especificado no existe',
          });
        }

        if (parent._id.toString() === service._id.toString()) {
          return res.status(400).json({
            success: false,
            message: 'Un servicio no puede ser padre de sí mismo',
          });
        }

        service.parent = parent._id;
        service.level = (parent.level || 0) + 1;
      }
    }

    if (problems !== undefined) {
      service.problems = normalizeProblems(problems);
    }

    if (formFields !== undefined) {
      service.formFields = normalizeFormFields(formFields);
    }

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
