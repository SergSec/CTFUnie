const express = require('express');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// ============================================
// VULNERABILIDADES DE PATH TRAVERSAL
// Solo para pruebas de pentesting en puerto 6969
// ============================================

// @route   GET /api/files/read
// @desc    Lee un archivo del servidor (VULNERABLE A PATH TRAVERSAL)
// @access  Public (VULNERABLE)
// Ejemplo de ataque: /api/files/read?file=../../../etc/passwd
//                    /api/files/read?file=....//....//....//windows/system32/drivers/etc/hosts
router.get('/read', (req, res) => {
    try {
        const filename = req.query.file;
        
        if (!filename) {
            return res.status(400).json({ 
                message: 'Parámetro "file" requerido',
                hint: 'Usa ?file=nombre_archivo.txt'
            });
        }

        // VULNERABLE: No se sanitiza el path - permite ../../../
        const baseDir = path.join(__dirname, '../public_6969/uploads');
        const filePath = path.join(baseDir, filename);
        
        // VULNERABLE: No se verifica si el path resultante está dentro del directorio permitido
        console.log(`[VULNERABLE] Intentando leer: ${filePath}`);

        if (fs.existsSync(filePath)) {
            const stats = fs.statSync(filePath);
            
            if (stats.isDirectory()) {
                // Si es directorio, listar contenido (también vulnerable)
                const files = fs.readdirSync(filePath);
                return res.json({
                    type: 'directory',
                    path: filePath,
                    contents: files
                });
            }
            
            const content = fs.readFileSync(filePath, 'utf8');
            res.json({
                success: true,
                path: filePath,
                content: content,
                size: stats.size
            });
        } else {
            res.status(404).json({ 
                message: 'Archivo no encontrado',
                attemptedPath: filePath
            });
        }
    } catch (error) {
        console.error('Error leyendo archivo:', error);
        res.status(500).json({ 
            message: 'Error al leer el archivo',
            error: error.message 
        });
    }
});

// @route   GET /api/files/download
// @desc    Descarga un archivo del servidor (VULNERABLE A PATH TRAVERSAL)
// @access  Public (VULNERABLE)
router.get('/download', (req, res) => {
    try {
        const filename = req.query.file;
        
        if (!filename) {
            return res.status(400).json({ 
                message: 'Parámetro "file" requerido' 
            });
        }

        // VULNERABLE: Path traversal sin sanitización
        const baseDir = path.join(__dirname, '../public_6969/uploads');
        const filePath = path.join(baseDir, filename);

        console.log(`[VULNERABLE] Intentando descargar: ${filePath}`);

        if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
            res.download(filePath);
        } else {
            res.status(404).json({ message: 'Archivo no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error al descargar el archivo' });
    }
});

// @route   POST /api/files/write
// @desc    Escribe un archivo en el servidor (VULNERABLE A PATH TRAVERSAL)
// @access  Public (VULNERABLE)
// Permite escribir archivos en cualquier ubicación accesible
router.post('/write', (req, res) => {
    try {
        const { filename, content } = req.body;
        
        if (!filename || content === undefined) {
            return res.status(400).json({ 
                message: 'Se requieren "filename" y "content"' 
            });
        }

        // VULNERABLE: Path traversal - puede escribir fuera del directorio
        const baseDir = path.join(__dirname, '../public_6969/uploads');
        const filePath = path.join(baseDir, filename);

        console.log(`[VULNERABLE] Intentando escribir en: ${filePath}`);

        // Crear directorios si no existen (aumenta el impacto de la vulnerabilidad)
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(filePath, content);
        
        res.json({
            success: true,
            message: 'Archivo escrito correctamente',
            path: filePath,
            size: Buffer.byteLength(content, 'utf8')
        });
    } catch (error) {
        console.error('Error escribiendo archivo:', error);
        res.status(500).json({ 
            message: 'Error al escribir el archivo',
            error: error.message 
        });
    }
});

