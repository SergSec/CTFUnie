const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const mongoURI = process.env.MONGODB_URI;

const fixAllPasswords = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log('✅ Conectado a MongoDB\n');

    // Buscar todos los usuarios
    const users = await User.find({}).select('+password');
    
    console.log(`📊 Total de usuarios encontrados: ${users.length}\n`);

    let fixedCount = 0;

    for (const user of users) {
      // Verificar si la contraseña no está hasheada (no empieza con $2a$)
      if (user.password && !user.password.startsWith('$2a$')) {
        console.log(`⚠️  Usuario con contraseña sin hash encontrado:`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Nombre: ${user.name}`);
        console.log(`   Rol: ${user.role}`);
        console.log(`   Contraseña actual (texto plano): ${user.password}`);
        
        // Hashear la contraseña
        const plainPassword = user.password;
        const hashedPassword = await bcrypt.hash(plainPassword, 10);
        
        // Actualizar la contraseña
        user.password = hashedPassword;
        await user.save();
        
        console.log(`   ✅ Contraseña hasheada y actualizada`);
        console.log(`   💡 Ahora puedes hacer login con:`);
        console.log(`      Email: ${user.email}`);
        console.log(`      Contraseña: ${plainPassword}`);
        console.log('');
        
        fixedCount++;
      }
    }

    if (fixedCount === 0) {
      console.log('✅ Todos los usuarios tienen contraseñas hasheadas correctamente');
    } else {
      console.log(`✅ Se corrigieron ${fixedCount} usuario(s)`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
};

fixAllPasswords();

