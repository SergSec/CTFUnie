const express = require('express');
const User = require('../models/User');
const router = express.Router();

// WARNING: These endpoints are for development/pentesting only
// DO NOT use in production

// @route   POST /api/dev/create-admin
// @desc    Create admin user for pentesting
// @access  Public (ONLY FOR DEVELOPMENT)
router.post('/create-admin', async (req, res) => {
  try {
    // For safety we no longer expose literal credentials in code.
    // Provide DEV_ADMIN_EMAIL and DEV_ADMIN_PASSWORD via environment variables if you want a predictable account.
    const devAdminEmail = process.env.DEV_ADMIN_EMAIL;
    const devAdminPassword = process.env.DEV_ADMIN_PASSWORD; // optional

    if (!devAdminEmail) {
      return res.status(400).json({ success: false, message: 'DEV_ADMIN_EMAIL no está definida. No se crean cuentas por seguridad.' });
    }

    const adminExists = await User.findOne({ email: devAdminEmail.toLowerCase().trim() });
    if (adminExists) {
      return res.json({ success: true, message: 'Usuario administrador ya existe', id: adminExists._id });
    }

    const admin = await User.create({
      name: process.env.DEV_ADMIN_NAME || 'Administrador',
      email: devAdminEmail.toLowerCase().trim(),
      password: devAdminPassword || require('crypto').randomBytes(12).toString('hex'),
      role: 'admin',
      phone: process.env.DEV_ADMIN_PHONE || '123456789',
      isActive: true
    });

    res.json({ success: true, message: 'Usuario administrador creado exitosamente', id: admin._id });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error al crear usuario administrador', 
      error: error.message 
    });
  }
});

// @route   POST /api/dev/create-test-users
// @desc    Create test users for pentesting
// @access  Public (ONLY FOR DEVELOPMENT)
router.post('/create-test-users', async (req, res) => {
  try {
    const users = [];
    // For safety, test users are created only if corresponding DEV_*_EMAIL env vars exist.
    const toCreate = [
      { envEmail: process.env.DEV_ADMIN_EMAIL, name: process.env.DEV_ADMIN_NAME || 'Administrador', role: 'admin', phone: process.env.DEV_ADMIN_PHONE },
      { envEmail: process.env.DEV_ADVISOR_EMAIL, name: 'Asesor Test', role: 'asesor', phone: process.env.DEV_ADVISOR_PHONE, extra: { specialization: process.env.DEV_ADVISOR_SPECIALIZATION } },
      { envEmail: process.env.DEV_CLIENT_EMAIL, name: 'Cliente Test', role: 'cliente', phone: process.env.DEV_CLIENT_PHONE },
      { envEmail: process.env.DEV_VULNERABLE_EMAIL, name: 'Usuario Vulnerable', role: 'cliente', phone: process.env.DEV_VULNERABLE_PHONE }
    ];

    for (const item of toCreate) {
      if (!item.envEmail) continue; // skip if env var not provided
      const email = item.envEmail.toLowerCase().trim();
      let u = await User.findOne({ email });
      if (!u) {
        u = await User.create({
          name: item.name,
          email,
          password: process.env.DEV_DEFAULT_PASSWORD || require('crypto').randomBytes(12).toString('hex'),
          role: item.role,
          phone: item.phone || '',
          isActive: true,
          ...(item.extra || {})
        });
        users.push({ role: item.role, id: u._id }); // do NOT include password/email
      } else {
        users.push({ role: item.role, id: u._id, exists: true });
      }
    }

    res.json({ success: true, message: 'Usuarios de prueba creados/validados (no se exponen contraseñas)', users });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error al crear usuarios de prueba', 
      error: error.message 
    });
  }
});

// @route   GET /api/dev/test-credentials
// @desc    Get test credentials for pentesting
// @access  Public (ONLY FOR DEVELOPMENT)
router.get('/test-credentials', async (req, res) => {
  try {
    // For safety we do not expose passwords or emails here. The endpoint reports whether env-defined test users exist in DB.
    const credsEnv = {
      admin: process.env.DEV_ADMIN_EMAIL,
      advisor: process.env.DEV_ADVISOR_EMAIL,
      client: process.env.DEV_CLIENT_EMAIL,
      vulnerable: process.env.DEV_VULNERABLE_EMAIL
    };

    const existingUsers = {};
    for (const [key, email] of Object.entries(credsEnv)) {
      if (!email) {
        existingUsers[key] = { exists: false, note: 'no definido en variables de entorno' };
        continue;
      }
      const user = await User.findOne({ email: email.toLowerCase().trim() });
      existingUsers[key] = { exists: !!user, role: key };
    }

    res.json({ success: true, credentials: existingUsers, note: 'No se exponen emails/contraseñas en este endpoint.' });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error al obtener credenciales', 
      error: error.message 
    });
  }
});

module.exports = router;

