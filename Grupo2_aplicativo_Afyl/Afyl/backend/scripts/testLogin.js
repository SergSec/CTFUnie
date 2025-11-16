// Script para probar el login de usuarios administradores
const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const mongoURI = process.env.MONGODB_URI;

const testLogin = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log('✅ Conectado a MongoDB\n');

    // Buscar usuarios administradores
    const admins = await User.find({ role: 'admin' }).select('+password');
    
    console.log(`📊 Usuarios administradores encontrados: ${admins.length}\n`);
    
    if (admins.length === 0) {
      console.log('⚠️  No se encontraron usuarios administradores');
      console.log('💡 Ejecuta: npm run seed\n');
      process.exit(1);
    }

    for (const admin of admins) {
      console.log(`👤 Usuario: ${admin.name}`);
      console.log(`   Email: ${admin.email}`);
      console.log(`   Rol: ${admin.role}`);
      console.log(`   Activo: ${admin.isActive}`);
      
      // Probar contraseñas (se leen desde TEST_PASSWORDS, separados por comas)
      const testPasswords = process.env.TEST_PASSWORDS ? process.env.TEST_PASSWORDS.split(',').map(s => s.trim()).filter(Boolean) : [];
      if (testPasswords.length === 0) {
        console.log('   (No hay TEST_PASSWORDS definidas. Saltando comprobación de contraseñas.)');
      } else {
        for (const pwd of testPasswords) {
          const match = await admin.comparePassword(pwd);
          console.log(`   Contraseña "${pwd}": ${match ? '✅ Correcta' : '❌ Incorrecta'}`);
        }
      }
      console.log('');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

testLogin();

