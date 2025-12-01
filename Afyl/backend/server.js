const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// ============================================
// SISTEMA DE LOGGING PARA BLUE TEAM
// ============================================
const serverStartTime = new Date();
const logs = [];

// Contadores para estadísticas
const stats = {
  totalRequests: 0,
  byMethod: {},
  byStatus: {},
  byIP: {},
  authAttempts: { success: 0, failed: 0 },
  uploads: 0
};

// Rutas a ignorar (solo assets estáticos del frontend)
const IGNORE_ROUTES = [
  /\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|map)$/i,
  /^\/static\//,
  /^\/favicon\.ico$/,
  /^\/manifest\.json$/
];

// Función para determinar si es una ruta a ignorar
const isStaticAsset = (reqPath, statusCode) => {
  // No ignorar si hay error
  if (statusCode >= 400) return false;
  return IGNORE_ROUTES.some(pattern => pattern.test(reqPath));
};

// Función para agregar log
const addLog = (entry) => {
  logs.push(entry);
  
  // Actualizar estadísticas
  stats.totalRequests++;
  stats.byMethod[entry.method] = (stats.byMethod[entry.method] || 0) + 1;
  stats.byStatus[entry.statusCode] = (stats.byStatus[entry.statusCode] || 0) + 1;
  
  if (entry.ip) {
    if (!stats.byIP[entry.ip]) {
      stats.byIP[entry.ip] = { requests: 0, paths: [] };
    }
    stats.byIP[entry.ip].requests++;
    if (!stats.byIP[entry.ip].paths.includes(entry.path)) {
      stats.byIP[entry.ip].paths.push(entry.path);
    }
  }
  
  // Mostrar en consola
  const statusEmoji = entry.statusCode >= 500 ? '❌' : 
                      entry.statusCode >= 400 ? '⚠️' : 
                      entry.statusCode >= 300 ? '↪️' : '✅';
  
  console.log(`${statusEmoji} [${entry.server}] ${entry.method} ${entry.path} → ${entry.statusCode} (${entry.duration}) | IP: ${entry.ip}`);
  
  // Si hay input, mostrarlo
  if (entry.input && Object.keys(entry.input).length > 0) {
    console.log(`   📥 Input: ${JSON.stringify(entry.input)}`);
  }
};

// Función para guardar logs al archivo
const saveLogs = () => {
  if (logs.length === 0) {
    console.log('📋 No hay logs para guardar');
    return;
  }

  const endTime = new Date();
  const duration = Math.round((endTime - serverStartTime) / 1000);
  
  const day = String(serverStartTime.getDate()).padStart(2, '0');
  const month = String(serverStartTime.getMonth() + 1).padStart(2, '0');
  const year = serverStartTime.getFullYear();
  const hour = String(serverStartTime.getHours()).padStart(2, '0');
  const minute = String(serverStartTime.getMinutes()).padStart(2, '0');
  const logFileName = `logs_${day}-${month}-${year}_${hour}h${minute}m`;
  const logsDir = path.join(__dirname, 'logs');
  
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
  
  // ========== GENERAR TXT ==========
  let txt = '';
  txt += '═'.repeat(100) + '\n';
  txt += '  AFYL - REGISTRO DE ACTIVIDAD\n';
  txt += '═'.repeat(100) + '\n\n';
  
  txt += `📅 Inicio: ${serverStartTime.toISOString()}\n`;
  txt += `📅 Fin: ${endTime.toISOString()}\n`;
  txt += `⏱️  Duración: ${Math.floor(duration / 3600)}h ${Math.floor((duration % 3600) / 60)}m ${duration % 60}s\n`;
  txt += `📊 Total peticiones registradas: ${logs.length}\n\n`;
  
  txt += '─'.repeat(100) + '\n';
  txt += '📈 ESTADÍSTICAS\n';
  txt += '─'.repeat(100) + '\n';
  txt += `Métodos: ${JSON.stringify(stats.byMethod)}\n`;
  txt += `Códigos de respuesta: ${JSON.stringify(stats.byStatus)}\n`;
  txt += `Logins exitosos: ${stats.authAttempts.success} | Fallidos: ${stats.authAttempts.failed}\n`;
  txt += `Archivos subidos: ${stats.uploads}\n\n`;
  
  txt += '─'.repeat(100) + '\n';
  txt += '🌐 ACTIVIDAD POR IP\n';
  txt += '─'.repeat(100) + '\n';
  for (const [ip, data] of Object.entries(stats.byIP)) {
    txt += `  ${ip}: ${data.requests} peticiones\n`;
    if (data.paths.length > 0) {
      txt += `    Rutas: ${data.paths.slice(0, 10).join(', ')}${data.paths.length > 10 ? ' ...' : ''}\n`;
    }
  }
  txt += '\n';
  
  txt += '═'.repeat(100) + '\n';
  txt += '📋 REGISTRO DETALLADO\n';
  txt += '═'.repeat(100) + '\n\n';
  
  logs.forEach((log, i) => {
    const status = log.statusCode >= 500 ? '❌' : log.statusCode >= 400 ? '⚠️' : '✅';
    
    txt += `[${i + 1}] ${log.timestamp}\n`;
    txt += `    ${status} ${log.method} ${log.path} → ${log.statusCode} (${log.duration})\n`;
    txt += `    IP: ${log.ip} | Server: ${log.server}\n`;
    
    if (log.input && Object.keys(log.input).length > 0) {
      txt += `    📥 INPUT: ${JSON.stringify(log.input)}\n`;
    }
    if (log.query && Object.keys(log.query).length > 0) {
      txt += `    🔍 QUERY: ${JSON.stringify(log.query)}\n`;
    }
    if (log.response) {
      const respStr = typeof log.response === 'string' ? log.response : JSON.stringify(log.response);
      txt += `    📤 RESPONSE: ${respStr.substring(0, 300)}${respStr.length > 300 ? '...' : ''}\n`;
    }
    if (log.file) {
      txt += `    📁 FILE: ${JSON.stringify(log.file)}\n`;
    }
    if (log.userAgent) {
      txt += `    🖥️  UA: ${log.userAgent}\n`;
    }
    txt += '\n';
  });
  
  txt += '═'.repeat(100) + '\n';
  txt += '  FIN DEL REGISTRO\n';
  txt += '═'.repeat(100) + '\n';
  
  fs.writeFileSync(path.join(logsDir, logFileName + '.txt'), txt);
  console.log(`\n💾 Log TXT: logs/${logFileName}.txt`);
  
  // ========== GENERAR JSON ==========
  const jsonData = {
    metadata: {
      startTime: serverStartTime.toISOString(),
      endTime: endTime.toISOString(),
      durationSeconds: duration,
      totalEvents: logs.length
    },
    stats,
    events: logs
  };
  
  fs.writeFileSync(path.join(logsDir, logFileName + '.json'), JSON.stringify(jsonData, null, 2));
  console.log(`📊 Log JSON: logs/${logFileName}.json`);
};

