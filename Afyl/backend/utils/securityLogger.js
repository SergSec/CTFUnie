/**
 * AFYL Security Logger - Blue Team Module
 * Módulo especializado para logging de eventos de seguridad
 */

const fs = require('fs');
const path = require('path');

// Directorio de logs de seguridad
const SECURITY_LOGS_DIR = path.join(__dirname, '../logs/security');

// Asegurar que existe el directorio
if (!fs.existsSync(SECURITY_LOGS_DIR)) {
  fs.mkdirSync(SECURITY_LOGS_DIR, { recursive: true });
}

// Buffer para logs en tiempo real
const securityBuffer = [];

/**
 * Tipos de eventos de seguridad
 */
const SECURITY_EVENT_TYPES = {
  AUTH_SUCCESS: 'AUTH_SUCCESS',
  AUTH_FAILURE: 'AUTH_FAILURE',
  BRUTE_FORCE: 'BRUTE_FORCE',
  NOSQL_INJECTION: 'NOSQL_INJECTION',
  SQL_INJECTION: 'SQL_INJECTION',
  XSS_ATTEMPT: 'XSS_ATTEMPT',
  COMMAND_INJECTION: 'COMMAND_INJECTION',
  PATH_TRAVERSAL: 'PATH_TRAVERSAL',
  FILE_UPLOAD: 'FILE_UPLOAD',
  SUSPICIOUS_FILE: 'SUSPICIOUS_FILE',
  PRIVILEGE_ESCALATION: 'PRIVILEGE_ESCALATION',
  UNAUTHORIZED_ACCESS: 'UNAUTHORIZED_ACCESS',
  SESSION_HIJACK: 'SESSION_HIJACK',
  DDOS_DETECTED: 'DDOS_DETECTED',
  RECONNAISSANCE: 'RECONNAISSANCE',
  WEBSHELL_ATTEMPT: 'WEBSHELL_ATTEMPT',
  TOKEN_MANIPULATION: 'TOKEN_MANIPULATION'
};

/**
 * Severidad de eventos
 */
const SEVERITY = {
  CRITICAL: 'CRITICAL',  // Ataque exitoso, brecha de seguridad
  HIGH: 'HIGH',          // Ataque detectado, potencialmente exitoso
  MEDIUM: 'MEDIUM',      // Intento de ataque bloqueado
  LOW: 'LOW',            // Comportamiento sospechoso
  INFO: 'INFO'           // Información de auditoría
};

/**
 * Log de evento de seguridad
 */
