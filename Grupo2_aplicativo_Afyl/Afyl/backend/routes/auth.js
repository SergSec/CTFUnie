const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Validar que JWT_SECRET esté definido
const JWT_SECRET = process.env.JWT_SECRET || 'afyl_default_secret_key_change_in_production_2024';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';

if (!process.env.JWT_SECRET) {
  console.warn('⚠️  ADVERTENCIA: JWT_SECRET no está definido en .env. Usando clave por defecto (NO SEGURO PARA PRODUCCIÓN)');
  console.warn('💡 Agrega JWT_SECRET=tu_clave_secreta_muy_segura_aqui en tu archivo backend/.env');
}

// Generate JWT Token with role and login source
const generateToken = (id, role, loginSource = 'general') => {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET no está configurado');
  }
  return jwt.sign({ 
    id, 
    role, 
    loginSource,
    timestamp: Date.now() 
  }, JWT_SECRET, {
    expiresIn: JWT_EXPIRE
  });
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', [
  body('name').trim().notEmpty().withMessage('El nombre es requerido'),
  body('email').isEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('role').optional().isIn(['cliente', 'asesor', 'admin']).withMessage('Rol inválido')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, role, phone } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'El usuario ya existe' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'cliente',
      phone
    });

    const token = generateToken(user._id, user.role, 'register');

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al registrar usuario', error: error.message });
  }
});

// @route   POST /api/auth/login
// @desc    Login user with role-specific validation
// @access  Public
// WARNING: This endpoint is intentionally vulnerable to NoSQL injection for pentesting purposes
// DO NOT use this in production without proper sanitization
router.post('/login', async (req, res) => {
  try {
    const { identifier, password, loginSource } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ message: 'Email/Usuario y contraseña son requeridos' });
    }

    // Determine the expected role based on login source
    let expectedRole = null;
    if (loginSource === 'admin') {
      expectedRole = 'admin';
    } else if (loginSource === 'asesor') {
      expectedRole = 'asesor';
    } else if (loginSource === 'cliente') {
      expectedRole = 'cliente';
    }
    // If loginSource is not provided, allow any role (backward compatibility)

    // VULNERABLE: Direct use of user input without sanitization
    // This allows NoSQL injection attacks for pentesting
    // Example payload: {"identifier": {"$ne": null}, "password": {"$ne": null}}
    
    // Build query object directly from user input (VULNERABLE)
    let query = {};
    
    // Allow identifier to be an object (for NoSQL injection)
    if (typeof identifier === 'object') {
      query.$or = [
        { email: identifier },
        { name: identifier }
      ];
    } else {
      // Normal string input - search by email or name
      const identifierLower = typeof identifier === 'string' ? identifier.toLowerCase().trim() : identifier;
      query.$or = [
        { email: identifierLower },
        { name: identifier.trim() }
      ];
    }
    
    // VULNERABLE: Allow password to be an object (for NoSQL injection)
    // This bypasses password checking if password is an object
    let user = await User.findOne(query).select('+password');
    
    if (!user) {
      console.log('Login failed: User not found with identifier:', identifier);
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Check if user is active
    if (!user.isActive) {
      console.log('Login failed: User is inactive:', user.email);
      return res.status(401).json({ message: 'Usuario inactivo' });
    }

    // VULNERABLE: If password is an object, skip password verification
    // This allows bypassing password check with NoSQL injection
    if (typeof password === 'object') {
      // NoSQL injection: password check bypassed
      // Example: {"password": {"$ne": null}} will bypass password check
    } else {
      // Normal password check
      if (typeof password !== 'string') {
        return res.status(400).json({ message: 'Contraseña inválida' });
      }
      
      // Verificar que la contraseña del usuario existe y está hasheada
      if (!user.password) {
        console.log('Login failed: User has no password stored');
        return res.status(401).json({ message: 'Credenciales inválidas' });
      }
      
      // Verificar que la contraseña está hasheada (debe empezar con $2a$)
      const isHashed = user.password.startsWith('$2a$') || user.password.startsWith('$2b$') || user.password.startsWith('$2y$');
      if (!isHashed) {
        console.log('Login failed: Password is not hashed (stored in plain text)');
        console.log('Password type:', typeof user.password);
        console.log('Password length:', user.password ? user.password.length : 0);
        // Si la contraseña no está hasheada, comparar directamente (solo para debugging)
        if (user.password === password) {
          console.log('⚠️  WARNING: Password matches but is stored in plain text. This should be hashed!');
          // No permitir login con contraseña en texto plano por seguridad
          return res.status(401).json({ message: 'Credenciales inválidas. La contraseña necesita ser actualizada.' });
        }
        return res.status(401).json({ message: 'Credenciales inválidas' });
      }
      
      // Comparar contraseña usando bcrypt
      const isMatch = await user.comparePassword(password);
      
      if (!isMatch) {
        console.log('Login failed: Password does not match for user:', user.email);
        return res.status(401).json({ message: 'Credenciales inválidas' });
      }
      console.log('Password verified successfully for user:', user.email);
    }

    // Allow all roles (cliente, asesor, admin) to login
    // Frontend will handle routing based on role
    const userRole = user.role ? user.role.trim().toLowerCase() : '';
    
    // Validate if user is trying to access from the correct login page
    if (expectedRole && userRole !== expectedRole) {
      console.log(`Login failed: User role "${userRole}" does not match expected role "${expectedRole}" for login source`);
      return res.status(403).json({ 
        message: `Este formulario de acceso es exclusivo para ${expectedRole}s. Por favor, usa el formulario de inicio de sesión correcto para tu rol.`,
        wrongLoginSource: true,
        userRole: userRole
      });
    }
    
    console.log(`Login successful - User role: "${user.role}" for user: ${user.email} from source: ${loginSource || 'general'}`);

    // Generar token JWT con información del rol y origen de login
    let token;
    try {
      token = generateToken(user._id, user.role, loginSource || 'general');
    } catch (tokenError) {
      console.error('Error generating token:', tokenError);
      return res.status(500).json({ 
        message: 'Error al generar token de autenticación', 
        error: tokenError.message 
      });
    }

    console.log('✅ Login successful for user:', user.email, 'with role:', user.role);

    // Set httpOnly cookie for advisors and admins so session persists on page reload
    try {
      const roleLower = (user.role || '').toString().toLowerCase();
      const shouldSetCookie = roleLower === 'asesor' || roleLower === 'admin';

      // Calculate cookie maxAge from JWT_EXPIRE (basic parser for days 'Nd')
      let maxAgeMs = 7 * 24 * 60 * 60 * 1000; // default 7 days
      if (JWT_EXPIRE && typeof JWT_EXPIRE === 'string' && JWT_EXPIRE.endsWith('d')) {
        const days = parseInt(JWT_EXPIRE.replace('d', ''), 10);
        if (!isNaN(days)) maxAgeMs = days * 24 * 60 * 60 * 1000;
      }

      if (shouldSetCookie) {
        res.cookie('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: maxAgeMs
        });
      }
    } catch (cookieErr) {
      console.error('Error setting auth cookie:', cookieErr);
    }

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error al iniciar sesión', error: error.message });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout and clear cookie
// @access  Private
router.post('/logout', protect, async (req, res) => {
  try {
    res.clearCookie('token');
    res.json({ success: true, message: 'Sesión cerrada' });
  } catch (error) {
    res.status(500).json({ message: 'Error al cerrar sesión', error: error.message });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener usuario', error: error.message });
  }
});

module.exports = router;

