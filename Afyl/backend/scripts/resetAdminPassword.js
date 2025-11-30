const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const mongoURI = process.env.MONGODB_URI;

const resetAdminPassword = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log('✅ Conectado a MongoDB\n');

    // Buscar el usuario admin@afyl.com
    const user = await User.findOne({ email: 'admin@afyl.com' });

    if (!user) {
      console.log('❌ Usuario admin@afyl.com NO encontrado');
      console.log('💡 Verificando otros usuarios admin...\n');
      
      const admins = await User.find({ role: 'admin' });
      if (admins.length > 0) {
        console.log('Usuarios admin encontrados:');
        admins.forEach(admin => {
          console.log(`   - ${admin.email} (${admin.name})`);
        });
      }
      process.exit(1);
    }

    console.log('✅ Usuario encontrado:');
    console.log('   Email:', user.email);
    console.log('   Nombre:', user.name);
    console.log('   Rol:', user.role);
    console.log('   Activo:', user.isActive);
    console.log('');

    // Nueva contraseña (puedes cambiarla aquí)
    const newPassword = 'YWRtaW4xMjMK'; // Cambia esto a la contraseña que quieras
    // NO hashear aquí - el modelo User tiene un pre-save hook que lo hace automáticamente
    
    // Actualizar la contraseña (el hook pre-save la hasheará)
    user.password = newPassword;
    await user.save();
    
    console.log('✅ Contraseña actualizada exitosamente');
    console.log('');
    console.log('📋 Credenciales de acceso:');
    console.log('   Email: admin@afyl.com');
    console.log('   Contraseña: YWRtaW4xMjMK');
    console.log('');
    console.log('💡 Ahora puedes hacer login con estas credenciales');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
};

resetAdminPassword();

