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
// Enable CORS para permitir conexiones desde cualquier origen (red local)
app.use(cors({ 
  origin: true,  // Permite cualquier origen
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
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
app6969.use(cors({ 
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app6969.use(express.json());
app6969.use(cookieParser());
app6969.use(express.urlencoded({ extended: true }));

// Middleware para interceptar archivos .php y mostrar mensaje custom
app6969.use('/uploads', (req, res, next) => {
  if (req.path.endsWith('.php')) {
    return res.send(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Buen intento... - AFYL</title>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body { 
            font-family: 'Poppins', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            min-height: 100vh;
            color: #fff;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
          }
          .container { 
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            padding: 40px;
            border-radius: 15px;
            max-width: 600px;
            text-align: center;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          }
          h1 { 
            color: #4fc3f7; 
            margin-bottom: 20px;
            font-size: 1.8em;
          }
          .message { 
            color: #ccc; 
            font-size: 1em; 
            line-height: 1.8;
            margin-bottom: 25px;
          }
          .message strong {
            color: #4fc3f7;
          }
          .file { 
            color: #888; 
            margin: 15px 0;
            padding: 10px;
            background: rgba(0,0,0,0.3);
            border-radius: 8px;
            font-family: monospace;
          }
          .gift { 
            color: #d4af37;
            font-size: 1.3em;
            margin: 25px 0 15px 0;
            font-weight: 600;
          }
          .shell-link {
            display: inline-block;
            background: linear-gradient(135deg, #4fc3f7 0%, #29b6f6 100%);
            color: #000;
            padding: 15px 35px;
            text-decoration: none;
            font-weight: 600;
            font-size: 1em;
            border-radius: 8px;
            margin-top: 10px;
            transition: all 0.3s ease;
          }
          .shell-link:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(79, 195, 247, 0.4);
          }
          .hint { 
            color: #666; 
            font-size: 0.85em; 
            margin-top: 25px;
          }
          .hint code {
            background: rgba(79, 195, 247, 0.2);
            color: #4fc3f7;
            padding: 3px 8px;
            border-radius: 4px;
            font-family: monospace;
          }
          .emoji {
            font-size: 3em;
            margin-bottom: 15px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="emoji">😢</div>
          <h1>Buen intento, pero no...</h1>
          <p class="file">📁 ${req.path}</p>
          <p class="message">
            Si este servidor fuese <strong>Apache con PHP</strong>, lo que acabas de hacer funcionaría perfectamente...<br><br>
            Pero como nos das un poco de pena 🥺, vamos a darte una ruta para que puedas ejecutar comandos de verdad:
          </p>
          <p class="gift">🎁 ¡Regalo especial para ti!</p>
          <a href="/api/shell" class="shell-link">🐚 Ir a la Web Shell</a>
          <p class="hint">También puedes usar directamente: <code>/api/shell/exec?cmd=whoami</code></p>
        </div>
      </body>
      </html>
    `);
  }
  next();
}, express.static(path.join(__dirname, 'public_6969/uploads')));

// Servir archivos estáticos exclusivos del puerto 6969
app6969.use(express.static(path.join(__dirname, 'public_6969')));

// Servir carpeta images desde la raíz del proyecto
app6969.use('/images', express.static(path.join(__dirname, '../images')));

// Routes VULNERABLES para el puerto 6969
app6969.use('/api/auth', require('./routes/auth'));
app6969.use('/api/users', require('./routes/users'));
app6969.use('/api/cases', require('./routes/cases'));
app6969.use('/api/documents', require('./routes/documents'));
app6969.use('/api/appointments', require('./routes/appointments'));
app6969.use('/api/payments', require('./routes/payments'));
app6969.use('/api/messages', require('./routes/messages'));
app6969.use('/api/chatbot', require('./routes/chatbot6969')); // Chatbot vulnerable
app6969.use('/api/blog', require('./routes/blog6969')); // Blog vulnerable a XSS
app6969.use('/api/services', require('./routes/services'));
app6969.use('/api/consultations', require('./routes/consultations'));
app6969.use('/api/wallet', require('./routes/wallet'));
app6969.use('/api/upload-admin', require('./routes/upload6969')); // Subida vulnerable
app6969.use('/api/files', require('./routes/files6969')); // Path Traversal vulnerable
app6969.use('/api/shell', require('./routes/shell6969')); // Web Shell - Command Injection
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
const PORT_VULNERABLE = 6969;

app.listen(PORT, () => {
  console.log(`🟢 Servidor AFYL iniciado en puerto ${PORT}`);
  console.log(`📱 Frontend: http://localhost:${PORT}`);
  console.log(`� API: http://localhost:${PORT}/api`);
});

// Servidor vulnerable - Sin logs para que sea necesario descubrirlo con nmap
app6969.listen(PORT_VULNERABLE, () => {
  // No mostrar nada en consola - puerto oculto
});