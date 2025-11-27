const express = require('express');
// VULNERABLE: Sin sanitización para pruebas de XSS
const router = express.Router();

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
// @access  Public (VULNERABLE)
router.get('/', (req, res) => {
  res.json({
    success: true,
    posts: blogPosts
  });
});

// @route   GET /api/blog/:id
// @desc    Obtener un post específico
// @access  Public (VULNERABLE)
router.get('/:id', (req, res) => {
  const post = blogPosts.find(p => p.id === parseInt(req.params.id));
  if (!post) {
    return res.status(404).json({ message: 'Post no encontrado' });
  }
  res.json({
    success: true,
    post
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

module.exports = router;
