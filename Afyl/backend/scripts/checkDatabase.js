require('dotenv').config();

const mongoURI = process.env.MONGODB_URI;

if (!mongoURI) {
  console.log('❌ MONGODB_URI no está definido en el archivo .env');
  process.exit(1);
}

// Extraer el nombre de la base de datos de la connection string
let dbName = 'No especificado';

if (mongoURI.includes('mongodb+srv://')) {
  // MongoDB Atlas
  const match = mongoURI.match(/mongodb\+srv:\/\/[^/]+\/([^?]+)/);
  if (match) {
    dbName = match[1];
  } else {
    dbName = 'Afyl (default)';
  }
} else if (mongoURI.includes('mongodb://')) {
  // MongoDB local
  const match = mongoURI.match(/mongodb:\/\/[^/]+\/([^?]+)/);
  if (match) {
    dbName = match[1];
  } else {
    dbName = 'Afyl (default)';
  }
}

console.log('📊 Configuración de base de datos:');
console.log('');
console.log('Connection string (ocultando contraseña):');
const hiddenURI = mongoURI.replace(/:([^:@]+)@/, ':****@');
console.log('   ' + hiddenURI);
console.log('');
console.log('Nombre de base de datos detectado:', dbName);
console.log('');

if (dbName.toLowerCase() !== 'afyl') {
  console.log('⚠️  PROBLEMA DETECTADO:');
  console.log('   La base de datos configurada es "' + dbName + '" pero debería ser "Afyl"');
  console.log('');
  console.log('💡 SOLUCIÓN:');
  console.log('   1. Abre el archivo backend/.env');
  console.log('   2. Busca la línea MONGODB_URI');
  console.log('   3. Asegúrate de que tenga /Afyl antes del ?');
  console.log('');
  console.log('   Ejemplo correcto:');
  console.log('   MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/Afyl?retryWrites=true&w=majority');
  console.log('');
  console.log('   4. Guarda el archivo y reinicia el servidor');
} else {
  console.log('✅ La base de datos está configurada correctamente como "Afyl"');
}

process.exit(0);

