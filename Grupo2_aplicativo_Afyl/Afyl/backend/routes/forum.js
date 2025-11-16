const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ForumPost = require('../models/ForumPost');
const ForumReply = require('../models/ForumReply');
const Document = require('../models/Document');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf|doc|docx|xls|xlsx|txt/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 10485760 }, // 10MB
  fileFilter: fileFilter
});

// @route   GET /api/forum/posts
// @desc    Get all forum posts with filters
// @access  Public
router.get('/posts', async (req, res) => {
  try {
    const { category, search, sort = 'newest', page = 1, limit = 20 } = req.query;
    
    const query = {};
    if (category && category !== 'all') {
      query.category = category;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    const sortOptions = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      mostReplied: { replyCount: -1 },
      mostViewed: { views: -1 },
      mostUpvoted: { $expr: { $subtract: [{ $size: '$upvotes' }, { $size: '$downvotes' }] } }
    };

    const posts = await ForumPost.find(query)
      .populate('authorId', 'name email role profilePicture')
      .populate('attachments')
      .sort(sortOptions[sort] || sortOptions.newest)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await ForumPost.countDocuments(query);

    res.json({
      success: true,
      posts,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener posts', error: error.message });
  }
});

// @route   GET /api/forum/posts/:id
// @desc    Get a single forum post by ID
// @access  Public
router.get('/posts/:id', async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id)
      .populate('authorId', 'name email role profilePicture')
      .populate('upvotes', 'name')
      .populate('downvotes', 'name')
      .populate('attachments');

    if (!post) {
      return res.status(404).json({ message: 'Post no encontrado' });
    }

    // Increment views
    post.views += 1;
    await post.save();

    res.json({
      success: true,
      post
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener post', error: error.message });
  }
});

// @route   POST /api/forum/posts
// @desc    Create a new forum post
// @access  Private
router.post('/posts', protect, upload.array('attachments', 5), async (req, res) => {
  try {
    const { title, content, category, tags } = req.body;

    if (!title || !content) {
      // Delete uploaded files if validation fails
      if (req.files && req.files.length > 0) {
        req.files.forEach(file => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
      }
      return res.status(400).json({ message: 'Título y contenido son requeridos' });
    }

    const attachmentIds = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const document = await Document.create({
          caseId: null, // Forum attachments don't need a case
          uploadedBy: req.user._id,
          fileName: file.filename,
          originalName: file.originalname,
          fileType: file.mimetype,
          fileSize: file.size,
          filePath: file.path,
          description: `Adjunto del foro: ${title}`,
          isConfidential: false
        });
        attachmentIds.push(document._id);
      }
    }

    const post = await ForumPost.create({
      title,
      content,
      authorId: req.user._id,
      category: category || 'general',
      tags: tags || [],
      attachments: attachmentIds
    });

    const populatedPost = await ForumPost.findById(post._id)
      .populate('authorId', 'name email role profilePicture')
      .populate('attachments');

    res.status(201).json({
      success: true,
      post: populatedPost
    });
  } catch (error) {
    // Delete uploaded files on error
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }
    res.status(500).json({ message: 'Error al crear post', error: error.message });
  }
});

// @route   PUT /api/forum/posts/:id
// @desc    Update a forum post
// @access  Private
router.put('/posts/:id', protect, async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post no encontrado' });
    }

    // Only author or admin can update
    if (post.authorId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'No autorizado' });
    }

    const { title, content, category, tags, isResolved } = req.body;
    
    if (title) post.title = title;
    if (content) post.content = content;
    if (category) post.category = category;
    if (tags) post.tags = tags;
    if (isResolved !== undefined) post.isResolved = isResolved;

    await post.save();

    const populatedPost = await ForumPost.findById(post._id)
      .populate('authorId', 'name email role profilePicture');

    res.json({
      success: true,
      post: populatedPost
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar post', error: error.message });
  }
});

// @route   DELETE /api/forum/posts/:id
// @desc    Delete a forum post
// @access  Private
router.delete('/posts/:id', protect, async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post no encontrado' });
    }

    // Only author or admin can delete
    if (post.authorId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'No autorizado' });
    }

    // Delete all replies
    await ForumReply.deleteMany({ postId: post._id });

    await post.deleteOne();

    res.json({
      success: true,
      message: 'Post eliminado exitosamente'
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar post', error: error.message });
  }
});