// @route   DELETE /api/files/delete
// @desc    Elimina un archivo del servidor (VULNERABLE A PATH TRAVERSAL)
// @access  Public (VULNERABLE)
router.delete('/delete', (req, res) => {
    try {
        const filename = req.query.file;
        
        if (!filename) {
            return res.status(400).json({ 
                message: 'Parámetro "file" requerido' 
            });
        }

        // VULNERABLE: Path traversal sin validación
        const baseDir = path.join(__dirname, '../public_6969/uploads');
        const filePath = path.join(baseDir, filename);

        console.log(`[VULNERABLE] Intentando eliminar: ${filePath}`);

        if (fs.existsSync(filePath)) {
            const stats = fs.statSync(filePath);
            
            if (stats.isDirectory()) {
                fs.rmdirSync(filePath, { recursive: true });
            } else {
                fs.unlinkSync(filePath);
            }
            
            res.json({
                success: true,
                message: 'Archivo/directorio eliminado',
                path: filePath
            });
        } else {
            res.status(404).json({ message: 'Archivo no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ 
            message: 'Error al eliminar',
            error: error.message 
        });
    }
});

// @route   GET /api/files/list
// @desc    Lista archivos de un directorio (VULNERABLE A PATH TRAVERSAL)
// @access  Public (VULNERABLE)
router.get('/list', (req, res) => {
    try {
        const dir = req.query.dir || '';
        
        // VULNERABLE: Permite listar cualquier directorio
        const baseDir = path.join(__dirname, '../public_6969/uploads');
        const targetDir = path.join(baseDir, dir);

        console.log(`[VULNERABLE] Listando directorio: ${targetDir}`);

        if (fs.existsSync(targetDir) && fs.statSync(targetDir).isDirectory()) {
            const files = fs.readdirSync(targetDir).map(file => {
                const fullPath = path.join(targetDir, file);
                const stats = fs.statSync(fullPath);
                return {
                    name: file,
                    type: stats.isDirectory() ? 'directory' : 'file',
                    size: stats.size,
                    modified: stats.mtime
                };
            });
            
            res.json({
                directory: targetDir,
                files: files
            });
        } else {
            res.status(404).json({ 
                message: 'Directorio no encontrado',
                attemptedPath: targetDir
            });
        }
    } catch (error) {
        res.status(500).json({ 
            message: 'Error al listar directorio',
            error: error.message 
        });
    }
});

// @route   GET /api/files/info
// @desc    Información sobre cómo explotar las vulnerabilidades
// @access  Public
router.get('/info', (req, res) => {
    res.json({
        warning: '⚠️ ENDPOINTS VULNERABLES A PATH TRAVERSAL - SOLO PARA PENTESTING',
        endpoints: {
            read: {
                method: 'GET',
                path: '/api/files/read?file=<filename>',
                description: 'Lee contenido de archivos',
                examples: [
                    '/api/files/read?file=../server.js',
                    '/api/files/read?file=../../../etc/passwd',
                    '/api/files/read?file=..\\..\\..\\windows\\system32\\drivers\\etc\\hosts'
                ]
            },
            download: {
                method: 'GET',
                path: '/api/files/download?file=<filename>',
                description: 'Descarga archivos del servidor',
                examples: [
                    '/api/files/download?file=../.env',
                    '/api/files/download?file=../package.json'
                ]
            },
            write: {
                method: 'POST',
                path: '/api/files/write',
                body: { filename: 'string', content: 'string' },
                description: 'Escribe archivos en el servidor',
                examples: [
                    { filename: '../malicious.js', content: 'console.log("pwned")' },
                    { filename: '../../public_6969/shell.html', content: '<script>alert("XSS")</script>' }
                ]
            },
            delete: {
                method: 'DELETE',
                path: '/api/files/delete?file=<filename>',
                description: 'Elimina archivos del servidor'
            },
            list: {
                method: 'GET',
                path: '/api/files/list?dir=<directory>',
                description: 'Lista contenido de directorios',
                examples: [
                    '/api/files/list?dir=../',
                    '/api/files/list?dir=../../',
                    '/api/files/list?dir=../../../'
                ]
            }
        }
    });
});

module.exports = router;
