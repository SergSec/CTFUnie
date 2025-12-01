const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const securityLogger = require('../utils/securityLogger');

const router = express.Router();

// Extensiones sospechosas para detectar webshells
const SUSPICIOUS_EXTENSIONS = ['.php', '.php3', '.php4', '.php5', '.phtml', '.asp', '.aspx', '.jsp', '.jspx', '.cgi', '.pl', '.py', '.rb', '.sh', '.bat', '.exe', '.dll', '.com'];

// Directorio de subida vulnerable - permite ejecución
const uploadDir = path.join(__dirname, '../public_6969/uploads');

// Crear directorio si no existe
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuración de multer SIN validación de tipo de archivo (VULNERABLE)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Mantener el nombre original del archivo (VULNERABLE - permite .php, .jsp, .asp, etc.)
        cb(null, file.originalname);
    }
});

// Sin filtro de archivos - acepta cualquier tipo (VULNERABLE)
const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB
    }
});

// @route   POST /api/upload-admin
// @desc    Upload any file (VULNERABLE - no authentication, no file type validation)
// @access  Public (VULNERABLE)
router.post('/', upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No se ha proporcionado ningún archivo' });
        }

        const filePath = `/uploads/${req.file.filename}`;
        const fullPath = path.join(uploadDir, req.file.filename);
        const extension = path.extname(req.file.filename).toLowerCase();
        const isSuspicious = SUSPICIOUS_EXTENSIONS.includes(extension);

        // 🚨 LOG: Subida de archivo
        securityLogger.logFileUpload(req, req.file, isSuspicious);

        // Si es un archivo sospechoso (posible webshell), log adicional
        if (isSuspicious) {
            securityLogger.logSecurityEvent(
                securityLogger.SECURITY_EVENT_TYPES.WEBSHELL_ATTEMPT,
                securityLogger.SEVERITY.CRITICAL,
                {
                    message: `🚨 POSIBLE WEBSHELL SUBIDO: ${req.file.originalname}`,
                    ip: req.ip || req.connection?.remoteAddress,
                    userAgent: req.headers['user-agent'],
                    file: {
                        originalName: req.file.originalname,
                        savedAs: req.file.filename,
                        mimeType: req.file.mimetype,
                        size: req.file.size,
                        extension: extension,
                        path: fullPath
                    }
                }
            );
        }

        res.json({
            success: true,
            message: 'Archivo subido correctamente',
            filePath: fullPath,
            url: filePath,
            filename: req.file.filename,
            size: req.file.size,
            mimetype: req.file.mimetype
        });
    } catch (error) {
        console.error('Error al subir archivo:', error);
        res.status(500).json({ message: 'Error al subir el archivo' });
    }
});

// @route   GET /api/upload-admin/list
// @desc    List uploaded files (VULNERABLE - exposes file list)
// @access  Public (VULNERABLE)
router.get('/list', (req, res) => {
    try {
        const files = fs.readdirSync(uploadDir).map(file => {
            const stats = fs.statSync(path.join(uploadDir, file));
            return {
                name: file,
                size: stats.size,
                modified: stats.mtime,
                url: `/uploads/${file}`
            };
        });
        res.json({ files });
    } catch (error) {
        res.status(500).json({ message: 'Error al listar archivos' });
    }
});

module.exports = router;
