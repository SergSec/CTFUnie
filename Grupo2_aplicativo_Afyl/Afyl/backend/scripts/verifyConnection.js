const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function verifyConnection() {
  try {
    console.log('🔍 Verificando conexión completa a MongoDB Atlas...\n');
    
    const mongoURI = process.env.MONGODB_URI;
    
    // Extraer info de la URI
    const hiddenURI = mongoURI.replace(/:([^:@]+)@/, ':****@');
    console.log('📍 URI de conexión:', hiddenURI);
    
    // Conectar usando las MISMAS opciones que server.js
    const connectionOptions = {
      dbName: 'Afyl' // Forzar el nombre de la base de datos
    };
    
    await mongoose.connect(mongoURI, connectionOptions);
    
    console.log('\n✅ Conexión exitosa');
    console.log('📊 Base de datos activa:', mongoose.connection.name);
    console.log('🔗 Cluster:', mongoose.connection.host);
    
    // Listar todas las colecciones
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\n📚 Colecciones disponibles en "Afyl":');
    for (const col of collections) {
      const count = await mongoose.connection.db.collection(col.name).countDocuments();
      console.log(`  ✓ ${col.name} (${count} documentos)`);
    }
    
    // Verificar usuarios específicamente
    const userCount = await User.countDocuments();
    console.log(`\n👥 Total de usuarios en la colección 'users': ${userCount}`);
    
    if (userCount > 0) {
      const users = await User.find({}, 'name email role isActive').limit(10);
      console.log('\n📋 Usuarios disponibles:');
      users.forEach((user, index) => {
        const status = user.isActive ? '✓' : '✗';
        console.log(`  ${index + 1}. ${status} ${user.name} (${user.email}) - ${user.role}`);
      });
      
      console.log('\n💡 Puedes usar cualquiera de estos usuarios para iniciar sesión');
      console.log('   (Usa el email como identificador)');
    } else {
      console.log('\n⚠️  No hay usuarios. Ejecuta: npm run seed');
    }
    
    // Verificar todas las bases de datos del cluster
    const admin = mongoose.connection.db.admin();
    const databases = await admin.listDatabases();
    console.log('\n🗄️  Bases de datos en el cluster:');
    databases.databases.forEach(db => {
      const size = (db.sizeOnDisk / 1024 / 1024).toFixed(2);
      const current = db.name === 'Afyl' ? ' ← USANDO ESTA' : '';
      console.log(`  - ${db.name} (${size} MB)${current}`);
    });
    
    console.log('\n✅ TODO CORRECTO - La aplicación está usando la base de datos "Afyl"');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\n💡 Verifica:');
    console.error('   1. El archivo backend/.env tiene MONGODB_URI correcto');
    console.error('   2. Tu IP está en la whitelist de MongoDB Atlas');
    console.error('   3. Las credenciales son correctas');
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado de MongoDB\n');
  }
}

verifyConnection();