// Capturar señales de cierre
process.on('SIGINT', () => {
  console.log('\n🛑 Cerrando servidor...');
  saveLogs();
  process.exit(0);
});

process.on('SIGTERM', () => {
  saveLogs();
  process.exit(0);
});

// ============================================
// APP PRINCIPAL (puertos 3000 y 5000)
// ============================================
const app = express();

// Middleware de logging COMPLETO para app principal
app.use((req, res, next) => {
  const startTime = Date.now();
  
  // Capturar el body original
  let requestBody = {};
  
  // Interceptar respuesta para capturar el body de respuesta
  const originalSend = res.send;
  let responseBody;
  
  res.send = function(body) {
    responseBody = body;
    return originalSend.call(this, body);
  };
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const reqPath = req.path;
    const ip = req.ip || req.connection?.remoteAddress || 'unknown';
    
    // Ignorar assets estáticos con respuesta OK
    if (isStaticAsset(reqPath, res.statusCode)) {
      return;
    }
    
    // Preparar body de entrada (sanitizar passwords)
    let input = {};
    if (req.body && Object.keys(req.body).length > 0) {
      input = { ...req.body };
      if (input.password) input.password = '***';
      if (input.newPassword) input.newPassword = '***';
      if (input.currentPassword) input.currentPassword = '***';
    }
    
    // Preparar respuesta (solo primeros 500 chars si es muy larga)
    let response = null;
    if (responseBody) {
      try {
        if (typeof responseBody === 'string') {
          const parsed = JSON.parse(responseBody);
          response = parsed;
        } else {
          response = responseBody;
        }
        // Limitar tamaño
        const respStr = JSON.stringify(response);
        if (respStr.length > 500) {
          response = { _truncated: true, preview: respStr.substring(0, 500) + '...' };
        }
      } catch(e) {
        if (typeof responseBody === 'string' && responseBody.length < 200) {
          response = responseBody;
        }
      }
    }
    
    // Crear entrada de log
    const logEntry = {
      timestamp: new Date().toISOString(),
      server: 'MAIN:5000',
      method: req.method,
      path: reqPath,
      
      fullUrl: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: ip,
      userAgent: req.headers['user-agent'],
      input: Object.keys(input).length > 0 ? input : undefined,
      query: Object.keys(req.query).length > 0 ? req.query : undefined,
      response: response,
      file: req.file ? {
        name: req.file.originalname,
        type: req.file.mimetype,
        size: req.file.size
      } : undefined
    };
    
    // Actualizar estadísticas de auth
    if (reqPath.includes('/auth/login')) {
      if (res.statusCode === 200) {
        stats.authAttempts.success++;
      } else if (res.statusCode === 401) {
        stats.authAttempts.failed++;
      }
    }
    
    if (req.file) {
      stats.uploads++;
    }
    
    addLog(logEntry);
  });
  
  next();
});

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
// APP VULNERABLE (puerto 6969) - Para pruebas de pentesting
// ============================================
const app6969 = express();

