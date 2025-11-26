const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config();

// ============================================
// APP PRINCIPAL (puertos 3000 y 5000)
// ============================================
const app = express();

// Middleware
// Enable CORS with credentials to allow cookie-based auth from frontend
app.use(cors({ origin: process.env.FRONTEND_URL || true, credentials: true }));
app.use(express.json());
app.use(cookieParser());
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
// Calendly se deshabilita temporalmente mientras usamos el calendario interno
// app.use('/api/calendly', require('./routes/calendly'));
app.use('/api/services', require('./routes/services'));
app.use('/api/conflicts', require('./routes/conflicts'));
app.use('/api/consultations', require('./routes/consultations'));
app.use('/api/wallet', require('./routes/wallet'));
// Development routes (ONLY FOR PENTESTING/DEV)
if (process.env.NODE_ENV !== 'production') {
  app.use('/api/dev', require('./routes/dev'));
}

// Servir el frontend (archivos estáticos de React)
const frontendBuildPath = path.join(__dirname, '../frontend/build');
app.use(express.static(frontendBuildPath));

// Para cualquier ruta que no sea /api, servir el index.html del frontend
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
    return next();
  }
  res.sendFile(path.join(frontendBuildPath, 'index.html'));
});

// Error handling middleware para app principal
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Error interno del servidor' });
});

// ============================================
// APP VULNERABLE (puerto 6969) - Para pruebas
// ============================================
const app6969 = express();

// Middleware para app6969
app6969.use(cors({ origin: process.env.FRONTEND_URL || true, credentials: true }));
app6969.use(express.json());
app6969.use(cookieParser());
app6969.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app6969.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Servir archivos estáticos exclusivos del puerto 6969
app6969.use(express.static(path.join(__dirname, 'public_6969')));

// Servir carpeta images desde la raíz del proyecto
app6969.use('/images', express.static(path.join(__dirname, '../images')));

// Routes (mismas rutas por ahora, se pueden modificar independientemente)
app6969.use('/api/auth', require('./routes/auth'));
app6969.use('/api/users', require('./routes/users'));
app6969.use('/api/cases', require('./routes/cases'));
app6969.use('/api/documents', require('./routes/documents'));
app6969.use('/api/appointments', require('./routes/appointments'));
app6969.use('/api/payments', require('./routes/payments'));
app6969.use('/api/messages', require('./routes/messages'));
app6969.use('/api/chatbot', require('./routes/chatbot'));
app6969.use('/api/services', require('./routes/services'));
app6969.use('/api/consultations', require('./routes/consultations'));
app6969.use('/api/wallet', require('./routes/wallet'));
if (process.env.NODE_ENV !== 'production') {
  app6969.use('/api/dev', require('./routes/dev'));
}

// Servir el frontend en app6969
app6969.use(express.static(frontendBuildPath));
app6969.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
    return next();
  }
  res.sendFile(path.join(frontendBuildPath, 'index.html'));
});

// Error handling middleware para app6969
app6969.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Error interno del servidor' });
});

// ============================================
// MongoDB Connection
// ============================================
const mongoURI = process.env.MONGODB_URI;

if (!mongoURI) {
  console.error('❌ ERROR: MONGODB_URI no está definido en el archivo .env');
  console.error('Por favor, crea el archivo backend/.env con tu connection string de MongoDB Atlas');
  process.exit(1);
}

const connectionOptions = {
  dbName: 'Afyl'
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

// ============================================
// Iniciar servidores
// ============================================
const PORT = process.env.PORT || 5000;
const PORT_6969 = 6969;

app.listen(PORT, () => {
  console.log(`🟢 App principal corriendo en puerto ${PORT}`);
});

app6969.listen(PORT_6969, () => {
  console.log(`🔴 App vulnerable (6969) corriendo en puerto ${PORT_6969}`);
});