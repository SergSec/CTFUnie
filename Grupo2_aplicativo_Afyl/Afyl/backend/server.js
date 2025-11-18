const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/cases', require('./routes/cases'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/chatbot', require('./routes/chatbot'));
app.use('/api/calendly', require('./routes/calendly'));
app.use('/api/services', require('./routes/services'));
app.use('/api/consultations', require('./routes/consultations'));
// Development routes (ONLY FOR PENTESTING/DEV)
if (process.env.NODE_ENV !== 'production') {
  app.use('/api/dev', require('./routes/dev'));
}

// MongoDB Connection
const mongoURI = process.env.MONGODB_URI;

if (!mongoURI) {
  console.error('❌ ERROR: MONGODB_URI no está definido en el archivo .env');
  console.error('Por favor, crea el archivo backend/.env con tu connection string de MongoDB Atlas');
  process.exit(1);
}

// Forzar la conexión a la base de datos "Afyl" usando la opción dbName
// Esto asegura que siempre se conecte a "Afyl" sin importar qué tenga la connection string
const connectionOptions = {
  dbName: 'Afyl' // Forzar el nombre de la base de datos
};

mongoose.connect(mongoURI, connectionOptions)
.then(() => {
  console.log('✅ MongoDB conectado exitosamente');
  console.log(`📊 Base de datos: ${mongoose.connection.name}`);
  console.log(`📋 Colección de usuarios: users (dentro de la base de datos ${mongoose.connection.name})`);
})
.catch(err => {
  console.error('❌ Error de conexión a MongoDB:');
  console.error(err.message);
  if (err.message.includes('authentication failed')) {
    console.error('\n💡 Verifica que el usuario y contraseña en MONGODB_URI sean correctos');
  } else if (err.message.includes('ECONNREFUSED')) {
    console.error('\n💡 Si estás usando MongoDB Atlas, verifica:');
    console.error('   1. Tu IP está en la whitelist de Network Access');
    console.error('   2. La connection string está correctamente formateada');
    console.error('   3. Has reemplazado <password> y <dbname> en la connection string');
  }
  process.exit(1);
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Error interno del servidor' });
});

