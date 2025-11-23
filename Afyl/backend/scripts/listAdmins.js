const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const mongoURI = process.env.MONGODB_URI;

const listAdmins = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log('✅ Conectado a MongoDB\n');

    // Buscar todos los usuarios admin
    const admins = await User.find({ role: 'admin' });
    
    console.log(`📊 Usuarios administradores encontrados: ${admins.length}\n`);
    
    if (admins.length === 0) {
      console.log('⚠️  No se encontraron usuarios administradores');
      process.exit(1);
    }

    for (const admin of admins) {
      console.log(`👤 Usuario:`);
      console.log(`   ID: ${admin._id}`);
      console.log(`   Nombre: ${admin.name}`);
      console.log(`   Email: ${admin.email}`);
      console.log(`   Rol: ${admin.role}`);
      console.log(`   Activo: ${admin.isActive}`);
      console.log(`   Contraseña (tipo): ${admin.password ? 'Hash bcrypt' : 'No definida'}`);
      if (admin.password && !admin.password.startsWith('$2a$')) {
        console.log(`   ⚠️  PROBLEMA: La contraseña NO está hasheada!`);
      }
      console.log('');
    }

    // Buscar el usuario específico
    const pruebaUser = await User.findOne({ email: 'prueba@gmail.com' });
    if (pruebaUser) {
      console.log('🔍 Usuario prueba@gmail.com encontrado:');
      console.log('   Contraseña (primeros 50 chars):', pruebaUser.password ? pruebaUser.password.substring(0, 50) : 'null');
      if (pruebaUser.password && !pruebaUser.password.startsWith('$2a$')) {
        console.log('   ⚠️  PROBLEMA: La contraseña NO está hasheada!');
        console.log('   💡 Necesitas hashear esta contraseña para que funcione el login');
      }
    } else {
      console.log('⚠️  Usuario prueba@gmail.com NO encontrado');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

listAdmins();

