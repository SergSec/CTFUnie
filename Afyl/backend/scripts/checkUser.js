const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const mongoURI = process.env.MONGODB_URI;

const checkUser = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log('✅ Conectado a MongoDB\n');

    // Obtener el email o nombre del usuario desde los argumentos de línea de comandos
    const identifier = process.argv[2];

    if (!identifier) {
      console.error('❌ Por favor, proporciona un email o nombre de usuario como argumento');
      console.error('Uso: node scripts/checkUser.js <email_o_nombre>');
      process.exit(1);
    }

    // Buscar usuario por email o nombre
    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase().trim() },
        { name: identifier.trim() }
      ]
    });

    if (!user) {
      console.log('❌ Usuario NO encontrado');
      process.exit(1);
    }

    console.log('✅ Usuario encontrado:');
    console.log('   ID:', user._id);
    console.log('   Nombre:', user.name);
    console.log('   Email:', user.email);
    console.log('   Rol:', user.role);
    console.log('   Rol (tipo):', typeof user.role);
    console.log('   Rol (longitud):', user.role ? user.role.length : 0);
    console.log('   Rol (normalizado):', user.role ? user.role.trim().toLowerCase() : 'null');
    console.log('   Activo:', user.isActive);
    console.log('   Creado:', user.createdAt);
    console.log('');

    // Verificar si el rol es válido para login
    const normalizedRole = user.role ? user.role.trim().toLowerCase() : '';
    if (normalizedRole === 'admin' || normalizedRole === 'asesor') {
      console.log('✅ El usuario PUEDE hacer login en el panel de administración');
    } else {
      console.log('❌ El usuario NO puede hacer login en el panel de administración');
      console.log('   Solo usuarios con rol "admin" o "asesor" pueden acceder');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

checkUser();

