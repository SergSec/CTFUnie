const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const mongoURI = process.env.MONGODB_URI;

const fixPassword = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log('✅ Conectado a MongoDB\n');

    // Buscar el usuario con email prueba@gmail.com
    const user = await User.findOne({ email: 'prueba@gmail.com' });

    if (!user) {
      console.log('❌ Usuario no encontrado');
      process.exit(1);
    }

    console.log('Usuario encontrado:');
    console.log('   Email:', user.email);
    console.log('   Nombre:', user.name);
    console.log('   Rol:', user.role);
    console.log('   Contraseña actual (primeros 20 chars):', user.password ? user.password.substring(0, 20) : 'null');
    console.log('');

    // Si la contraseña no está hasheada (no empieza con $2a$), la hasheamos
    if (!user.password || !user.password.startsWith('$2a$')) {
      console.log('⚠️  La contraseña no está hasheada. Hasheando...');
      const plainPassword = user.password || '123'; // Usar "123" como default si está vacía
      const hashedPassword = await bcrypt.hash(plainPassword, 10);
      
      // Actualizar la contraseña
      user.password = hashedPassword;
      await user.save();
      
      console.log('✅ Contraseña hasheada y actualizada correctamente');
      console.log('   Nueva contraseña (hash):', hashedPassword.substring(0, 30) + '...');
      console.log('');
      console.log('💡 Ahora puedes hacer login con:');
      console.log('   Email: prueba@gmail.com');
      console.log('   Contraseña: 123');
    } else {
      console.log('✅ La contraseña ya está hasheada correctamente');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

fixPassword();

