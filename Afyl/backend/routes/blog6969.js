const express = require('express');
const vm = require('vm');
// VULNERABLE: Sin sanitización para pruebas de XSS y SSTI
const router = express.Router();

// ============================================
// VULNERABILIDADES: XSS + SSTI
// Solo para pruebas de pentesting en puerto 6969
// ============================================

// Función de template simple VULNERABLE A SSTI
function renderTemplate(template, data) {
  // VULNERABLE: Evalúa expresiones dentro de {{ }}
  return template.replace(/\{\{(.+?)\}\}/g, (match, code) => {
    try {
      // VULNERABLE: Ejecución directa de código
      const context = vm.createContext({ ...data, require, process, global });
      return vm.runInContext(code.trim(), context);
    } catch (e) {
      return match;
    }
  });
}

// Almacenamiento en memoria de posts del blog (vulnerable)
let blogPosts = [
  {
    id: 1,
    title: 'Bienvenidos al Blog Legal',
    content: 'Este es nuestro primer post del blog. ¡Comparte tus experiencias!',
    author: 'Admin',
    createdAt: new Date('2025-01-01')
  },
  {
    id: 2,
    title: 'Consejos legales básicos',
    content: 'Siempre guarda copias de tus documentos importantes.',
    author: 'Asesor Legal',
    createdAt: new Date('2025-01-15')
  }
];

let nextId = 3;

// @route   GET /api/blog
// @desc    Obtener todos los posts del blog
// @access  Public (VULNERABLE A SSTI)
router.get('/', (req, res) => {
  // VULNERABLE: Renderiza el contenido de cada post con el motor de plantillas
  const renderedPosts = blogPosts.map(post => ({
    ...post,
    title: renderTemplate(post.title, {}),
    content: renderTemplate(post.content, {}),
    author: renderTemplate(post.author, {})
  }));

  res.json({
    success: true,
    posts: renderedPosts
  });
});

// @route   GET /api/blog/:id
// @desc    Obtener un post específico
// @access  Public (VULNERABLE A SSTI)
router.get('/:id', (req, res) => {
  const post = blogPosts.find(p => p.id === parseInt(req.params.id));
  if (!post) {
    return res.status(404).json({ message: 'Post no encontrado' });
  }
  
  // VULNERABLE: Renderiza el contenido con el motor de plantillas
  const renderedPost = {
    ...post,
    title: renderTemplate(post.title, {}),
    content: renderTemplate(post.content, {}),
    author: renderTemplate(post.author, {})
  };

  res.json({
    success: true,
    post: renderedPost
  });
});

// @route   POST /api/blog
// @desc    Crear un nuevo post - VULNERABLE A XSS (sin sanitización)
// @access  Public (VULNERABLE)
router.post('/', (req, res) => {
  const { title, content, author } = req.body;

  if (!title || !content) {
    return res.status(400).json({ message: 'Título y contenido son requeridos' });
  }

  // VULNERABLE: No se sanitiza el input - permite XSS
  const newPost = {
    id: nextId++,
    title: title,           // Sin sanitización
    content: content,       // Sin sanitización
    author: author || 'Anónimo',  // Sin sanitización
    createdAt: new Date()
  };

  blogPosts.push(newPost);

  res.status(201).json({
    success: true,
    message: 'Post creado exitosamente',
    post: newPost
  });
});

// @route   GET /api/blog/search
// @desc    Buscar posts - VULNERABLE A XSS REFLEJADO
// @access  Public (VULNERABLE)
router.get('/search/query', (req, res) => {
  const { q } = req.query;
  
  // VULNERABLE: El término de búsqueda se refleja sin sanitizar
  const results = blogPosts.filter(post => 
    post.title.toLowerCase().includes((q || '').toLowerCase()) ||
    post.content.toLowerCase().includes((q || '').toLowerCase())
  );

  res.json({
    success: true,
    searchTerm: q,  // VULNERABLE: Reflejado sin sanitizar
    resultsCount: results.length,
    posts: results
  });
});

// @route   DELETE /api/blog/:id
// @desc    Eliminar un post
// @access  Public (VULNERABLE - sin autenticación)
router.delete('/:id', (req, res) => {
  const index = blogPosts.findIndex(p => p.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ message: 'Post no encontrado' });
  }
  
  blogPosts.splice(index, 1);
  res.json({
    success: true,
    message: 'Post eliminado'
  });
});

// @route   DELETE /api/blog
// @desc    Eliminar TODOS los posts (para limpiar XSS)
// @access  Public (VULNERABLE)
router.delete('/', (req, res) => {
  blogPosts = [];
  nextId = 1;
  res.json({
    success: true,
    message: 'Todos los posts eliminados'
  });
});

// ============================================
// SSTI - SERVER SIDE TEMPLATE INJECTION
// ============================================

// @route   GET /api/blog/preview
// @desc    Preview de post con plantilla - VULNERABLE A SSTI
// @access  Public (VULNERABLE)
router.get('/preview', (req, res) => {
  const { template } = req.query;
  
  if (!template) {
    return res.status(400).json({ 
      message: 'Parámetro "template" requerido',
      hint: 'Usa ?template=Hola {{name}}',
      example: '/api/blog/preview?template=Hola {{name}}&name=Usuario',
      vulnerability: 'Prueba: ?template={{7*7}} o ?template={{process.env}}'
    });
  }

  // Recoger todos los parámetros como datos del template
  const data = { ...req.query };
  delete data.template;

  // VULNERABLE: Renderiza el template sin sanitizar
  const rendered = renderTemplate(template, data);

  res.json({
    success: true,
    original: template,
    rendered: rendered,
    data: data
  });
});

// @route   POST /api/blog/preview
// @desc    Preview de post con plantilla via POST - VULNERABLE A SSTI
// @access  Public (VULNERABLE)
router.post('/preview', (req, res) => {
  const { template, data } = req.body;
  
  if (!template) {
    return res.status(400).json({ 
      message: 'Campo "template" requerido en el body',
      example: {
        template: 'Hola {{name}}, tu edad es {{age}}',
        data: { name: 'Usuario', age: 25 }
      },
      vulnerability: 'Prueba template: {{7*7}} o {{process.cwd()}}'
    });
  }

  // VULNERABLE: Renderiza el template sin sanitizar
  const rendered = renderTemplate(template, data || {});

  res.json({
    success: true,
    original: template,
    rendered: rendered,
    data: data
  });
});

// @route   GET /api/blog/render/:id
// @desc    Renderizar un post existente con template personalizado - VULNERABLE A SSTI
// @access  Public (VULNERABLE)
router.get('/render/:id', (req, res) => {
  const post = blogPosts.find(p => p.id === parseInt(req.params.id));
  
  if (!post) {
    return res.status(404).json({ message: 'Post no encontrado' });
  }

  const { format } = req.query;
  
  // Template por defecto o personalizado
  const template = format || '<h1>{{title}}</h1><p>{{content}}</p><small>Por: {{author}}</small>';
  
  // VULNERABLE: Permite inyección en el parámetro format
  const rendered = renderTemplate(template, post);

  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${post.title}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; background: #1a1a2e; color: #fff; }
        h1 { color: #4fc3f7; }
        .warning { background: rgba(255,107,107,0.1); border: 1px solid #ff6b6b; padding: 10px; margin-top: 20px; border-radius: 5px; color: #ff6b6b; }
      </style>
    </head>
    <body>
      ${rendered}
      <div class="warning">⚠️ Este endpoint es vulnerable a SSTI - Prueba: ?format={{7*7}}</div>
    </body>
    </html>
  `);
});

module.exports = router;