const logSecurityEvent = (eventType, severity, data) => {
  const event = {
    timestamp: new Date().toISOString(),
    eventId: `SEC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: eventType,
    severity,
    ...data,
    // Metadata adicional
    serverTime: Date.now(),
    hostname: require('os').hostname()
  };

  securityBuffer.push(event);

  // Escribir a archivo inmediatamente para eventos críticos
  if (severity === SEVERITY.CRITICAL || severity === SEVERITY.HIGH) {
    appendToSecurityLog(event);
  }

  // Mostrar en consola con formato
  const colors = {
    CRITICAL: '\x1b[41m\x1b[37m',
    HIGH: '\x1b[31m',
    MEDIUM: '\x1b[33m',
    LOW: '\x1b[36m',
    INFO: '\x1b[32m'
  };
  
  console.log(`${colors[severity]}[SECURITY] [${severity}] ${eventType}: ${data.message || JSON.stringify(data)}\x1b[0m`);

  return event;
};

/**
 * Añadir evento al archivo de log
 */
const appendToSecurityLog = (event) => {
  const today = new Date();
  const filename = `security_${today.toISOString().split('T')[0]}.log`;
  const filepath = path.join(SECURITY_LOGS_DIR, filename);
  
  const logLine = JSON.stringify(event) + '\n';
  fs.appendFileSync(filepath, logLine);
};

/**
 * Log de autenticación
 */
const logAuth = (req, success, user = null, additionalInfo = {}) => {
  const ip = req.ip || req.connection?.remoteAddress || 'unknown';
  
  return logSecurityEvent(
    success ? SECURITY_EVENT_TYPES.AUTH_SUCCESS : SECURITY_EVENT_TYPES.AUTH_FAILURE,
    success ? SEVERITY.INFO : SEVERITY.MEDIUM,
    {
      message: success 
        ? `Login exitoso para usuario: ${user?.email || 'unknown'}` 
        : `Intento de login fallido`,
      ip,
      userAgent: req.headers['user-agent'],
      user: user ? { 
        id: user._id?.toString(), 
        email: user.email, 
        role: user.role 
      } : null,
      identifier: req.body?.identifier,
      loginSource: req.body?.loginSource,
      path: req.path,
      method: req.method,
      ...additionalInfo
    }
  );
};

/**
 * Log de inyección detectada
 */
const logInjection = (req, injectionType, payload) => {
  const ip = req.ip || req.connection?.remoteAddress || 'unknown';
  
  return logSecurityEvent(
    injectionType === 'nosql' ? SECURITY_EVENT_TYPES.NOSQL_INJECTION : 
    injectionType === 'sql' ? SECURITY_EVENT_TYPES.SQL_INJECTION :
    injectionType === 'xss' ? SECURITY_EVENT_TYPES.XSS_ATTEMPT :
    injectionType === 'command' ? SECURITY_EVENT_TYPES.COMMAND_INJECTION :
    SECURITY_EVENT_TYPES.SQL_INJECTION,
    SEVERITY.HIGH,
    {
      message: `Intento de ${injectionType.toUpperCase()} Injection detectado`,
      ip,
      userAgent: req.headers['user-agent'],
      path: req.path,
      method: req.method,
      payload: JSON.stringify(payload),
      headers: {
        origin: req.headers.origin,
        referer: req.headers.referer,
        contentType: req.headers['content-type']
      }
    }
  );
};

/**
 * Log de brute force detectado
 */
const logBruteForce = (req, attempts) => {
  const ip = req.ip || req.connection?.remoteAddress || 'unknown';
  
  return logSecurityEvent(
    SECURITY_EVENT_TYPES.BRUTE_FORCE,
    attempts >= 10 ? SEVERITY.CRITICAL : SEVERITY.HIGH,
    {
      message: `Posible ataque de fuerza bruta detectado - ${attempts} intentos fallidos`,
      ip,
      userAgent: req.headers['user-agent'],
      path: req.path,
      attempts,
      recommendation: 'Considerar bloquear IP temporalmente'
    }
  );
};

/**
 * Log de upload de archivo
 */
const logFileUpload = (req, file, suspicious = false) => {
  const ip = req.ip || req.connection?.remoteAddress || 'unknown';
  
  return logSecurityEvent(
    suspicious ? SECURITY_EVENT_TYPES.SUSPICIOUS_FILE : SECURITY_EVENT_TYPES.FILE_UPLOAD,
    suspicious ? SEVERITY.HIGH : SEVERITY.LOW,
    {
      message: suspicious 
        ? `Archivo sospechoso subido: ${file.originalname}` 
        : `Archivo subido: ${file.originalname}`,
      ip,
      userAgent: req.headers['user-agent'],
      path: req.path,
      file: {
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        extension: path.extname(file.originalname).toLowerCase()
      }
    }
  );
};

/**
 * Log de acceso no autorizado
 */
const logUnauthorizedAccess = (req, resource, reason = 'Sin autorización') => {
  const ip = req.ip || req.connection?.remoteAddress || 'unknown';
  
  return logSecurityEvent(
    SECURITY_EVENT_TYPES.UNAUTHORIZED_ACCESS,
    SEVERITY.MEDIUM,
    {
      message: `Acceso no autorizado a: ${resource}`,
      ip,
      userAgent: req.headers['user-agent'],
      path: req.path,
      method: req.method,
      resource,
      reason,
      hasToken: !!req.headers.authorization
    }
  );
};

/**
 * Log de reconocimiento/escaneo
 */
const logReconnaissance = (req, scanType) => {
  const ip = req.ip || req.connection?.remoteAddress || 'unknown';
  
  return logSecurityEvent(
    SECURITY_EVENT_TYPES.RECONNAISSANCE,
    SEVERITY.LOW,
    {
      message: `Posible actividad de reconocimiento: ${scanType}`,
      ip,
      userAgent: req.headers['user-agent'],
      path: req.path,
      method: req.method,
      query: req.query
    }
  );
};

/**
 * Log genérico de ataque
 */
const logAttack = (req, attackType, details = {}) => {
  const ip = req.ip || req.connection?.remoteAddress || 'unknown';
  
  return logSecurityEvent(
    attackType,
    SEVERITY.HIGH,
    {
      message: `Ataque detectado: ${attackType}`,
      ip,
      userAgent: req.headers['user-agent'],
      path: req.path,
      method: req.method,
      fullUrl: req.originalUrl,
      body: req.body,
      query: req.query,
      ...details
    }
  );
};

/**
 * Guardar todos los logs pendientes
 */
const flushSecurityLogs = () => {
  if (securityBuffer.length === 0) return;
  
  const today = new Date();
  const filename = `security_${today.toISOString().split('T')[0]}.log`;
  const filepath = path.join(SECURITY_LOGS_DIR, filename);
  
  const content = securityBuffer.map(e => JSON.stringify(e)).join('\n') + '\n';
  fs.appendFileSync(filepath, content);
  
  console.log(`📝 ${securityBuffer.length} eventos de seguridad guardados en ${filepath}`);
  securityBuffer.length = 0;
};

/**
 * Generar reporte de seguridad
 */
const generateSecurityReport = () => {
  const stats = {
    total: securityBuffer.length,
    bySeverity: {},
    byType: {},
    byIP: {},
    timeline: []
  };

  securityBuffer.forEach(event => {
    // Por severidad
    stats.bySeverity[event.severity] = (stats.bySeverity[event.severity] || 0) + 1;
    
    // Por tipo
    stats.byType[event.type] = (stats.byType[event.type] || 0) + 1;
    
    // Por IP
    if (event.ip) {
      if (!stats.byIP[event.ip]) {
        stats.byIP[event.ip] = { count: 0, events: [] };
      }
      stats.byIP[event.ip].count++;
      stats.byIP[event.ip].events.push(event.type);
    }
  });

  return stats;
};

module.exports = {
  SECURITY_EVENT_TYPES,
  SEVERITY,
  logSecurityEvent,
  logAuth,
  logInjection,
  logBruteForce,
  logFileUpload,
  logUnauthorizedAccess,
  logReconnaissance,
  logAttack,
  flushSecurityLogs,
  generateSecurityReport,
  getSecurityBuffer: () => [...securityBuffer]
};
