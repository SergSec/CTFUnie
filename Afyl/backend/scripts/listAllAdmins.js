const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const mongoURI = process.env.MONGODB_URI;

const listAllAdmins = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log('✅ Conectado a MongoDB');
    console.log('📊 Base de datos:', mongoose.connection.name);
    console.log('');

    // Buscar todos los usuarios admin
    const admins = await User.find({ role: 'admin' });
    
    console.log(`📊 Usuarios administradores encontrados: ${admins.length}\n`);
    
    if (admins.length === 0) {
      console.log('⚠️  No se encontraron usuarios administradores');
      console.log('💡 Buscando todos los usuarios...\n');
      
      const allUsers = await User.find({});
      console.log(`Total de usuarios en la base de datos: ${allUsers.length}`);
      allUsers.forEach(user => {
        console.log(`   - ${user.email} (${user.name}) - Rol: ${user.role}`);
      });
      process.exit(1);
    }

    console.log('👥 Usuarios administradores:');
    console.log('');
    
    for (const admin of admins) {
      console.log(`📧 Email: ${admin.email}`);
      console.log(`   Nombre: ${admin.name}`);
      console.log(`   ID: ${admin._id}`);
      console.log(`   Rol: ${admin.role}`);
      console.log(`   Activo: ${admin.isActive}`);
      console.log(`   Contraseña hasheada: ${admin.password ? 'Sí (bcrypt)' : 'No'}`);
      if (admin.password && !admin.password.startsWith('$2a$')) {
        console.log(`   ⚠️  PROBLEMA: La contraseña NO está hasheada!`);
      }
      console.log('');
    }

    // Buscar específicamente admin@afyl.com
    const adminAfyl = await User.findOne({ 
      $or: [
        { email: 'admin@afyl.com' },
        { email: 'admin@afyl.com'.toLowerCase() },
        { email: 'admin@afyl.com'.toUpperCase() }
      ]
    });
    
    if (adminAfyl) {
      console.log('✅ Usuario admin@afyl.com encontrado:');
      console.log('   Email exacto:', adminAfyl.email);
      console.log('   Nombre:', adminAfyl.name);
    } else {
      console.log('⚠️  Usuario admin@afyl.com NO encontrado con búsqueda exacta');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
};

listAllAdmins();

