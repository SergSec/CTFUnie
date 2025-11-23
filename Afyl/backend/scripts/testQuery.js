// Script para probar la query de login
const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const mongoURI = process.env.MONGODB_URI;

const testQuery = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log('✅ Conectado a MongoDB\n');

    const identifier = process.env.TEST_IDENTIFIER;
    const password = process.env.TEST_PASSWORD;

    if (!identifier || !password) {
      console.error('❌ TEST_IDENTIFIER o TEST_PASSWORD no están definidas en las variables de entorno.');
      process.exit(1);
    }

    // Probar la query exacta que usa el login
    const query = {
      $or: [
        { email: identifier.toLowerCase().trim() },
        { name: identifier.trim() }
      ]
    };

    console.log('Query:', JSON.stringify(query, null, 2));
    console.log('Buscando con identifier:', identifier);
    console.log('');

    const user = await User.findOne(query).select('+password');

    if (!user) {
      console.log('❌ Usuario NO encontrado');
      console.log('\nProbando búsqueda directa por email...');
      const userDirect = await User.findOne({ email: identifier.toLowerCase().trim() }).select('+password');
      if (userDirect) {
        console.log('✅ Usuario encontrado con búsqueda directa:', userDirect.email);
      } else {
        console.log('❌ Usuario NO encontrado ni con búsqueda directa');
      }
      process.exit(1);
    }

    console.log('✅ Usuario encontrado:');
    console.log('   Email:', user.email);
    console.log('   Nombre:', user.name);
    console.log('   Rol:', user.role);
    console.log('   Activo:', user.isActive);
    console.log('');

    // Probar contraseña
    const isMatch = await user.comparePassword(password);
    console.log(`Contraseña "${password}": ${isMatch ? '✅ Correcta' : '❌ Incorrecta'}`);

    if (isMatch) {
      console.log('\n✅ Login debería funcionar correctamente');
    } else {
      console.log('\n❌ La contraseña no coincide');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

testQuery();