// @route   POST /api/forum/posts/:id/vote
// @desc    Vote on a forum post
// @access  Private
router.post('/posts/:id/vote', protect, async (req, res) => {
  try {
    const { voteType } = req.body; // 'upvote' or 'downvote'
    const post = await ForumPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post no encontrado' });
    }

    const userId = req.user._id;
    const upvoteIndex = post.upvotes.indexOf(userId);
    const downvoteIndex = post.downvotes.indexOf(userId);

    if (voteType === 'upvote') {
      if (upvoteIndex > -1) {
        post.upvotes.splice(upvoteIndex, 1);
      } else {
        if (downvoteIndex > -1) {
          post.downvotes.splice(downvoteIndex, 1);
        }
        post.upvotes.push(userId);
      }
    } else if (voteType === 'downvote') {
      if (downvoteIndex > -1) {
        post.downvotes.splice(downvoteIndex, 1);
      } else {
        if (upvoteIndex > -1) {
          post.upvotes.splice(upvoteIndex, 1);
        }
        post.downvotes.push(userId);
      }
    }

    await post.save();

    res.json({
      success: true,
      post
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al votar', error: error.message });
  }
});

// @route   GET /api/forum/posts/:id/replies
// @desc    Get all replies for a post
// @access  Public
router.get('/posts/:id/replies', async (req, res) => {
  try {
    const replies = await ForumReply.find({ postId: req.params.id })
      .populate('authorId', 'name email role profilePicture')
      .populate('parentReplyId')
      .populate('attachments')
      .sort({ isSolution: -1, createdAt: 1 });

    res.json({
      success: true,
      replies
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener respuestas', error: error.message });
  }
});

// @route   POST /api/forum/posts/:id/replies
// @desc    Create a reply to a post
// @access  Private
router.post('/posts/:id/replies', protect, upload.array('attachments', 5), async (req, res) => {
  try {
    const { content, parentReplyId } = req.body;

    if (!content) {
      // Delete uploaded files if validation fails
      if (req.files && req.files.length > 0) {
        req.files.forEach(file => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
      }
      return res.status(400).json({ message: 'El contenido es requerido' });
    }

    const post = await ForumPost.findById(req.params.id);
    if (!post) {
      // Delete uploaded files if post not found
      if (req.files && req.files.length > 0) {
        req.files.forEach(file => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
      }
      return res.status(404).json({ message: 'Post no encontrado' });
    }

    const attachmentIds = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const document = await Document.create({
          caseId: null,
          uploadedBy: req.user._id,
          fileName: file.filename,
          originalName: file.originalname,
          fileType: file.mimetype,
          fileSize: file.size,
          filePath: file.path,
          description: `Adjunto de respuesta del foro`,
          isConfidential: false
        });
        attachmentIds.push(document._id);
      }
    }

    const reply = await ForumReply.create({
      postId: req.params.id,
      authorId: req.user._id,
      content,
      parentReplyId: parentReplyId || null,
      attachments: attachmentIds
    });

    // Update post reply count and last reply date
    post.replyCount += 1;
    post.lastReplyAt = new Date();
    await post.save();

    const populatedReply = await ForumReply.findById(reply._id)
      .populate('authorId', 'name email role profilePicture')
      .populate('parentReplyId')
      .populate('attachments');

    res.status(201).json({
      success: true,
      reply: populatedReply
    });
  } catch (error) {
    // Delete uploaded files on error
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }
    res.status(500).json({ message: 'Error al crear respuesta', error: error.message });
  }
});

// @route   PUT /api/forum/replies/:id
// @desc    Update a reply
// @access  Private
router.put('/replies/:id', protect, async (req, res) => {
  try {
    const reply = await ForumReply.findById(req.params.id);

    if (!reply) {
      return res.status(404).json({ message: 'Respuesta no encontrada' });
    }

    // Only author or admin can update
    if (reply.authorId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'No autorizado' });
    }

    const { content, isSolution } = req.body;
    if (content) reply.content = content;
    if (isSolution !== undefined && (req.user.role === 'admin' || req.user.role === 'asesor')) {
      reply.isSolution = isSolution;
    }

    await reply.save();

    const populatedReply = await ForumReply.findById(reply._id)
      .populate('authorId', 'name email role profilePicture');

    res.json({
      success: true,
      reply: populatedReply
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar respuesta', error: error.message });
  }
});

// @route   DELETE /api/forum/replies/:id
// @desc    Delete a reply
// @access  Private
router.delete('/replies/:id', protect, async (req, res) => {
  try {
    const reply = await ForumReply.findById(req.params.id);

    if (!reply) {
      return res.status(404).json({ message: 'Respuesta no encontrada' });
    }

    // Only author or admin can delete
    if (reply.authorId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'No autorizado' });
    }

    // Update post reply count
    const post = await ForumPost.findById(reply.postId);
    if (post) {
      post.replyCount = Math.max(0, post.replyCount - 1);
      await post.save();
    }

    await reply.deleteOne();

    res.json({
      success: true,
      message: 'Respuesta eliminada exitosamente'
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar respuesta', error: error.message });
  }
});

// @route   POST /api/forum/replies/:id/vote
// @desc    Vote on a reply
// @access  Private
router.post('/replies/:id/vote', protect, async (req, res) => {
  try {
    const { voteType } = req.body;
    const reply = await ForumReply.findById(req.params.id);

    if (!reply) {
      return res.status(404).json({ message: 'Respuesta no encontrada' });
    }

    const userId = req.user._id;
    const upvoteIndex = reply.upvotes.indexOf(userId);
    const downvoteIndex = reply.downvotes.indexOf(userId);

    if (voteType === 'upvote') {
      if (upvoteIndex > -1) {
        reply.upvotes.splice(upvoteIndex, 1);
      } else {
        if (downvoteIndex > -1) {
          reply.downvotes.splice(downvoteIndex, 1);
        }
        reply.upvotes.push(userId);
      }
    } else if (voteType === 'downvote') {
      if (downvoteIndex > -1) {
        reply.downvotes.splice(downvoteIndex, 1);
      } else {
        if (upvoteIndex > -1) {
          reply.upvotes.splice(upvoteIndex, 1);
        }
        reply.downvotes.push(userId);
      }
    }

    await reply.save();

    res.json({
      success: true,
      reply
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al votar', error: error.message });
  }
});

module.exports = router;

