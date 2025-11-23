const AuditLog = require('../models/AuditLog');

/**
 * Registra una acción realizada sobre un caso concreto
 * @param {Object} options
 * @param {Object} options.req Express request (para user e IP)
 * @param {String|ObjectId} options.caseId ID del caso afectado
 * @param {String} options.action Acción ejecutada (ej. case_created)
 * @param {Object} [options.details] Datos adicionales guardados en el log
 */
async function logCaseAction({ req, caseId, action, details = {} }) {
  try {
    await AuditLog.create({
      userId: req.user?._id || null,
      action,
      entityType: 'case',
      entityId: caseId,
      details,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] || null,
    });
  } catch (error) {
    console.error('Error registrando log de caso:', error.message);
  }
}

module.exports = {
  logCaseAction,
};