// Middleware de logging COMPLETO para app6969 (servidor vulnerable)
app6969.use((req, res, next) => {
  const startTime = Date.now();
  
  // Interceptar respuesta
  const originalSend = res.send;
  let responseBody;
  
  res.send = function(body) {
    responseBody = body;
    return originalSend.call(this, body);
  };
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const reqPath = req.path;
    const ip = req.ip || req.connection?.remoteAddress || 'unknown';
    
    // Ignorar solo assets estáticos
    if (isStaticAsset(reqPath, res.statusCode)) {
      return;
    }
    
    // Preparar input (mostrar TODO incluyendo passwords en servidor vulnerable)
    let input = {};
    if (req.body && Object.keys(req.body).length > 0) {
      input = { ...req.body };
    }
    
    // Preparar respuesta
    let response = null;
    if (responseBody) {
      try {
        if (typeof responseBody === 'string') {
          const parsed = JSON.parse(responseBody);
          response = parsed;
        } else {
          response = responseBody;
        }
        const respStr = JSON.stringify(response);
        if (respStr.length > 500) {
          response = { _truncated: true, preview: respStr.substring(0, 500) + '...' };
        }
      } catch(e) {
        if (typeof responseBody === 'string' && responseBody.length < 200) {
          response = responseBody;
        }
      }
    }
    
    // Crear entrada de log
    const logEntry = {
      timestamp: new Date().toISOString(),
      server: 'VULN:6969',
      method: req.method,
      path: reqPath,
      fullUrl: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: ip,
      userAgent: req.headers['user-agent'],
      input: Object.keys(input).length > 0 ? input : undefined,
      query: Object.keys(req.query).length > 0 ? req.query : undefined,
      response: response,
      file: req.file ? {
        name: req.file.originalname,
        type: req.file.mimetype,
        size: req.file.size
      } : undefined
    };
    
    // Estadísticas
    if (reqPath.includes('/auth/login')) {
      if (res.statusCode === 200) {
        stats.authAttempts.success++;
      } else if (res.statusCode === 401) {
        stats.authAttempts.failed++;
      }
    }
    
    if (req.file) {
      stats.uploads++;
    }
    
    addLog(logEntry);
  });
  
  next();
});

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
          <h1>Buen intento, pero no...</h1>
          <p class="message">
            Si este servidor fuese <strong>Apache con PHP</strong>, lo que acabas de hacer funcionaría perfectamente...<br><br>
            Pero como nos dais pena  vamos a darte una ruta para que puedas ejecutar comandos y no lloriquees
          </p>
          <a href="/api/shell" class="shell-link"> Ir a la Web Shell</a>
          <p class="hint">También puedes usar directamente: <code>/api/shell/exec?cmd=whoami</code></p>
        </div>
      </body>
      </html>
    `);
  }
  next();
}, express.static(path.join(__dirname, 'public_6969/uploads')));

// Middleware para proteger el blog - requiere autenticación de asesor
app6969.use('/blog.html', (req, res, next) => {
  const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.redirect('/asesor/login?redirect=/blog.html&message=Debes+iniciar+sesión+como+asesor+para+acceder+al+blog');
  }
  
  try {
    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || 'afyl_default_secret_key_change_in_production_2024';
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Verificar que sea asesor o admin
    if (decoded.role !== 'asesor' && decoded.role !== 'admin') {
      return res.status(403).send(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <title>Acceso Denegado - Blog AFYL</title>
          <style>
            body { font-family: Arial, sans-serif; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: #fff; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
            .container { text-align: center; padding: 40px; background: rgba(255,255,255,0.1); border-radius: 15px; }
            h1 { color: #ff6b6b; }
            p { color: #ccc; margin: 20px 0; }
            a { color: #4ecdc4; text-decoration: none; padding: 10px 20px; border: 2px solid #4ecdc4; border-radius: 5px; display: inline-block; margin-top: 20px; }
            a:hover { background: #4ecdc4; color: #1a1a2e; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🚫 Acceso Denegado</h1>
            <p>El blog legal está disponible exclusivamente para asesores.</p>
            <p>Tu rol actual: <strong>${decoded.role}</strong></p>
            <a href="/asesor/login">Iniciar sesión como Asesor</a>
          </div>
        </body>
        </html>
      `);
    }
    
    // Usuario es asesor o admin, continuar
    next();
  } catch (error) {
    return res.redirect('/asesor/login?redirect=/blog.html&message=Sesión+inválida+o+expirada');
  }
});

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
  console.log(`🔗 API: http://localhost:${PORT}/api`);
});

// Servidor vulnerable
app6969.listen(PORT_VULNERABLE, () => {
  console.log(`🔴 Servidor VULNERABLE en puerto ${PORT_VULNERABLE}`);
});