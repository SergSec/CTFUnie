const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Configure multer for profile picture uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/profiles');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `profile-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes: jpeg, jpg, png'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5242880 }, // 5MB
  fileFilter: fileFilter
});

// @route   GET /api/users
// @desc    Get all users (admin only)
// @access  Private
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { role } = req.query;
    const filter = role ? { role } : {};
    
    const users = await User.find(filter).select('-password');
    res.json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener usuarios', error: error.message });
  }
});

// @route   POST /api/users
// @desc    Create user (admin only)
// @access  Private
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role = 'asesor',
      phone,
      specialization,
      address
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Nombre, email y contraseña son requeridos' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'El email ya está registrado' });
    }

    const allowedRoles = ['asesor', 'admin'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: 'Rol inválido para creación manual' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      phone,
      specialization,
      address
    });

    const sanitizedUser = user.toObject();
    delete sanitizedUser.password;

    res.status(201).json({
      success: true,
      user: sanitizedUser
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear usuario', error: error.message });
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Users can only see their own profile unless they're admin/advisor
    if (req.user.role !== 'admin' && req.user.role !== 'asesor' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ message: 'No autorizado' });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener usuario', error: error.message });
  }
});

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const isSelf = req.user._id.toString() === req.params.id;
    const isAdmin = req.user.role === 'admin';

    if (!isSelf && !isAdmin) {
      return res.status(403).json({ message: 'No autorizado para actualizar este usuario' });
    }

    const user = await User.findById(req.params.id).select('+password');

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const {
      name,
      phone,
      address,
      specialization,
      role,
      email,
      isActive,
      password
    } = req.body;

    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;
    if (specialization !== undefined && (user.role === 'asesor' || isAdmin)) {
      user.specialization = specialization;
    }

    if (isAdmin) {
      if (role !== undefined) user.role = role;
      if (email !== undefined && email !== user.email) {
        const emailExists = await User.findOne({ email });
        if (emailExists && emailExists._id.toString() !== user._id.toString()) {
          return res.status(400).json({ message: 'El email ya está registrado' });
        }
        user.email = email;
      }
      if (isActive !== undefined) user.isActive = isActive;
      if (password) {
        user.password = password;
      }
    }

    await user.save();

    const sanitizedUser = user.toObject();
    delete sanitizedUser.password;

    res.json({
      success: true,
      user: sanitizedUser
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar usuario', error: error.message });
  }
});

// @route   POST /api/users/:id/profile-picture
// @desc    Upload profile picture
// @access  Private
router.post('/:id/profile-picture', protect, upload.single('profilePicture'), async (req, res) => {
  try {
    // Users can only update their own profile unless they're admin
    if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(403).json({ message: 'No autorizado' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No se ha subido ninguna imagen' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Delete old profile picture if exists
    if (user.profilePicture) {
      const oldPath = path.join(__dirname, '../uploads/profiles', path.basename(user.profilePicture));
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    // Update user with new profile picture path
    user.profilePicture = `/uploads/profiles/${req.file.filename}`;
    await user.save();

    res.json({
      success: true,
      user: {
        ...user.toObject(),
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: 'Error al subir foto de perfil', error: error.message });
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete user (soft delete)
// @access  Private (Admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json({
      success: true,
      message: 'Usuario desactivado exitosamente'
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar usuario', error: error.message });
  }
});

module.exports = router;

