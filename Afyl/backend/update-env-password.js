// Script para actualizar la contraseña de MongoDB en el archivo .env
// Uso: node update-env-password.js "tu-contraseña-aquí"

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('=== Actualizador de Contraseña MongoDB ===\n');

// Obtener contraseña de los argumentos o pedirla
let password = process.argv[2];

if (!password) {
  rl.question('Ingresa la contraseña de MongoDB (se ocultará): ', (pwd) => {
    password = pwd;
    updateEnvFile(password);
    rl.close();
  });
} else {
  updateEnvFile(password);
  rl.close();
}

function updateEnvFile(password) {
  const envPath = path.join(__dirname, '.env');
  
  // Codificar la contraseña para URL
  const encodedPassword = encodeURIComponent(password);
  
  // Leer el archivo .env actual
  let envContent = '';
  try {
    envContent = fs.readFileSync(envPath, 'utf8');
  } catch (err) {
    console.error('❌ Error al leer el archivo .env:', err.message);
    process.exit(1);
  }
  
  // Reemplazar la contraseña en MONGODB_URI
  const uriPattern = /(MONGODB_URI=mongodb\+srv:\/\/[^:]+:)([^@]+)(@[^\s]+)/;
  
  if (uriPattern.test(envContent)) {
    envContent = envContent.replace(uriPattern, `$1${encodedPassword}$3`);
    fs.writeFileSync(envPath, envContent, 'utf8');
    console.log('✅ Archivo .env actualizado exitosamente');
    console.log(`   Contraseña codificada: ${encodedPassword.substring(0, 10)}...`);
    console.log('\n💡 Ahora puedes reiniciar el servidor con: npm run dev');
  } else {
    console.error('❌ No se pudo encontrar el patrón MONGODB_URI en el archivo .env');
    console.log('   Por favor, verifica que el archivo .env tenga el formato correcto');
    process.exit(1);
  }
}

