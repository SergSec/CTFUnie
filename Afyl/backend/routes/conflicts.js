const express = require('express');
const Conflict = require('../models/Conflict');
const Service = require('../models/Service');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

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

// @route   GET /api/conflicts/service/:serviceId
// @desc    Get all active conflicts for a service
// @access  Public
router.get('/service/:serviceId', async (req, res) => {
    try {
        // Check if service exists (by _id or id)
        let query;
        if (req.params.serviceId.match(/^[0-9a-fA-F]{24}$/)) {
            query = { $or: [{ _id: req.params.serviceId }, { id: req.params.serviceId }] };
        } else {
            query = { id: req.params.serviceId };
        }

        const service = await Service.findOne(query);

        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Servicio no encontrado'
            });
        }

        const conflicts = await Conflict.find({ service: service._id, isActive: true })
            .sort({ order: 1, createdAt: 1 });

        res.json({
            success: true,
            count: conflicts.length,
            data: conflicts
        });
    } catch (error) {
        // If invalid ObjectId, return empty list or 404
        if (error.kind === 'ObjectId') {
            return res.status(404).json({
                success: false,
                message: 'Servicio no encontrado'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Error al obtener conflictos',
            error: error.message
        });
    }
});

// @route   GET /api/conflicts/all/service/:serviceId
// @desc    Get all conflicts for a service (including inactive) - Admin only
// @access  Private/Admin
router.get('/all/service/:serviceId', protect, authorize('admin'), async (req, res) => {
    try {
        let query;
        if (req.params.serviceId.match(/^[0-9a-fA-F]{24}$/)) {
            query = { $or: [{ _id: req.params.serviceId }, { id: req.params.serviceId }] };
        } else {
            query = { id: req.params.serviceId };
        }

        const service = await Service.findOne(query);

        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Servicio no encontrado'
            });
        }

        const conflicts = await Conflict.find({ service: service._id })
            .sort({ order: 1, createdAt: 1 });

        res.json({
            success: true,
            count: conflicts.length,
            data: conflicts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener conflictos',
            error: error.message
        });
    }
});

// @route   POST /api/conflicts
// @desc    Create new conflict
// @access  Private/Admin
router.post('/', protect, authorize('admin'), async (req, res) => {
    try {
        const {
            title,
            description,
            serviceId,
            problems,
            order,
            isActive
        } = req.body;

        let query;
        if (serviceId.match(/^[0-9a-fA-F]{24}$/)) {
            query = { $or: [{ _id: serviceId }, { id: serviceId }] };
        } else {
            query = { id: serviceId };
        }

        const service = await Service.findOne(query);

        if (!service) {
            return res.status(400).json({
                success: false,
                message: 'El servicio especificado no existe'
            });
        }

        const conflict = await Conflict.create({
            title,
            description,
            service: service._id,
            problems: normalizeProblems(problems),
            order: order || 0,
            isActive: isActive !== undefined ? isActive : true
        });

        res.status(201).json({
            success: true,
            message: 'Conflicto creado exitosamente',
            data: conflict
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al crear conflicto',
            error: error.message
        });
    }
});

// @route   PUT /api/conflicts/:id
// @desc    Update conflict
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const {
            title,
            description,
            problems,
            order,
            isActive
        } = req.body;

        let conflict = await Conflict.findById(req.params.id);

        if (!conflict) {
            return res.status(404).json({
                success: false,
                message: 'Conflicto no encontrado'
            });
        }

        if (title !== undefined) conflict.title = title;
        if (description !== undefined) conflict.description = description;
        if (order !== undefined) conflict.order = order;
        if (isActive !== undefined) conflict.isActive = isActive;
        if (problems !== undefined) {
            conflict.problems = normalizeProblems(problems);
        }

        await conflict.save();

        res.json({
            success: true,
            message: 'Conflicto actualizado exitosamente',
            data: conflict
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al actualizar conflicto',
            error: error.message
        });
    }
});

// @route   DELETE /api/conflicts/:id
// @desc    Delete conflict
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const conflict = await Conflict.findByIdAndDelete(req.params.id);

        if (!conflict) {
            return res.status(404).json({
                success: false,
                message: 'Conflicto no encontrado'
            });
        }

        res.json({
            success: true,
            message: 'Conflicto eliminado permanentemente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al eliminar conflicto',
            error: error.message
        });
    }
});

module.exports = router;
