const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

// Obtener JWT_SECRET con valor por defecto si no está definido
const JWT_SECRET = process.env.JWT_SECRET || 'afyl_default_secret_key_change_in_production_2024';

// Verify JWT token
exports.protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'No autorizado, token no proporcionado' });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        return res.status(401).json({ message: 'Usuario no encontrado' });
      }

      if (!req.user.isActive) {
        return res.status(401).json({ message: 'Usuario inactivo' });
      }

      next();
    } catch (error) {
      return res.status(401).json({ message: 'Token inválido' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error en la autenticación', error: error.message });
  }
};

// Role-based authorization
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `El rol ${req.user.role} no tiene permisos para acceder a este recurso` 
      });
    }
    next();
  };
};

// Audit logging middleware
exports.logAction = async (action, entityType, entityId = null, details = {}) => {
  try {
    await AuditLog.create({
      userId: this.userId || null,
      action,
      entityType,
      entityId,
      details,
      ipAddress: this.ipAddress || null,
      userAgent: this.userAgent || null
    });
  } catch (error) {
    console.error('Error al crear log de auditoría:', error);
  }
};

